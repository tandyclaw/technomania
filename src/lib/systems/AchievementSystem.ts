/**
 * AchievementSystem.ts — Achievement definitions, checking, and EventBus integration
 * T060 + T061: 30+ achievements across Income, Divisions, Production, Prestige, Special
 */

import { gameState, type GameState } from '$lib/stores/gameState';
import { eventBus } from '$lib/engine/EventBus';
import { get } from 'svelte/store';

export type AchievementCategory = 'income' | 'divisions' | 'production' | 'prestige' | 'special';

export interface AchievementDef {
	id: string;
	name: string;
	description: string;
	icon: string;
	category: AchievementCategory;
	condition: (state: GameState) => boolean;
}

export interface UnlockedAchievement {
	id: string;
	unlockedAt: number;
}

// ─── Achievement Definitions ─────────────────────────────────────────────────

export const ACHIEVEMENTS: AchievementDef[] = [
	// === Income ===
	{ id: 'income_100', name: 'Seed Money', description: 'Earn $100 total', icon: '💵', category: 'income',
		condition: (s) => s.stats.totalCashEarned >= 100 },
	{ id: 'income_1k', name: 'Four Figures', description: 'Earn $1,000 total', icon: '💰', category: 'income',
		condition: (s) => s.stats.totalCashEarned >= 1_000 },
	{ id: 'income_10k', name: 'Serious Capital', description: 'Earn $10,000 total', icon: '💰', category: 'income',
		condition: (s) => s.stats.totalCashEarned >= 10_000 },
	{ id: 'income_100k', name: 'Six Figures', description: 'Earn $100,000 total', icon: '🤑', category: 'income',
		condition: (s) => s.stats.totalCashEarned >= 100_000 },
	{ id: 'income_1m', name: 'Millionaire', description: 'Earn $1,000,000 total', icon: '🏦', category: 'income',
		condition: (s) => s.stats.totalCashEarned >= 1_000_000 },
	{ id: 'income_10m', name: 'Multi-Millionaire', description: 'Earn $10M total', icon: '💎', category: 'income',
		condition: (s) => s.stats.totalCashEarned >= 10_000_000 },
	{ id: 'income_100m', name: 'Centi-Millionaire', description: 'Earn $100M total', icon: '👑', category: 'income',
		condition: (s) => s.stats.totalCashEarned >= 100_000_000 },
	{ id: 'income_1b', name: 'Billionaire', description: 'Earn $1B total', icon: '🏆', category: 'income',
		condition: (s) => s.stats.totalCashEarned >= 1_000_000_000 },

	// === Divisions ===
	{ id: 'div_first', name: 'First Division', description: 'Unlock your first division', icon: '🏢', category: 'divisions',
		condition: (s) => Object.values(s.divisions).some(d => d.unlocked) },
	{ id: 'div_all', name: 'Full Portfolio', description: 'Unlock all divisions', icon: '🌐', category: 'divisions',
		condition: (s) => Object.values(s.divisions).every(d => d.unlocked) },
	{ id: 'div_spacex', name: 'To The Stars', description: 'Unlock Rockets division', icon: '🚀', category: 'divisions',
		condition: (s) => s.divisions.spacex.unlocked },
	{ id: 'div_tesla', name: 'Factory Floor', description: 'Unlock Manufacturing division', icon: '🏭', category: 'divisions',
		condition: (s) => s.divisions.tesla.unlocked },
	{ id: 'div_energy', name: 'Power Play', description: 'Unlock Energy division', icon: '☀️', category: 'divisions',
		condition: (s) => s.divisions.teslaenergy.unlocked },
	{ id: 'tier_all_spacex', name: 'Full Stack Rockets', description: 'Unlock all SpaceX tiers', icon: '🚀', category: 'divisions',
		condition: (s) => s.divisions.spacex.tiers.every(t => t.unlocked) },
	{ id: 'tier_all_tesla', name: 'Full Production', description: 'Unlock all Manufacturing tiers', icon: '🏭', category: 'divisions',
		condition: (s) => s.divisions.tesla.tiers.every(t => t.unlocked) },
	{ id: 'tier_all_energy', name: 'Grid Domination', description: 'Unlock all Energy tiers', icon: '☀️', category: 'divisions',
		condition: (s) => s.divisions.teslaenergy.tiers.every(t => t.unlocked) },
	{ id: 'chief_first', name: 'First Hire', description: 'Hire your first Chief', icon: '👔', category: 'divisions',
		condition: (s) => Object.values(s.divisions).some(d => d.chiefLevel > 0) },
	{ id: 'chief_all', name: 'Executive Team', description: 'Hire Chiefs for all divisions', icon: '👔', category: 'divisions',
		condition: (s) => Object.values(s.divisions).filter(d => d.unlocked).every(d => d.chiefLevel > 0) && Object.values(s.divisions).some(d => d.unlocked) },
	{ id: 'chief_max', name: 'C-Suite Complete', description: 'Max out all Chiefs', icon: '🎩', category: 'divisions',
		condition: (s) => Object.values(s.divisions).filter(d => d.unlocked).every(d => d.chiefLevel >= 6) && Object.values(s.divisions).some(d => d.unlocked) },

	// === Production ===
	{ id: 'prod_first', name: 'First Product', description: 'Buy your first tier unit', icon: '📦', category: 'production',
		condition: (s) => Object.values(s.divisions).some(d => d.tiers.some(t => t.count > 0)) },
	{ id: 'prod_10', name: 'Small Batch', description: 'Own 10 total units', icon: '📦', category: 'production',
		condition: (s) => countTotalUnits(s) >= 10 },
	{ id: 'prod_50', name: 'Assembly Line', description: 'Own 50 total units', icon: '🏭', category: 'production',
		condition: (s) => countTotalUnits(s) >= 50 },
	{ id: 'prod_100', name: 'Mass Production', description: 'Own 100 total units', icon: '🏭', category: 'production',
		condition: (s) => countTotalUnits(s) >= 100 },
	{ id: 'prod_500', name: 'Industrial Scale', description: 'Own 500 total units', icon: '⚙️', category: 'production',
		condition: (s) => countTotalUnits(s) >= 500 },
	{ id: 'prod_1000', name: 'Mega Factory', description: 'Own 1,000 total units', icon: '🔩', category: 'production',
		condition: (s) => countTotalUnits(s) >= 1_000 },
	{ id: 'taps_100', name: 'Clicker', description: 'Tap 100 times', icon: '👆', category: 'production',
		condition: (s) => s.stats.totalTaps >= 100 },
	{ id: 'taps_1000', name: 'Tap Master', description: 'Tap 1,000 times', icon: '🖱️', category: 'production',
		condition: (s) => s.stats.totalTaps >= 1_000 },

	// === Prestige ===
	{ id: 'prestige_first', name: 'First Colony', description: 'Launch your first colony', icon: '🪐', category: 'prestige',
		condition: (s) => s.prestigeCount >= 1 },
	{ id: 'prestige_3', name: 'Serial Founder', description: 'Launch 3 colonies', icon: '🪐', category: 'prestige',
		condition: (s) => s.prestigeCount >= 3 },
	{ id: 'prestige_5', name: 'Venture Legend', description: 'Launch 5 colonies', icon: '🏛️', category: 'prestige',
		condition: (s) => s.prestigeCount >= 5 },
	{ id: 'prestige_10', name: 'Colony Empire', description: 'Launch 10 colonies', icon: '💫', category: 'prestige',
		condition: (s) => s.prestigeCount >= 10 },

	// === Special ===
	{ id: 'synergy_first', name: 'Better Together', description: 'Discover your first synergy', icon: '🔗', category: 'special',
		condition: (s) => s.activeSynergies.length >= 1 },
	{ id: 'synergy_all', name: 'Fully Integrated', description: 'Discover all synergies', icon: '🔗', category: 'special',
		condition: (s) => s.activeSynergies.length >= 6 },
	{ id: 'bottleneck_first', name: 'Problem Solver', description: 'Resolve your first bottleneck', icon: '✅', category: 'special',
		condition: (s) => Object.values(s.divisions).some(d => d.bottlenecks.some(b => b.resolved)) },
	{ id: 'research_first', name: 'Eureka!', description: 'Complete your first research', icon: '🔬', category: 'special',
		condition: (s) => s.unlockedResearch.length >= 1 },
	{ id: 'research_10', name: 'R&D Department', description: 'Complete 10 research projects', icon: '🧪', category: 'special',
		condition: (s) => s.unlockedResearch.length >= 10 },
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

	function runCheck() {
		const state = get(gameState);
		const newIds = checkAchievements(state);
		if (newIds.length === 0) return;

		// Update game state with new achievements
		gameState.update(s => ({
			...s,
			achievements: [...s.achievements, ...newIds],
		}));

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

	return () => {
		for (const unsub of unsubs) unsub();
	};
}
