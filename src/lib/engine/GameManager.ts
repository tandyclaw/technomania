/**
 * GameManager.ts — Game state initialization, reset, and lifecycle management
 * Ties together GameLoop, SaveManager, EventBus, and GameState
 */

import { get } from 'svelte/store';
import { gameState, createDefaultState, type GameState } from '$lib/stores/gameState';
import { gameLoop } from './GameLoop';
import { saveGame, loadGame, deleteSave } from './SaveManager';
import { eventBus } from './EventBus';
import { calculateOfflineProgress, applyOfflineReport, type OfflineReport } from './OfflineCalculator';
import { flashSaveIndicator, saveStatus } from '$lib/stores/saveIndicator';
import { tickProduction } from './ProductionEngine';

/** Current save version — increment when state schema changes */
const CURRENT_VERSION = 2;

/** Auto-save interval in milliseconds */
const AUTO_SAVE_INTERVAL_MS = 30_000;

/** Maximum offline time in ms (8 hours) */
const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;

class GameManager {
	private autoSaveTimer: ReturnType<typeof setInterval> | null = null;
	private initialized = false;
	private boundBeforeUnload: (() => void) | null = null;
	private boundVisibilityChange: (() => void) | null = null;

	/**
	 * Initialize the game — load saved state or create new, start systems
	 * Call this once when the game view mounts
	 */
	async initialize(): Promise<{ isNewGame: boolean; offlineMs: number; offlineReport: OfflineReport | null }> {
		if (this.initialized || typeof window === 'undefined') {
			return { isNewGame: false, offlineMs: 0, offlineReport: null };
		}

		let isNewGame = false;
		let offlineMs = 0;
		let offlineReport: OfflineReport | null = null;

		// Try loading saved state (with corrupted save handling + timeout)
		let savedState: GameState | null = null;
		try {
			// Wrap loadGame in a timeout to prevent infinite hang on blocked DB
			savedState = await Promise.race([
				loadGame(),
				new Promise<null>((resolve) => setTimeout(() => {
					console.warn('[GameManager] Load timed out — starting fresh');
					resolve(null);
				}, 5000))
			]);
			// Validate the loaded state has required structure
			if (savedState && !this.isValidState(savedState)) {
				console.warn('[GameManager] Corrupted save detected — resetting to default');
				try { await deleteSave(); } catch { /* ignore timeout */ }
				savedState = null;
			}
		} catch (err) {
			console.warn('[GameManager] Failed to load save — resetting to default:', err);
			try { await deleteSave(); } catch { /* ignore */ }
			savedState = null;
		}

		if (savedState) {
			// Migrate if needed
			const migrated = this.migrateState(savedState);

			// Calculate offline time
			const now = Date.now();
			offlineMs = Math.min(now - migrated.lastPlayed, MAX_OFFLINE_MS);

			// Update play tracking
			migrated.lastPlayed = now;
			migrated.stats.sessionsPlayed += 1;

			// Calculate and apply offline progress if enabled and meaningful (> 60s)
			if (migrated.settings.offlineProgressEnabled && offlineMs > 60_000) {
				const prestigeMult = this.getPrestigeMultiplier(migrated);
				offlineReport = calculateOfflineProgress(migrated, offlineMs, prestigeMult);
				applyOfflineReport(migrated, offlineReport);
			}

			// Apply loaded state
			gameState.set(migrated);
		} else {
			// New game — start fresh
			isNewGame = true;
			const freshState = createDefaultState();
			freshState.stats.sessionsPlayed = 1;

			// Unlock Tesla Energy by default (foundation division)
			freshState.divisions.teslaenergy.unlocked = true;

			gameState.set(freshState);
		}

		// Start systems
		this.startAutoSave();
		this.addBrowserListeners();
		gameLoop.start();

		// Wire up game tick to update play time and tick production
		let playTimeAccumulator = 0;
		gameLoop.onTick((deltaMs) => {
			// Tick production engine every tick (100ms) for smooth progress bars
			tickProduction(deltaMs);

			// Update play time only every ~1s to reduce store churn
			playTimeAccumulator += deltaMs;
			if (playTimeAccumulator >= 1000) {
				const elapsed = playTimeAccumulator;
				playTimeAccumulator = 0;
				gameState.update((s) => ({
					...s,
					stats: { ...s.stats, playTimeMs: s.stats.playTimeMs + elapsed }
				}));
			}
		});

		this.initialized = true;
		eventBus.emit('save:loaded', {});

		return { isNewGame, offlineMs, offlineReport };
	}

