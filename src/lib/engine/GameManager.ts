/**
 * GameManager.ts — Game state initialization, reset, and lifecycle management
 * Ties together GameLoop, SaveManager, EventBus, and GameState
 */

import { get } from 'svelte/store';
import { gameState, createDefaultState, type GameState, type TreasuryState } from '$lib/stores/gameState';
import { gameLoop } from './GameLoop';
import { saveGame, loadGame, deleteSave, deleteAllBackups } from './SaveManager';
import { loadContractState, resetContracts } from '$lib/systems/ContractSystem';
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
import { TECH_TREE } from '$lib/data/techTree';
import { initMusicSystem, onPrestige as musicOnPrestige } from '$lib/systems/MusicManager';
import { DIVISIONS } from '$lib/divisions';
import { calculateVisionPoints, getStartingCashBonus, getAutoChiefsLevel, getPlanetInfo } from '$lib/systems/PrestigeSystem';
import { getDivisionTrueIncomePerSec } from './ProductionEngine';
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
	private cleanupMusic: (() => void) | null = null;
	private prestigeInProgress = false;

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

			// Restore contract state
			if (migrated.contracts) {
				loadContractState(migrated.contracts as Parameters<typeof loadContractState>[0]);
			}
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
		this.cleanupMusic = initMusicSystem();
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
		if (this.cleanupMusic) {
			this.cleanupMusic();
			this.cleanupMusic = null;
		}
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
	 * Prestige reset (New Colony) — keep permanent progress, reset everything else
	 * Returns the amount of Colony Tech earned
	 */
	prestige(): number {
		// Re-entrancy guard: prevent double-prestige from rapid clicks
		if (this.prestigeInProgress) return 0;
		this.prestigeInProgress = true;

		try {
			return this._doPrestige();
		} finally {
			this.prestigeInProgress = false;
		}
	}

	private _doPrestige(): number {
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

		// Division Stars persist through colony prestiges
		fresh.divisionStars = current.divisionStars ? { ...current.divisionStars } : {};

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

		// Crossfade music to new planet mood
		musicOnPrestige();

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
		const currentPlanetName = getPlanetInfo(current.prestigeCount).name;
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
		resetContracts();

		eventBus.emit('prestige:complete', {
			visionEarned: techEarned,
			totalVision: fresh.colonyTech,
			techEarned,
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
		fresh.divisionStars = current.divisionStars ? { ...current.divisionStars } : {};
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
		resetContracts();

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

		// Delete saved data and all backups
		await deleteSave();
		await deleteAllBackups();

		// Clear all localStorage keys related to the game
		try {
			localStorage.removeItem('tech_tycoon_tutorial_done');
			localStorage.removeItem('tech_tycoon_emergency_save');
			localStorage.removeItem('tech-tycoon-browser-notifications');
			localStorage.removeItem('moonshot-seasonal-participated');
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
		resetContracts();

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
		for (const divId of ['teslaenergy', 'tesla', 'spacex', 'ai', 'tunnels', 'robotics'] as const) {
			total += getDivisionTrueIncomePerSec(state, divId);
		}
		return total;
	}

	/**
	 * Calculate Mars Colony progress (0-100)
	 * Based on: divisions, tiers, tier levels, research, chiefs — all completion-based
	 */
	getMarsProgressBreakdown(state: GameState): {
		divisions: number; divisionsMax: number; divisionsUnlocked: number; divisionsTotal: number;
		tiers: number; tiersMax: number; tiersUnlocked: number; tiersTotal: number;
		levels: number; levelsMax: number; levelsCurrent: number; levelsTarget: number;
		research: number; researchMax: number; researchDone: number; researchTotal: number;
		chiefs: number; chiefsMax: number; chiefsCurrent: number; chiefsTotal: number;
		cash: number; cashMax: number; cashCurrent: number; cashTarget: number;
	} {
		const divIds = ['teslaenergy', 'tesla', 'spacex', 'ai', 'tunnels', 'robotics'] as const;

		// Divisions unlocked (15%)
		let unlockedDivs = 0;
		for (const id of divIds) { if (state.divisions[id].unlocked) unlockedDivs++; }
		const divisions = Math.round((unlockedDivs / 6) * 15 * 100) / 100;

		// Tiers unlocked (25%)
		let unlockedTiers = 0;
		for (const id of divIds) {
			unlockedTiers += state.divisions[id].tiers.filter(t => t.unlocked).length;
		}
		const tiers = Math.round((unlockedTiers / 36) * 20 * 100) / 100;

		// Tier levels (25%) — sum of min(count, 100) per tier vs 3600
		let levelsCurrent = 0;
		for (const id of divIds) {
			for (const tier of state.divisions[id].tiers) {
				levelsCurrent += Math.min(tier.count, 100);
			}
		}
		const levels = Math.round((levelsCurrent / 3600) * 20 * 100) / 100;

		// Research completed (20%)
		const researchTotal = TECH_TREE.length;
		const researchDone = state.unlockedResearch.length;
		const research = Math.round((researchDone / researchTotal) * 20 * 100) / 100;

		// Chiefs hired (15%) — sum of chiefLevel / 36
		let chiefsCurrent = 0;
		for (const id of divIds) {
			chiefsCurrent += state.divisions[id].chiefLevel;
		}
		const chiefs = Math.round((chiefsCurrent / 36) * 15 * 100) / 100;

		// Cash on hand (10%) — need $10B to fund the mission
		const cashTarget = 10_000_000_000;
		const cashCurrent = Math.min(state.cash, cashTarget);
		const cash = Math.round((cashCurrent / cashTarget) * 10 * 100) / 100;

		return {
			divisions, divisionsMax: 15, divisionsUnlocked: unlockedDivs, divisionsTotal: 6,
			tiers, tiersMax: 20, tiersUnlocked: unlockedTiers, tiersTotal: 36,
			levels, levelsMax: 20, levelsCurrent, levelsTarget: 3600,
			research, researchMax: 20, researchDone, researchTotal,
			chiefs, chiefsMax: 15, chiefsCurrent, chiefsTotal: 36,
			cash, cashMax: 10, cashCurrent, cashTarget,
		};
	}

	private calculateMarsProgress(state: GameState): number {
		const b = this.getMarsProgressBreakdown(state);
		const progress = b.divisions + b.tiers + b.levels + b.research + b.chiefs + b.cash;
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
			for (const divId of ['teslaenergy', 'tesla', 'spacex', 'ai', 'tunnels', 'robotics'] as const) {
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

		// Ensure treasury state exists (migrated from legacy "crypto" field)
		if (!migrated.treasury) {
			// Migrate from legacy crypto field if it exists
			const legacyCrypto = migrated.crypto as TreasuryState | undefined;
			migrated.treasury = legacyCrypto ? { ...legacyCrypto } : {
				savings: 0,
				indexPrice: 100,
				indexShares: 0,
				indexInvested: 0,
				indexHistory: [100],
				btcPrice: 42_000,
				btcOwned: 0,
				btcInvested: 0,
				btcHistory: [42_000],
				dogePrice: 0.08,
				dogeOwned: 0,
				dogeInvested: 0,
				dogeHistory: [0.08],
				memePumpMs: 0,
				memePumpMultiplier: 1,
			};
		}

		// Ensure DOGE fields exist on treasury (added in v3)
		{
			const t = migrated.treasury as unknown as Record<string, unknown>;
			if (t.dogePrice === undefined) t.dogePrice = 0.08;
			if (t.dogeOwned === undefined) t.dogeOwned = 0;
			if (t.dogeInvested === undefined) t.dogeInvested = 0;
			if (t.dogeHistory === undefined) t.dogeHistory = [0.08];
			if (t.memePumpMs === undefined) t.memePumpMs = 0;
			if (t.memePumpMultiplier === undefined) t.memePumpMultiplier = 1;
		}

		// Also keep legacy crypto field in sync for backwards compat
		if (!migrated.crypto) {
			migrated.crypto = { ...migrated.treasury };
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

		// Ensure achievement tracking fields exist
		if (!migrated.achievementTimestamps) migrated.achievementTimestamps = {};
		if (!(migrated as any)._achievementFlags) (migrated as any)._achievementFlags = {};

		// Ensure division stars and worker allocation exist
		if (!migrated.divisionStars) migrated.divisionStars = {};
		if (!migrated.workerAllocation) migrated.workerAllocation = {};

		// Ensure daily reward fields exist
		if (migrated.dailyRewardLastClaim === undefined) migrated.dailyRewardLastClaim = 0;
		if (migrated.dailyRewardStreak === undefined) migrated.dailyRewardStreak = 0;

		// Ensure hall of fame exists
		if (!migrated.hallOfFame) {
			migrated.hallOfFame = {
				fastestColonyTimes: [],
				highestIncomePerSec: migrated.stats.highestIncomePerSec ?? 0,
				mostColoniesLaunched: migrated.prestigeCount ?? 0,
				totalCashAllTime: migrated.stats.totalCashEarned ?? 0,
			};
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
				localStorage.setItem('tech_tycoon_emergency_save', data);
			} catch (err) {
				// Storage full — dispatch event so UI can show warning
				if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
					window.dispatchEvent(new CustomEvent('storage-quota-exceeded'));
				}
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
