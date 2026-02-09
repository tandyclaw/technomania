/**
 * AchievementSystem.ts — Achievement definitions, checking, and EventBus integration
 * T060 + T061: 60+ achievements across Income, Divisions, Production, Prestige, Special
 * Includes hidden/secret achievements, rarity labels, and unlock timestamps
 */

import { gameState, type GameState } from '$lib/stores/gameState';
import { eventBus } from '$lib/engine/EventBus';
import { get } from 'svelte/store';
import { TECH_TREE } from '$lib/data/techTree';

export type AchievementCategory = 'income' | 'divisions' | 'production' | 'prestige' | 'special';
export type AchievementRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface AchievementDef {
	id: string;
	name: string;
	description: string;
	icon: string;
	category: AchievementCategory;
	condition: (state: GameState) => boolean;
	hidden?: boolean;
	rarity: AchievementRarity;
}

export interface UnlockedAchievement {
	id: string;
	unlockedAt: number;
}

// ─── Achievement Definitions ─────────────────────────────────────────────────

export const ACHIEVEMENTS: AchievementDef[] = [
	// === Income ===
	{ id: 'income_100', name: 'Seed Money', description: 'Earn $100 total', icon: '💵', category: 'income', rarity: 'Common',
		condition: (s) => s.stats.totalCashEarned >= 100 },
	{ id: 'income_1k', name: 'Four Figures', description: 'Earn $1,000 total', icon: '💰', category: 'income', rarity: 'Common',
		condition: (s) => s.stats.totalCashEarned >= 1_000 },
	{ id: 'income_10k', name: 'Serious Capital', description: 'Earn $10,000 total', icon: '💰', category: 'income', rarity: 'Common',
		condition: (s) => s.stats.totalCashEarned >= 10_000 },
	{ id: 'income_100k', name: 'Six Figures', description: 'Earn $100,000 total', icon: '🤑', category: 'income', rarity: 'Common',
		condition: (s) => s.stats.totalCashEarned >= 100_000 },
	{ id: 'income_1m', name: 'Millionaire', description: 'Earn $1,000,000 total', icon: '🏦', category: 'income', rarity: 'Rare',
		condition: (s) => s.stats.totalCashEarned >= 1_000_000 },
	{ id: 'income_10m', name: 'Multi-Millionaire', description: 'Earn $10M total', icon: '💎', category: 'income', rarity: 'Rare',
		condition: (s) => s.stats.totalCashEarned >= 10_000_000 },
	{ id: 'income_100m', name: 'Centi-Millionaire', description: 'Earn $100M total', icon: '👑', category: 'income', rarity: 'Rare',
		condition: (s) => s.stats.totalCashEarned >= 100_000_000 },
	{ id: 'income_1b', name: 'Billionaire', description: 'Earn $1B total', icon: '🏆', category: 'income', rarity: 'Epic',
		condition: (s) => s.stats.totalCashEarned >= 1_000_000_000 },
	{ id: 'income_1t', name: 'Trillionaire', description: 'Earn $1T total', icon: '🌟', category: 'income', rarity: 'Epic',
		condition: (s) => s.stats.totalCashEarned >= 1_000_000_000_000 },
	{ id: 'income_1qa', name: 'Quadrillionaire', description: 'Earn $1Qa total', icon: '🔮', category: 'income', rarity: 'Legendary',
		condition: (s) => s.stats.totalCashEarned >= 1e15 },
	{ id: 'income_1qi', name: 'Quintillionaire', description: 'Earn $1Qi total', icon: '🌌', category: 'income', rarity: 'Legendary',
		condition: (s) => s.stats.totalCashEarned >= 1e18 },

	// === Divisions ===
	{ id: 'div_first', name: 'First Division', description: 'Unlock your first division', icon: '🏢', category: 'divisions', rarity: 'Common',
		condition: (s) => Object.values(s.divisions).some(d => d.unlocked) },
	{ id: 'div_all', name: 'Full Portfolio', description: 'Unlock all divisions', icon: '🌐', category: 'divisions', rarity: 'Rare',
		condition: (s) => Object.values(s.divisions).every(d => d.unlocked) },
	{ id: 'div_spacex', name: 'To The Stars', description: 'Unlock Rockets division', icon: '🚀', category: 'divisions', rarity: 'Common',
		condition: (s) => s.divisions.spacex.unlocked },
	{ id: 'div_tesla', name: 'Factory Floor', description: 'Unlock Manufacturing division', icon: '🏭', category: 'divisions', rarity: 'Common',
		condition: (s) => s.divisions.tesla.unlocked },
	{ id: 'div_energy', name: 'Power Play', description: 'Unlock Energy division', icon: '☀️', category: 'divisions', rarity: 'Common',
		condition: (s) => s.divisions.teslaenergy.unlocked },
	{ id: 'div_ai', name: 'Rise of the Machines', description: 'Unlock AI division', icon: '🤖', category: 'divisions', rarity: 'Rare',
		condition: (s) => s.divisions.ai.unlocked },
	{ id: 'div_tunnels', name: 'Going Underground', description: 'Unlock Tunnels division', icon: '🚇', category: 'divisions', rarity: 'Rare',
		condition: (s) => s.divisions.tunnels.unlocked },
	{ id: 'div_robotics', name: 'Automation Nation', description: 'Unlock Robotics division', icon: '🦾', category: 'divisions', rarity: 'Rare',
		condition: (s) => s.divisions.robotics.unlocked },
	{ id: 'tier_all_spacex', name: 'Full Stack Rockets', description: 'Unlock all Rockets tiers', icon: '🚀', category: 'divisions', rarity: 'Rare',
		condition: (s) => s.divisions.spacex.tiers.every(t => t.unlocked) },
	{ id: 'tier_all_tesla', name: 'Full Production', description: 'Unlock all Manufacturing tiers', icon: '🏭', category: 'divisions', rarity: 'Rare',
		condition: (s) => s.divisions.tesla.tiers.every(t => t.unlocked) },
	{ id: 'tier_all_energy', name: 'Grid Domination', description: 'Unlock all Energy tiers', icon: '☀️', category: 'divisions', rarity: 'Rare',
		condition: (s) => s.divisions.teslaenergy.tiers.every(t => t.unlocked) },
	{ id: 'tier_all_ai', name: 'Singularity', description: 'Unlock all AI tiers', icon: '🤖', category: 'divisions', rarity: 'Epic',
		condition: (s) => s.divisions.ai.tiers.every(t => t.unlocked) },
	{ id: 'tier_all_tunnels', name: 'Mole King', description: 'Unlock all Tunnels tiers', icon: '🚇', category: 'divisions', rarity: 'Epic',
		condition: (s) => s.divisions.tunnels.tiers.every(t => t.unlocked) },
	{ id: 'tier_all_robotics', name: 'Robot Army', description: 'Unlock all Robotics tiers', icon: '🦾', category: 'divisions', rarity: 'Epic',
		condition: (s) => s.divisions.robotics.tiers.every(t => t.unlocked) },
	{ id: 'chief_first', name: 'First Hire', description: 'Hire your first Chief', icon: '👔', category: 'divisions', rarity: 'Common',
		condition: (s) => Object.values(s.divisions).some(d => d.chiefLevel > 0) },
	{ id: 'chief_all', name: 'Executive Team', description: 'Hire Chiefs for all divisions', icon: '👔', category: 'divisions', rarity: 'Rare',
		condition: (s) => Object.values(s.divisions).filter(d => d.unlocked).every(d => d.chiefLevel > 0) && Object.values(s.divisions).some(d => d.unlocked) },
	{ id: 'chief_max', name: 'C-Suite Complete', description: 'Max out all Chiefs', icon: '🎩', category: 'divisions', rarity: 'Epic',
		condition: (s) => Object.values(s.divisions).filter(d => d.unlocked).every(d => d.chiefLevel >= 6) && Object.values(s.divisions).some(d => d.unlocked) },

	// Per-division Master achievements (all tiers at 100+ count)
	{ id: 'master_spacex', name: 'Rocket Master', description: 'Own 100+ of every Rockets tier', icon: '🚀', category: 'divisions', rarity: 'Epic',
		condition: (s) => s.divisions.spacex.unlocked && s.divisions.spacex.tiers.every(t => t.count >= 100) },
	{ id: 'master_tesla', name: 'Manufacturing Master', description: 'Own 100+ of every Manufacturing tier', icon: '🏭', category: 'divisions', rarity: 'Epic',
		condition: (s) => s.divisions.tesla.unlocked && s.divisions.tesla.tiers.every(t => t.count >= 100) },
	{ id: 'master_energy', name: 'Energy Master', description: 'Own 100+ of every Energy tier', icon: '☀️', category: 'divisions', rarity: 'Epic',
		condition: (s) => s.divisions.teslaenergy.unlocked && s.divisions.teslaenergy.tiers.every(t => t.count >= 100) },
	{ id: 'master_ai', name: 'AI Master', description: 'Own 100+ of every AI tier', icon: '🤖', category: 'divisions', rarity: 'Legendary',
		condition: (s) => s.divisions.ai.unlocked && s.divisions.ai.tiers.every(t => t.count >= 100) },
	{ id: 'master_tunnels', name: 'Tunnels Master', description: 'Own 100+ of every Tunnels tier', icon: '🚇', category: 'divisions', rarity: 'Legendary',
		condition: (s) => s.divisions.tunnels.unlocked && s.divisions.tunnels.tiers.every(t => t.count >= 100) },
	{ id: 'master_robotics', name: 'Robotics Master', description: 'Own 100+ of every Robotics tier', icon: '🦾', category: 'divisions', rarity: 'Legendary',
		condition: (s) => s.divisions.robotics.unlocked && s.divisions.robotics.tiers.every(t => t.count >= 100) },

	// === Production ===
	{ id: 'prod_first', name: 'First Product', description: 'Buy your first tier unit', icon: '📦', category: 'production', rarity: 'Common',
		condition: (s) => Object.values(s.divisions).some(d => d.tiers.some(t => t.count > 0)) },
	{ id: 'prod_10', name: 'Small Batch', description: 'Own 10 total units', icon: '📦', category: 'production', rarity: 'Common',
		condition: (s) => countTotalUnits(s) >= 10 },
	{ id: 'prod_50', name: 'Assembly Line', description: 'Own 50 total units', icon: '🏭', category: 'production', rarity: 'Common',
		condition: (s) => countTotalUnits(s) >= 50 },
	{ id: 'prod_100', name: 'Mass Production', description: 'Own 100 total units', icon: '🏭', category: 'production', rarity: 'Common',
		condition: (s) => countTotalUnits(s) >= 100 },
	{ id: 'prod_500', name: 'Industrial Scale', description: 'Own 500 total units', icon: '⚙️', category: 'production', rarity: 'Rare',
		condition: (s) => countTotalUnits(s) >= 500 },
	{ id: 'prod_1000', name: 'Mega Factory', description: 'Own 1,000 total units', icon: '🔩', category: 'production', rarity: 'Rare',
		condition: (s) => countTotalUnits(s) >= 1_000 },
	{ id: 'prod_5000', name: 'Global Supply Chain', description: 'Own 5,000 total units', icon: '🌍', category: 'production', rarity: 'Epic',
		condition: (s) => countTotalUnits(s) >= 5_000 },
	{ id: 'taps_100', name: 'Clicker', description: 'Tap 100 times', icon: '👆', category: 'production', rarity: 'Common',
		condition: (s) => s.stats.totalTaps >= 100 },
	{ id: 'taps_1000', name: 'Tap Master', description: 'Tap 1,000 times', icon: '🖱️', category: 'production', rarity: 'Rare',
		condition: (s) => s.stats.totalTaps >= 1_000 },
	{ id: 'taps_10000', name: 'Carpal Tunnel', description: 'Tap 10,000 times', icon: '🤕', category: 'production', rarity: 'Epic',
		condition: (s) => s.stats.totalTaps >= 10_000 },

	// === Prestige / Planets ===
	{ id: 'prestige_first', name: 'First Colony', description: 'Launch your first colony', icon: '🪐', category: 'prestige', rarity: 'Rare',
		condition: (s) => s.prestigeCount >= 1 },
	{ id: 'prestige_3', name: 'Serial Founder', description: 'Launch 3 colonies', icon: '🪐', category: 'prestige', rarity: 'Rare',
		condition: (s) => s.prestigeCount >= 3 },
	{ id: 'prestige_5', name: 'Venture Legend', description: 'Launch 5 colonies', icon: '🏛️', category: 'prestige', rarity: 'Epic',
		condition: (s) => s.prestigeCount >= 5 },
	{ id: 'prestige_10', name: 'Colony Empire', description: 'Launch 10 colonies', icon: '💫', category: 'prestige', rarity: 'Legendary',
		condition: (s) => s.prestigeCount >= 10 },
	// Planet-specific
	{ id: 'planet_mars', name: 'Red Planet', description: 'Reach Mars', icon: '🔴', category: 'prestige', rarity: 'Rare',
		condition: (s) => s.prestigeCount >= 1 },
	{ id: 'planet_proxima', name: 'Interstellar', description: 'Reach Proxima Centauri b', icon: '⭐', category: 'prestige', rarity: 'Epic',
		condition: (s) => s.prestigeCount >= 2 },
	{ id: 'planet_trappist_e', name: 'Habitable Zone', description: 'Reach TRAPPIST-1e', icon: '🌍', category: 'prestige', rarity: 'Epic',
		condition: (s) => s.prestigeCount >= 3 },
	{ id: 'planet_trappist_f', name: 'Water World', description: 'Reach TRAPPIST-1f', icon: '🌊', category: 'prestige', rarity: 'Epic',
		condition: (s) => s.prestigeCount >= 4 },
	{ id: 'planet_toi700d', name: 'Golden Light', description: 'Reach TOI-700d', icon: '🌅', category: 'prestige', rarity: 'Legendary',
		condition: (s) => s.prestigeCount >= 6 },
	{ id: 'planet_kepler442b', name: 'Earth-Like', description: 'Reach Kepler-442b', icon: '💫', category: 'prestige', rarity: 'Legendary',
		condition: (s) => s.prestigeCount >= 10 },

	// === Special ===
	{ id: 'synergy_first', name: 'Better Together', description: 'Discover your first synergy', icon: '🔗', category: 'special', rarity: 'Common',
		condition: (s) => s.activeSynergies.length >= 1 },
	{ id: 'synergy_all', name: 'Fully Integrated', description: 'Discover all synergies', icon: '🔗', category: 'special', rarity: 'Epic',
		condition: (s) => s.activeSynergies.length >= 14 },
	{ id: 'bottleneck_first', name: 'Problem Solver', description: 'Resolve your first bottleneck', icon: '✅', category: 'special', rarity: 'Common',
		condition: (s) => Object.values(s.divisions).some(d => d.bottlenecks.some(b => b.resolved)) },
	{ id: 'research_first', name: 'Eureka!', description: 'Complete your first research', icon: '🔬', category: 'special', rarity: 'Common',
		condition: (s) => s.unlockedResearch.length >= 1 },
	{ id: 'research_10', name: 'R&D Department', description: 'Complete 10 research projects', icon: '🧪', category: 'special', rarity: 'Rare',
		condition: (s) => s.unlockedResearch.length >= 10 },
	{ id: 'research_complete', name: 'Research Complete', description: 'Unlock all tech tree nodes', icon: '🎓', category: 'special', rarity: 'Legendary',
		condition: (s) => s.unlockedResearch.length >= TECH_TREE.length },
	{ id: 'diversified', name: 'Diversified', description: 'All 6 divisions producing simultaneously', icon: '📊', category: 'special', rarity: 'Rare',
		condition: (s) => Object.values(s.divisions).every(d => d.unlocked && d.tiers.some(t => t.count > 0)) },
	{ id: 'automated_empire', name: 'Automated Empire', description: 'All 6 chiefs hired', icon: '🤖', category: 'special', rarity: 'Epic',
		condition: (s) => Object.values(s.divisions).every(d => d.unlocked && d.chiefLevel > 0) },

	// Contract achievements
	{ id: 'contracts_10', name: 'Contractor', description: 'Complete 10 contracts', icon: '📋', category: 'special', rarity: 'Common',
		condition: (s) => (s.contracts?.totalCompleted ?? 0) >= 10 },
	{ id: 'contracts_50', name: 'Deal Maker', description: 'Complete 50 contracts', icon: '🤝', category: 'special', rarity: 'Rare',
		condition: (s) => (s.contracts?.totalCompleted ?? 0) >= 50 },
	{ id: 'contracts_100', name: 'Corporate Machine', description: 'Complete 100 contracts', icon: '📜', category: 'special', rarity: 'Epic',
		condition: (s) => (s.contracts?.totalCompleted ?? 0) >= 100 },

	// Daily streak
	{ id: 'streak_7', name: 'Weekly Warrior', description: '7-day login streak', icon: '🔥', category: 'special', rarity: 'Rare',
		condition: (s) => (s.dailyRewardStreak ?? 0) >= 7 },
	{ id: 'streak_30', name: 'Monthly Dedication', description: '30-day login streak', icon: '🔥', category: 'special', rarity: 'Legendary',
		condition: (s) => (s.dailyRewardStreak ?? 0) >= 30 },

	// === Hidden / Secret Achievements ===
	{ id: 'hidden_speed_demon', name: 'Speed Demon', description: 'Complete a mini-game on the first try', icon: '⚡', category: 'special', rarity: 'Rare', hidden: true,
		condition: (s) => !!(s as any)._achievementFlags?.speedDemon },
	{ id: 'hidden_diamond_hands', name: 'Diamond Hands', description: 'Hold $10M in crypto for 5 min without selling', icon: '💎', category: 'special', rarity: 'Epic', hidden: true,
		condition: (s) => !!(s as any)._achievementFlags?.diamondHands },
	{ id: 'hidden_oops', name: 'Oops', description: 'Fail a mini-game 5 times', icon: '😅', category: 'special', rarity: 'Rare', hidden: true,
		condition: (s) => !!(s as any)._achievementFlags?.oops },
	{ id: 'hidden_night_owl', name: 'Night Owl', description: 'Play between midnight and 5 AM', icon: '🦉', category: 'special', rarity: 'Rare', hidden: true,
		condition: () => { const h = new Date().getHours(); return h >= 0 && h < 5; } },
	{ id: 'hidden_marathon', name: 'Marathon', description: 'Play for 4+ hours in one session', icon: '🏃', category: 'special', rarity: 'Epic', hidden: true,
		condition: (s) => s.stats.playTimeMs >= 4 * 60 * 60 * 1000 },
	{ id: 'hidden_the_1_percent', name: 'The 1%', description: 'Reach $1T income/s', icon: '💸', category: 'special', rarity: 'Legendary', hidden: true,
		condition: (s) => s.stats.highestIncomePerSec >= 1_000_000_000_000 },
	{ id: 'hidden_full_house', name: 'Full House', description: 'Own 100+ of every tier in one division', icon: '🃏', category: 'special', rarity: 'Epic', hidden: true,
		condition: (s) => Object.values(s.divisions).some(d => d.unlocked && d.tiers.length > 0 && d.tiers.every(t => t.count >= 100)) },
	{ id: 'hidden_speedrunner', name: 'Speedrunner', description: 'Colonize Mars in under 1 hour', icon: '⏱️', category: 'special', rarity: 'Legendary', hidden: true,
		condition: (s) => (s.hallOfFame?.fastestColonyTimes ?? []).some(t => t.planetIndex === 1 && t.timeMs < 3600000) },
	{ id: 'hidden_tourist', name: 'Tourist', description: 'Visit every tab in under 30 seconds', icon: '🗺️', category: 'special', rarity: 'Epic', hidden: true,
		condition: (s) => !!(s as any)._achievementFlags?.tourist },
	{ id: 'hidden_hoarder', name: 'Hoarder', description: 'Have 500+ total tiers across all divisions', icon: '📦', category: 'special', rarity: 'Epic', hidden: true,
		condition: (s) => countTotalUnits(s) >= 500 },
];