	/**
	 * Shutdown the game — stop loop, save, clean up
	 * Call this when the game view unmounts
	 */
	async shutdown(): Promise<void> {
		if (typeof window === 'undefined') return;
		gameLoop.stop();
		this.stopAutoSave();
		this.removeBrowserListeners();
		await this.save();
		this.initialized = false;
	}

	/**
	 * Manual save
	 */
	async save(): Promise<void> {
		try {
			saveStatus.set('saving');
			const state = get(gameState);
			await saveGame(state);
			eventBus.emit('save:complete', {});
			flashSaveIndicator('saved');
		} catch (err) {
			console.error('[GameManager] Save failed:', err);
			flashSaveIndicator('error');
		}
	}

	/**
	 * Prestige reset (IPO) — keep permanent progress, reset everything else
	 * Returns the amount of Founder's Vision earned
	 */
	prestige(): number {
		const current = get(gameState);

		// Calculate Founder's Vision earned from total value
		const visionEarned = this.calculatePrestigeVision(current);

		if (visionEarned <= 0) return 0;

		// Create fresh state but preserve permanent progress
		const fresh = createDefaultState();

		// Preserve across prestige
		fresh.foundersVision = current.foundersVision + visionEarned;
		fresh.prestigeCount = current.prestigeCount + 1;
		fresh.unlockedResearch = [...current.unlockedResearch]; // Keep research
		fresh.achievements = [...current.achievements]; // Keep achievements
		fresh.settings = { ...current.settings }; // Keep settings

		// Preserve lifetime stats
		fresh.stats = {
			...fresh.stats,
			sessionsPlayed: current.stats.sessionsPlayed,
			totalCashEarned: current.stats.totalCashEarned,
			totalResearchCompleted: current.stats.totalResearchCompleted,
			totalTaps: current.stats.totalTaps,
			playTimeMs: current.stats.playTimeMs,
		};

		// After first prestige, all MVP divisions start unlocked
		if (fresh.prestigeCount >= 1) {
			fresh.divisions.teslaenergy.unlocked = true;
			fresh.divisions.spacex.unlocked = true;
			fresh.divisions.tesla.unlocked = true;
		}

		gameState.set(fresh);

		eventBus.emit('prestige:complete', {
			visionEarned,
			totalVision: fresh.foundersVision,
		});

		// Auto-save after prestige
		this.save();

		return visionEarned;
	}

	/**
	 * Hard reset — wipe everything and start completely fresh
	 */
	async hardReset(): Promise<void> {
		gameLoop.stop();
		this.stopAutoSave();

		// Delete saved data
		await deleteSave();

		// Reset to fresh state
		const fresh = createDefaultState();
		fresh.stats.sessionsPlayed = 1;
		fresh.divisions.teslaenergy.unlocked = true;
		gameState.set(fresh);

		// Restart systems
		this.startAutoSave();
		gameLoop.start();

		eventBus.emit('save:loaded', {});
	}

	/**
	 * Calculate how much Founder's Vision a prestige would yield
	 */
	calculatePrestigeVision(state?: GameState): number {
		const s = state ?? get(gameState);

		// Base formula: log2(totalValueEarned / 1,000,000) rounded down
		// Minimum threshold: $1M total value earned
		if (s.totalValueEarned < 1_000_000) return 0;

		const vision = Math.floor(Math.log2(s.totalValueEarned / 1_000_000));
		return Math.max(0, vision);
	}

	/**
	 * Get the prestige multiplier from Founder's Vision
	 * Each Vision point = +10% to all production/revenue
	 */
	getPrestigeMultiplier(state?: GameState): number {
		const s = state ?? get(gameState);
		return 1 + s.foundersVision * 0.1;
	}

