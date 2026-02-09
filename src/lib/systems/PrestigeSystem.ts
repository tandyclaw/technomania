/**
 * PrestigeSystem.ts — "Launch New Colony" mechanic + Vision Points
 *
 * Vision Points are the "angel investor" equivalent:
 * - Accumulate based on lifetime earnings (shown in real-time)
 * - Each VP gives +2% all revenue (permanent after reset)
 * - Can be "sacrificed" to buy mega-upgrades that persist through resets
 */

import type { GameState } from '$lib/stores/gameState';

/**
 * Calculate Colony Tech points earned from a colony launch
 */
export function calculateColonyTech(totalValueEarned: number): number {
	if (totalValueEarned <= 0) return 0;
	return Math.floor(Math.log10(totalValueEarned) * 10);
}

/**
 * Calculate the global multiplier from Colony Tech
 * Each point gives +3% to all production speed
 */
export function calculatePrestigeMultiplier(colonyTech: number): number {
	return 1 + colonyTech * 0.03;
}

/**
 * Calculate Vision Points earned so far (like angel investors accumulating in AdCap)
 * VP = floor(sqrt(totalValueEarned / 1e6))
 * This means they grow visibly as you earn more, creating that satisfying counter
 */
export function calculateVisionPoints(totalValueEarned: number): number {
	if (totalValueEarned < 1_000_000) return 0;
	return Math.floor(Math.sqrt(totalValueEarned / 1_000_000));
}

/**
 * Revenue multiplier from Vision Points: +2% per VP
 */
export function getVisionPointRevenueMultiplier(state: GameState): number {
	return 1 + (state.visionPoints ?? 0) * 0.02;
}

// === MEGA-UPGRADES (persist through resets, purchased with Vision Points) ===

export interface MegaUpgrade {
	id: string;
	name: string;
	description: string;
	cost: number; // in Vision Points
	effect: 'speed' | 'revenue' | 'vp_bonus';
	multiplier: number;
}

export const MEGA_UPGRADES: MegaUpgrade[] = [
	{ id: 'mega_speed_1', name: 'Hyper Chiefs', description: '2x all production speed', cost: 25, effect: 'speed', multiplier: 2 },
	{ id: 'mega_rev_1', name: 'Revenue Amplifier', description: '3x all revenue', cost: 50, effect: 'revenue', multiplier: 3 },
	{ id: 'mega_speed_2', name: 'Quantum Computing', description: '3x all production speed', cost: 100, effect: 'speed', multiplier: 3 },
	{ id: 'mega_rev_2', name: 'Galactic Contracts', description: '5x all revenue', cost: 200, effect: 'revenue', multiplier: 5 },
	{ id: 'mega_speed_3', name: 'Time Dilation Engine', description: '5x all production speed', cost: 500, effect: 'speed', multiplier: 5 },
	{ id: 'mega_vp_1', name: 'Vision Amplifier', description: 'VP revenue bonus doubled (2% → 4% per VP)', cost: 150, effect: 'vp_bonus', multiplier: 2 },
];

/**
 * Get combined mega-upgrade speed multiplier
 */
export function getMegaUpgradeSpeedMultiplier(state: GameState): number {
	const purchased = state.purchasedMegaUpgrades ?? [];
	let mult = 1;
	for (const id of purchased) {
		const mu = MEGA_UPGRADES.find(m => m.id === id);
		if (mu && mu.effect === 'speed') mult *= mu.multiplier;
	}
	return mult;
}

/**
 * Get combined mega-upgrade revenue multiplier
 */
export function getMegaUpgradeRevenueMultiplier(state: GameState): number {
	const purchased = state.purchasedMegaUpgrades ?? [];
	let mult = 1;
	for (const id of purchased) {
		const mu = MEGA_UPGRADES.find(m => m.id === id);
		if (mu && mu.effect === 'revenue') mult *= mu.multiplier;
	}
	return mult;
}

/**
 * Check if VP bonus is amplified by mega-upgrade
 */
function hasVPAmplifier(state: GameState): boolean {
	return (state.purchasedMegaUpgrades ?? []).includes('mega_vp_1');
}

/**
 * Colony milestones — each prestige unlocks new features
 */
export function getColonyMilestone(prestigeCount: number): {
	colony: number;
	name: string;
	destination: string;
	unlock: string;
} {
	const milestones = [
		{ colony: 0, name: 'Earth', destination: 'Home', unlock: 'Starting colony — build your empire' },
		{ colony: 1, name: 'Luna', destination: 'Moon Base', unlock: 'All divisions unlocked from start' },
		{ colony: 2, name: 'Mars Alpha', destination: 'Mars', unlock: 'Automated managers start at 50% discount' },
		{ colony: 3, name: 'Mars City', destination: 'Mars Expansion', unlock: 'Start with 1 free tier in each division' },
		{ colony: 4, name: 'Titan Outpost', destination: 'Saturn\'s Moon', unlock: 'Double offline earnings' },
		{ colony: 5, name: 'Interstellar', destination: 'Beyond the Solar System', unlock: '+50% to all Colony Tech bonuses' },
	];

	const idx = Math.min(prestigeCount, milestones.length - 1);
	return milestones[idx];
}

/**
 * Check if player should be nudged toward prestige
 */
export function shouldSuggestNewColony(
	currentRevenuePerSecond: number,
	peakRevenuePerSecond: number,
	totalValueEarned: number,
	currentColonyTech: number
): boolean {
	const potentialCT = calculateColonyTech(totalValueEarned);
	const newCT = potentialCT - currentColonyTech;
	if (newCT < 10) return false;
	if (peakRevenuePerSecond > 0 && currentRevenuePerSecond < peakRevenuePerSecond * 0.05) {
		return true;
	}
	return false;
}

/**
 * Format Colony Tech bonus for display
 */
export function formatColonyTechBonus(colonyTech: number): string {
	const multiplier = calculatePrestigeMultiplier(colonyTech);
	const percent = Math.round((multiplier - 1) * 100);
	return `+${percent}% production speed`;
}