function countTotalUnits(s: GameState): number {
	let total = 0;
	for (const div of Object.values(s.divisions)) {
		for (const tier of div.tiers) {
			total += tier.count;
		}
	}
	return total;
}

/** Rarity color mapping */
export function getRarityColor(rarity: AchievementRarity): string {
	switch (rarity) {
		case 'Common': return '#9CA3AF';
		case 'Rare': return '#3B82F6';
		case 'Epic': return '#A855F7';
		case 'Legendary': return '#F59E0B';
	}
}

/** Get visible achievement count (excludes hidden that aren't unlocked) */
export function getVisibleCount(unlockedIds: Set<string>): { visible: number; total: number } {
	const total = ACHIEVEMENTS.length;
	const visible = ACHIEVEMENTS.filter(a => !a.hidden || unlockedIds.has(a.id)).length;
	return { visible, total };
}

// ─── Achievement Checker ─────────────────────────────────────────────────────

/**
 * Check all achievements against current state, unlock any newly earned ones.
 * Returns array of newly unlocked achievement IDs.
 */
export function checkAchievements(state: GameState): string[] {
	const newlyUnlocked: string[] = [];
	const unlockedSet = new Set(state.achievements);

	for (const ach of ACHIEVEMENTS) {
		if (unlockedSet.has(ach.id)) continue;
		try {
			if (ach.condition(state)) {
				newlyUnlocked.push(ach.id);
			}
		} catch {
			// Skip broken conditions
		}
	}

	return newlyUnlocked;
}

