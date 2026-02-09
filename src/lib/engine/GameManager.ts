/**
 * GameManager.ts — Game state initialization, reset, and lifecycle management
 * Ties together GameLoop, SaveManager, EventBus, and GameState
 */

import { get } from 'svelte/store';
import { gameState, createDefaultState, type GameState, type DivisionState } from '$lib/stores/gameState';
import { gameLoop } from './GameLoop';
import { saveGame, loadGame, deleteSave } from './SaveManager';
import { eventBus } from './EventBus';
import { calculateOfflineProgress, applyOfflineReport, type OfflineReport } from './OfflineCalculator';
import { flashSaveIndicator, saveStatus } from '$lib/stores/saveIndicator';
import { tickProduction } from './ProductionEngine';
import { tickResearch, tickRPGeneration } from '$lib/systems/ResearchSystem';
import { tickBottlenecks, resetBottleneckNotifications } from '$lib/systems/BottleneckSystem';
import { tickTreasury, resetTreasuryAccumulators } from '$lib/systems/TreasurySystem';
import { initFlavorMechanics, destroyFlavorMechanics, resetFlavorStats, getDefaultFlavorStats } from '$lib/systems/FlavorMechanics';
import { resetCelebrations } from '$lib/stores/synergyCelebrationStore';
import { initSoundListeners } from '$lib/systems/SoundManager';
import { DIVISIONS } from '$lib/divisions';
import { calculateVisionPoints, getStartingCashBonus, getAutoChiefsLevel } from '$lib/systems/PrestigeSystem';
import { calculateRevenue, calculateProductionTime } from '$lib/systems/ProductionSystem';
import { triggerParticle } from '$lib/stores/particleStore';

/** Current save version — increment when state schema changes */
const CURRENT_VERSION = 3;

/** Auto-save interval in milliseconds */
const AUTO_SAVE_INTERVAL_MS = 30_000;

/** Maximum offline time in ms (8 hours) */
const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;

class GameManager {
	private autoSaveTimer: ReturnType<typeof setInterval> | null = null;
	private initialized = false;
	private boundBeforeUnload: (() => void) | null = null;
	private boundVisibilityChange: (() => void) | null = null;
	private cleanupSounds: (() => void) | null = null;

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
		initFlavorMechanics();
		this.cleanupSounds = initSoundListeners();
		gameLoop.start();