	/**
	 * Migrate an old save state to the current version
	 */
	private migrateState(state: GameState): GameState {
		let migrated = { ...state };

		// Version 0 or undefined → Version 1
		if (!migrated.version || migrated.version < 1) {
			migrated.version = 1;
			// Ensure all required fields exist
			migrated.stats = migrated.stats ?? {
				totalTaps: 0,
				totalCashEarned: 0,
				totalResearchCompleted: 0,
				playTimeMs: 0,
				sessionsPlayed: 0,
			};
			migrated.settings = migrated.settings ?? {
				musicEnabled: true,
				sfxEnabled: true,
				notificationsEnabled: true,
				offlineProgressEnabled: true,
			};
			migrated.achievements = migrated.achievements ?? [];
			migrated.unlockedResearch = migrated.unlockedResearch ?? [];
			migrated.totalValueEarned = migrated.totalValueEarned ?? 0;
			migrated.prestigeCount = migrated.prestigeCount ?? 0;
			migrated.foundersVision = migrated.foundersVision ?? 0;
		}

		// Version 1 → Version 2: Tesla gets 6th tier (Cybertruck), cycleDuration replaces baseTime
		if (migrated.version < 2) {
			// Add Cybertruck tier to Tesla if only 5 tiers
			if (migrated.divisions.tesla && migrated.divisions.tesla.tiers.length < 6) {
				migrated.divisions.tesla.tiers.push({
					unlocked: false,
					count: 0,
					level: 0,
					producing: false,
					progress: 0,
				});
			}
			// Reset any in-progress production since timing model changed
			for (const divId of ['teslaenergy', 'spacex', 'tesla'] as const) {
				const div = migrated.divisions[divId];
				if (div) {
					for (const tier of div.tiers) {
						tier.producing = false;
						tier.progress = 0;
					}
				}
			}
			migrated.version = 2;
		}

		migrated.version = CURRENT_VERSION;
		return migrated;
	}

	/**
	 * Start the auto-save timer
	 */
	private startAutoSave(): void {
		this.stopAutoSave();
		this.autoSaveTimer = setInterval(() => {
			this.save();
		}, AUTO_SAVE_INTERVAL_MS);
	}

	/**
	 * Stop the auto-save timer
	 */
	private stopAutoSave(): void {
		if (this.autoSaveTimer !== null) {
			clearInterval(this.autoSaveTimer);
			this.autoSaveTimer = null;
		}
	}

	/**
	 * Add browser event listeners for save-on-close and save-on-hide
	 */
	private addBrowserListeners(): void {
		if (typeof window === 'undefined') return;

		this.boundBeforeUnload = () => {
			// Synchronous save attempt on tab close
			const state = get(gameState);
			const data = JSON.stringify({ ...state, lastSaved: Date.now() });
			// Use sendBeacon for reliable save on close (navigator.sendBeacon doesn't work with IndexedDB)
			// Fall back to synchronous localStorage snapshot for beforeunload
			try {
				localStorage.setItem('being_elon_emergency_save', data);
			} catch {
				// Storage full or unavailable — nothing we can do
			}
		};

		this.boundVisibilityChange = () => {
			if (document.visibilityState === 'hidden') {
				// Save when tab goes to background
				this.save();
			}
		};

		window.addEventListener('beforeunload', this.boundBeforeUnload);
		document.addEventListener('visibilitychange', this.boundVisibilityChange);
	}

	/**
	 * Remove browser event listeners
	 */
	private removeBrowserListeners(): void {
		if (typeof window === 'undefined') return;

		if (this.boundBeforeUnload) {
			window.removeEventListener('beforeunload', this.boundBeforeUnload);
			this.boundBeforeUnload = null;
		}
		if (this.boundVisibilityChange) {
			document.removeEventListener('visibilitychange', this.boundVisibilityChange);
			this.boundVisibilityChange = null;
		}
	}

	/**
	 * Validate that a loaded state has the minimum required structure
	 * Returns false if the save appears corrupted
	 */
	private isValidState(state: unknown): state is GameState {
		if (!state || typeof state !== 'object') return false;
		const s = state as Record<string, unknown>;

		// Check for essential fields
		if (typeof s.cash !== 'number' || isNaN(s.cash)) return false;
		if (!s.divisions || typeof s.divisions !== 'object') return false;

		const divisions = s.divisions as Record<string, unknown>;
		if (!divisions.teslaenergy || typeof divisions.teslaenergy !== 'object') return false;

		// Check teslaenergy has tiers array
		const teslaenergy = divisions.teslaenergy as Record<string, unknown>;
		if (!Array.isArray(teslaenergy.tiers)) return false;

		return true;
	}
}

export const gameManager = new GameManager();