/**
 * Get an achievement definition by ID
 */
export function getAchievementDef(id: string): AchievementDef | undefined {
	return ACHIEVEMENTS.find(a => a.id === id);
}

// ─── EventBus Integration ────────────────────────────────────────────────────

/**
 * Wire up EventBus listeners to trigger achievement checks.
 * Call once at app startup.
 */
export function initAchievementListeners(): () => void {
	const unsubs: (() => void)[] = [];

	// Track mini-game stats for hidden achievements
	let miniGameAttempts = 0;
	let miniGameFails = 0;
	let firstMiniGame = true;

	function runCheck() {
		const state = get(gameState);
		const newIds = checkAchievements(state);
		if (newIds.length === 0) return;

		// Update game state with new achievements + timestamps
		const now = Date.now();
		gameState.update(s => {
			const newTimestamps = { ...(s.achievementTimestamps ?? {}) };
			for (const id of newIds) {
				newTimestamps[id] = now;
			}
			return {
				...s,
				achievements: [...s.achievements, ...newIds],
				achievementTimestamps: newTimestamps,
			};
		});

		// Emit events for each new achievement (triggers toasts)
		for (const id of newIds) {
			const def = getAchievementDef(id);
			if (def) {
				eventBus.emit('achievement:unlocked', {
					id: def.id,
					name: def.name,
					description: def.description,
				});
			}
		}
	}

	// Mini-game tracking for hidden achievements
	unsubs.push(eventBus.on('minigame:complete', (data: any) => {
		miniGameAttempts++;
		const state = get(gameState);
		const flags = (state as any)._achievementFlags ?? {};

		if (data?.success) {
			if (firstMiniGame) {
				// Speed Demon: first mini-game completed successfully
				gameState.update(s => ({
					...s,
					_achievementFlags: { ...((s as any)._achievementFlags ?? {}), speedDemon: true },
				} as any));
			}
		} else {
			miniGameFails++;
			if (miniGameFails >= 5) {
				gameState.update(s => ({
					...s,
					_achievementFlags: { ...((s as any)._achievementFlags ?? {}), oops: true },
				} as any));
			}
		}
		firstMiniGame = false;
		runCheck();
	}));

	// Check on key events
	unsubs.push(eventBus.on('production:complete', runCheck));
	unsubs.push(eventBus.on('upgrade:purchased', runCheck));
	unsubs.push(eventBus.on('tier:unlocked', runCheck));
	unsubs.push(eventBus.on('division:unlocked', runCheck));
	unsubs.push(eventBus.on('research:complete', runCheck));
	unsubs.push(eventBus.on('bottleneck:resolved', runCheck));
	unsubs.push(eventBus.on('synergy:discovered', runCheck));
	unsubs.push(eventBus.on('prestige:complete', runCheck));
	unsubs.push(eventBus.on('chief:hired', runCheck));
	unsubs.push(eventBus.on('contract:completed', runCheck));
	unsubs.push(eventBus.on('tab:changed', runCheck));

	// Periodic check for time-based achievements (night owl, marathon)
	const intervalId = setInterval(runCheck, 30_000);
	unsubs.push(() => clearInterval(intervalId));

	// Diamond Hands tracking
	let cryptoHoldStart = 0;
	const cryptoCheckId = setInterval(() => {
		const state = get(gameState);
		const treasury = state.treasury;
		if (!treasury) return;
		const totalCryptoValue = (treasury.btcOwned * treasury.btcPrice) + (treasury.dogeOwned * treasury.dogePrice);
		if (totalCryptoValue >= 10_000_000) {
			if (cryptoHoldStart === 0) cryptoHoldStart = Date.now();
			else if (Date.now() - cryptoHoldStart >= 5 * 60 * 1000) {
				gameState.update(s => ({
					...s,
					_achievementFlags: { ...((s as any)._achievementFlags ?? {}), diamondHands: true },
				} as any));
				runCheck();
			}
		} else {
			cryptoHoldStart = 0;
		}
	}, 10_000);
	unsubs.push(() => clearInterval(cryptoCheckId));

	return () => {
		for (const unsub of unsubs) unsub();
	};
}