		// Wire up game tick to update play time, production, and bottlenecks
		let playTimeAccumulator = 0;
		gameLoop.onTick((deltaMs) => {
			// Tick production engine every tick (100ms) for smooth progress bars
			tickProduction(deltaMs);

			// Tick research progress and RP generation
			tickResearch(deltaMs);
			tickRPGeneration(deltaMs);

			// Tick bottleneck detection (internally throttled to every 2s)
			tickBottlenecks(deltaMs);

			// Tick crypto price simulation
			tickTreasury(deltaMs);

			// Update play time + stats only every ~1s to reduce store churn
			playTimeAccumulator += deltaMs;
			if (playTimeAccumulator >= 1000) {
				const elapsed = playTimeAccumulator;
				playTimeAccumulator = 0;
				gameState.update((s) => {
					// Calculate current income/s
					const incomePerSec = this.calculateTotalIncomePerSec(s);
					const newHighest = Math.max(s.stats.highestIncomePerSec, incomePerSec);

					// Calculate Mars colony progress
					const marsProgress = this.calculateMarsProgress(s);

					// Check milestones for particles
					if (s.stats.totalCashEarned < 1_000_000 && s.stats.totalCashEarned + (incomePerSec * elapsed / 1000) >= 1_000_000) {
						triggerParticle('confetti');
					}
					if (s.stats.totalCashEarned < 1_000_000_000 && s.stats.totalCashEarned + (incomePerSec * elapsed / 1000) >= 1_000_000_000) {
						triggerParticle('confetti');
					}

					return {
						...s,
						marsColony: {
							...s.marsColony,
							progress: marsProgress,
							completed: s.marsColony.completed || marsProgress >= 100,
							completedAt: !s.marsColony.completed && marsProgress >= 100 ? Date.now() : s.marsColony.completedAt,
						},
						stats: {
							...s.stats,
							playTimeMs: s.stats.playTimeMs + elapsed,
							highestIncomePerSec: newHighest,
						}
					};
				});
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
		destroyFlavorMechanics();
		if (this.cleanupSounds) {
			this.cleanupSounds();
			this.cleanupSounds = null;
		}
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
	 * Returns the amount of Colony Tech earned
	 */
	prestige(): number {
		const current = get(gameState);

		// Calculate Colony Tech earned from total value
		const techEarned = this.calculatePrestigeVision(current);

		if (techEarned <= 0) return 0;

		// Create fresh state but preserve permanent progress
		const fresh = createDefaultState();

		// Preserve across prestige
		fresh.colonyTech = current.colonyTech + techEarned;
		fresh.prestigeCount = current.prestigeCount + 1;
		fresh.unlockedResearch = [...current.unlockedResearch]; // Keep research
		fresh.achievements = [...current.achievements]; // Keep achievements
		fresh.settings = { ...current.settings }; // Keep settings

		// Vision Points: award accumulated VP from this run
		const earnedVP = calculateVisionPoints(current.totalValueEarned);
		fresh.visionPoints = (current.visionPoints ?? 0) + earnedVP;

		// Mega-upgrades persist through resets
		fresh.purchasedMegaUpgrades = [...(current.purchasedMegaUpgrades ?? [])];

		// Purchased upgrades do NOT persist (reset like AdCap)
		fresh.purchasedUpgrades = [];

		// Preserve lifetime stats
		fresh.stats = {
			...fresh.stats,
			sessionsPlayed: current.stats.sessionsPlayed,
			totalCashEarned: current.stats.totalCashEarned,
			totalResearchCompleted: current.stats.totalResearchCompleted,
			totalTaps: current.stats.totalTaps,
			playTimeMs: current.stats.playTimeMs,
			totalProductions: current.stats.totalProductions,
			totalPrestiges: current.stats.totalPrestiges + 1,
			highestIncomePerSec: current.stats.highestIncomePerSec,
		};

		// Preserve Mars colony progress
		fresh.marsColony = { ...current.marsColony };

		// Trigger confetti on prestige
		triggerParticle('confetti');

		// After first prestige, all MVP divisions start unlocked
		if (fresh.prestigeCount >= 1) {
			fresh.divisions.teslaenergy.unlocked = true;
			fresh.divisions.spacex.unlocked = true;
			fresh.divisions.tesla.unlocked = true;
		}

		// Apply starting cash mega-upgrade
		const cashBonus = getStartingCashBonus(fresh);
		if (cashBonus > 0) {
			fresh.cash = Math.max(fresh.cash, cashBonus);
		}

		// Apply auto-chiefs mega-upgrade
		const autoChiefsLvl = getAutoChiefsLevel(fresh);
		if (autoChiefsLvl >= 1) {
			const divKeys = Object.keys(fresh.divisions) as (keyof typeof fresh.divisions)[];
			const target = autoChiefsLvl >= 2 ? divKeys : divKeys.slice(0, 3);
			for (const key of target) {
				if (fresh.divisions[key].unlocked) {
					fresh.divisions[key].chiefLevel = Math.max(fresh.divisions[key].chiefLevel, 1);
				}
			}
		}

		// Track hall of fame stats
		fresh.hallOfFame = { ...(current.hallOfFame ?? { fastestColonyTimes: [], highestIncomePerSec: 0, mostColoniesLaunched: 0, totalCashAllTime: 0 }) };
		fresh.hallOfFame.mostColoniesLaunched = fresh.prestigeCount;
		fresh.hallOfFame.totalCashAllTime = (fresh.hallOfFame.totalCashAllTime || 0) + current.totalValueEarned;
		if (current.stats.highestIncomePerSec > fresh.hallOfFame.highestIncomePerSec) {
			fresh.hallOfFame.highestIncomePerSec = current.stats.highestIncomePerSec;
		}
		// Track fastest colony time for current planet
		const colonyTimeMs = current.stats.playTimeMs;
		const planetIdx = current.prestigeCount; // planet we're leaving
		const existing = fresh.hallOfFame.fastestColonyTimes.find(p => p.planetIndex === planetIdx);
		if (!existing || colonyTimeMs < existing.timeMs) {
			fresh.hallOfFame.fastestColonyTimes = [
				...fresh.hallOfFame.fastestColonyTimes.filter(p => p.planetIndex !== planetIdx),
				{ planetIndex: planetIdx, planetName: currentPlanetName, timeMs: colonyTimeMs }
			];
		}

		// Preserve daily reward state
		fresh.dailyRewardLastClaim = current.dailyRewardLastClaim ?? 0;
		fresh.dailyRewardStreak = current.dailyRewardStreak ?? 0;

		gameState.set(fresh);
		resetBottleneckNotifications();
		resetTreasuryAccumulators();
		resetFlavorStats();
		resetCelebrations();

		eventBus.emit('prestige:complete', {
			techEarned,
			totalColonyTech: fresh.colonyTech,
		});

		// Auto-save after prestige
		this.save();

		return techEarned;
	}

	/**
	 * New Game+ — reset most progress but carry over prestige bonuses, achievements, NG+ level
	 * Available after Mars Colony completion
	 */
	newGamePlus(): boolean {
		const current = get(gameState);

		// Must have completed Mars colony
		if (!current.marsColony?.completed) return false;

		const fresh = createDefaultState();
		const newNgLevel = (current.ngPlusLevel ?? 0) + 1;

		// Carry over: prestige bonuses (colony tech), achievement progress, NG+ level
		fresh.ngPlusLevel = newNgLevel;
		fresh.colonyTech = current.colonyTech;
		fresh.prestigeCount = current.prestigeCount;
		fresh.achievements = [...current.achievements];
		fresh.settings = { ...current.settings };
		fresh.visionPoints = current.visionPoints ?? 0;
		fresh.purchasedMegaUpgrades = [...(current.purchasedMegaUpgrades ?? [])];
		fresh.purchasedUpgrades = [];

		// Preserve lifetime stats
		fresh.stats = {
			...fresh.stats,
			sessionsPlayed: current.stats.sessionsPlayed,
			totalCashEarned: current.stats.totalCashEarned,
			totalResearchCompleted: current.stats.totalResearchCompleted,
			totalTaps: current.stats.totalTaps,
			playTimeMs: current.stats.playTimeMs,
			totalProductions: current.stats.totalProductions,
			totalPrestiges: current.stats.totalPrestiges,
			highestIncomePerSec: current.stats.highestIncomePerSec,
		};

		// Reset Mars colony but track NG+ count
		fresh.marsColony = {
			progress: 0,
			completed: false,
			completedAt: 0,
			newGamePlusCount: newNgLevel,
		};

		// After first prestige, all MVP divisions start unlocked
		if (fresh.prestigeCount >= 1) {
			fresh.divisions.teslaenergy.unlocked = true;
			fresh.divisions.spacex.unlocked = true;
			fresh.divisions.tesla.unlocked = true;
		} else {
			fresh.divisions.teslaenergy.unlocked = true;
		}

		triggerParticle('confetti');
		gameState.set(fresh);
		resetBottleneckNotifications();
		resetTreasuryAccumulators();
		resetFlavorStats();
		resetCelebrations();

		eventBus.emit('newgameplus:complete', {
			ngPlusLevel: newNgLevel,
		});

		this.save();
		return true;
	}

	/**
	 * Hard reset — wipe everything and start completely fresh
	 */
	async hardReset(): Promise<void> {
		gameLoop.stop();
		this.stopAutoSave();

		// Delete saved data
		await deleteSave();

		// Clear tutorial completion flag so it replays
		try {
			localStorage.removeItem('tech_tycoon_tutorial_done');
		} catch {
			// ignore
		}

		// Reset to fresh state
		const fresh = createDefaultState();
		fresh.stats.sessionsPlayed = 1;
		fresh.divisions.teslaenergy.unlocked = true;
		gameState.set(fresh);

		resetBottleneckNotifications();
		resetCelebrations();

		// Restart systems
		this.startAutoSave();
		gameLoop.start();

		eventBus.emit('save:loaded', {});
	}

	/**
	 * Calculate how much Colony Tech a prestige would yield
	 */
	calculatePrestigeVision(state?: GameState): number {
		const s = state ?? get(gameState);

		// Base formula: log2(totalValueEarned / 100,000,000) rounded down
		// Minimum threshold: $100M total value earned
		if (s.totalValueEarned < 100_000_000) return 0;

		// Each 2x earnings = +1 Colony Tech
		// $100M = 0, $200M = 1, $400M = 2, $800M = 3, etc.
		const tech = Math.floor(Math.log2(s.totalValueEarned / 100_000_000));
		return Math.max(0, tech);
	}

	/**
	 * Get the prestige multiplier from Colony Tech
	 * Each Colony Tech point = +3% production speed
	 */
	getPrestigeMultiplier(state?: GameState): number {
		const s = state ?? get(gameState);
		return 1 + s.colonyTech * 0.03;
	}

	/**
	 * Calculate total income per second across all divisions
	 */
	private calculateTotalIncomePerSec(state: GameState): number {
		let total = 0;
		for (const divId of ['teslaenergy', 'spacex', 'tesla', 'ai', 'tunnels', 'robotics', 'robotics'] as const) {
			const divState = state.divisions[divId];
			const divMeta = DIVISIONS[divId];
			if (!divState?.unlocked || !divMeta) continue;
			for (let i = 0; i < divState.tiers.length; i++) {
				const tier = divState.tiers[i];
				if (!tier.unlocked || tier.count === 0) continue;
				const tierData = divMeta.tiers[i];
				if (!tierData) continue;
				const revenue = calculateRevenue(tierData.config, tier.count, tier.level);
				const prodTimeMs = calculateProductionTime(tierData.config, divState.chiefLevel);
				total += (revenue / prodTimeMs) * 1000;
			}
		}
		return total;
	}

	/**
	 * Calculate Mars Colony progress (0-100)
	 * Based on: total income threshold, divisions unlocked, prestige count
	 */
	private calculateMarsProgress(state: GameState): number {
		let progress = 0;

		// Income milestones (up to 40%)
		const incomeThresholds = [1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13];
		const incomePoints = 5; // 5% per threshold = 40%
		for (const threshold of incomeThresholds) {
			if (state.stats.totalCashEarned >= threshold) progress += incomePoints;
		}

		// All divisions unlocked (15%)
		const divIds = ['teslaenergy', 'spacex', 'tesla', 'ai', 'tunnels', 'robotics', 'robotics'] as const;
		let unlockedDivs = 0;
		for (const id of divIds) {
			if (state.divisions[id].unlocked) unlockedDivs++;
		}
		progress += (unlockedDivs / divIds.length) * 15;

		// All tiers unlocked across divisions (20%)
		let totalTiers = 0;
		let unlockedTiers = 0;
		for (const id of divIds) {
			const div = state.divisions[id];
			totalTiers += div.tiers.length;
			unlockedTiers += div.tiers.filter(t => t.unlocked).length;
		}
		if (totalTiers > 0) progress += (unlockedTiers / totalTiers) * 20;

		// Prestige count (up to 25%, 5% per prestige, max 5 prestiges)
		progress += Math.min(state.prestigeCount, 5) * 5;

		return Math.min(100, Math.round(progress * 100) / 100);
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
			migrated.colonyTech = migrated.colonyTech ?? 0;
		}

		// Version 1 → Version 2: Manufacturing gets 6th tier, cycleDuration replaces baseTime
		if (migrated.version < 2) {
			// Add 6th tier to Manufacturing if only 5 tiers
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
			for (const divId of ['teslaenergy', 'spacex', 'tesla', 'ai', 'tunnels', 'robotics'] as const) {
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

		// Ensure marsColony exists
		if (!migrated.marsColony) {
			migrated.marsColony = { progress: 0, completed: false, completedAt: 0, newGamePlusCount: 0 };
		}

		// Ensure ngPlusLevel exists
		if (migrated.ngPlusLevel === undefined) {
			migrated.ngPlusLevel = migrated.marsColony.newGamePlusCount ?? 0;
		}

		// Ensure new stats fields exist
		if (migrated.stats.totalProductions === undefined) migrated.stats.totalProductions = 0;
		if (migrated.stats.totalPrestiges === undefined) migrated.stats.totalPrestiges = 0;
		if (migrated.stats.highestIncomePerSec === undefined) migrated.stats.highestIncomePerSec = 0;

		// Ensure activeSynergies field exists (added with synergy system)
		if (!migrated.activeSynergies) {
			migrated.activeSynergies = [];
		}

		// Ensure crypto state exists (added with crypto treasury system)
		if (!migrated.crypto) {
			migrated.crypto = {
				btcPrice: 42_000,
				btcOwned: 0,
				btcPriceHistory: [42_000],
				totalInvested: 0,
				dogePrice: 0.08,
				dogeOwned: 0,
				dogePriceHistory: [0.08],
				dogeTotalInvested: 0,
				memePumpMs: 0,
				memePumpMultiplier: 1,
			};
		}

		// Version 2 → 3: Add DOGE fields to existing crypto state
		{
			const c = migrated.crypto as unknown as Record<string, unknown>;
			if (c.dogePrice === undefined) c.dogePrice = 0.08;
			if (c.dogeOwned === undefined) c.dogeOwned = 0;
			if (c.dogePriceHistory === undefined) c.dogePriceHistory = [0.08];
			if (c.dogeTotalInvested === undefined) c.dogeTotalInvested = 0;
			if (c.memePumpMs === undefined) c.memePumpMs = 0;
			if (c.memePumpMultiplier === undefined) c.memePumpMultiplier = 1;
		}

		// Ensure AI and Tunnels divisions exist (added with T057/T058)
		if (!migrated.divisions.ai) {
			migrated.divisions.ai = {
				unlocked: false,
				tiers: Array.from({ length: 6 }, (_, i) => ({
					unlocked: i === 0,
					count: 0,
					level: 0,
					producing: false,
					progress: 0,
				})),
				chiefLevel: 0,
				bottlenecks: [],
			};
		}
		if (!migrated.divisions.tunnels) {
			migrated.divisions.tunnels = {
				unlocked: false,
				tiers: Array.from({ length: 6 }, (_, i) => ({
					unlocked: i === 0,
					count: 0,
					level: 0,
					producing: false,
					progress: 0,
				})),
				chiefLevel: 0,
				bottlenecks: [],
			};
		}

		// Ensure Robotics division exists (added with Robotics division)
		if (!migrated.divisions.robotics) {
			migrated.divisions.robotics = {
				unlocked: false,
				tiers: Array.from({ length: 6 }, (_, i) => ({
					unlocked: i === 0,
					count: 0,
					level: 0,
					producing: false,
					progress: 0,
				})),
				chiefLevel: 0,
				bottlenecks: [],
			};
		}

		// Ensure activeResearch field exists (added with research system)
		if (migrated.activeResearch === undefined) {
			migrated.activeResearch = null;
		}

		// Ensure researchPoints field exists
		if (migrated.researchPoints === undefined) {
			migrated.researchPoints = 0;
		}

		// Ensure flavorStats field exists (added with T024/T028)
		if (!migrated.flavorStats) {
			migrated.flavorStats = getDefaultFlavorStats();
		}

		// Ensure new upgrade/milestone/VP fields exist
		if (!migrated.purchasedUpgrades) migrated.purchasedUpgrades = [];
		if (migrated.visionPoints === undefined) migrated.visionPoints = 0;
		if (!migrated.purchasedMegaUpgrades) migrated.purchasedMegaUpgrades = [];

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
				localStorage.setItem('tech_tycoon_emergency_save', data);
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
