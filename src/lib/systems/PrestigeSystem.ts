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

// === PLANET CHAIN ===

export interface PlanetInfo {
	index: number;
	name: string;
	emoji: string;
	distance: string; // light years, or '—' for nearby
	costMultiplier: number;
	color: string;
	description: string;
}

const PLANET_CHAIN: PlanetInfo[] = [
	{ index: 0, name: 'Earth', emoji: '🌍', distance: '—', costMultiplier: 1, color: '#4488FF', description: 'Home world — build your empire' },
	{ index: 1, name: 'Mars', emoji: '🔴', distance: '—', costMultiplier: 1, color: '#FF4444', description: 'The red planet — humanity\'s first colony' },
	{ index: 2, name: 'Proxima Centauri b', emoji: '⭐', distance: '4.2 ly', costMultiplier: 2, color: '#FF8844', description: 'Our nearest stellar neighbor' },
	{ index: 3, name: 'TRAPPIST-1e', emoji: '🌍', distance: '39 ly', costMultiplier: 4, color: '#44FF88', description: 'Earth-sized world in the habitable zone' },
	{ index: 4, name: 'TRAPPIST-1f', emoji: '🌊', distance: '39 ly', costMultiplier: 6, color: '#44DDFF', description: 'A water world with vast oceans' },
	{ index: 5, name: 'TRAPPIST-1g', emoji: '🪐', distance: '39 ly', costMultiplier: 8, color: '#9944FF', description: 'The outer reaches of TRAPPIST-1' },
	{ index: 6, name: 'TOI-700d', emoji: '🌅', distance: '101 ly', costMultiplier: 12, color: '#FFCC44', description: 'Bathed in golden starlight' },
	{ index: 7, name: 'Teegarden\'s Star b', emoji: '🔥', distance: '12 ly', costMultiplier: 16, color: '#FF6644', description: 'Orbiting a dim red dwarf' },
	{ index: 8, name: 'LHS 1140b', emoji: '💎', distance: '49 ly', costMultiplier: 24, color: '#44FFDD', description: 'A super-Earth with a rocky surface' },
	{ index: 9, name: 'K2-18b', emoji: '🌌', distance: '124 ly', costMultiplier: 32, color: '#8844FF', description: 'Sub-Neptune with possible biosignatures' },
	{ index: 10, name: 'Kepler-442b', emoji: '💫', distance: '1,206 ly', costMultiplier: 50, color: '#FF44AA', description: 'One of the most Earth-like worlds known' },
	{ index: 11, name: 'Kepler-452b', emoji: '✨', distance: '1,402 ly', costMultiplier: 75, color: '#FFAA44', description: 'Earth\'s cousin — older and wiser' },
];

const DEEP_SPACE_COLORS = ['#FF44AA', '#FFAA44', '#44FF88', '#44DDFF', '#9944FF', '#FFCC44', '#FF6644', '#44FFDD', '#8844FF', '#4488FF'];

/**
 * Get planet info for a given prestige count (planet index).
 * Index 0 = Earth (starting), 1 = Mars (after first prestige), etc.
 */
export function getPlanetInfo(planetIndex: number): PlanetInfo {
	if (planetIndex < PLANET_CHAIN.length) {
		return PLANET_CHAIN[planetIndex];
	}
	// Deep Space procedural generation
	const deepSpaceNum = planetIndex - PLANET_CHAIN.length + 1;
	const colorIdx = (planetIndex - PLANET_CHAIN.length) % DEEP_SPACE_COLORS.length;
	const baseMult = 100;
	const costMultiplier = baseMult * Math.pow(1.5, deepSpaceNum - 1);
	return {
		index: planetIndex,
		name: `Deep Space Colony #${deepSpaceNum}`,
		emoji: '🌀',
		distance: '∞',
		costMultiplier: Math.round(costMultiplier),
		color: DEEP_SPACE_COLORS[colorIdx],
		description: `Frontier colony at the edge of the unknown`,
	};
}

/**
 * Get the cost multiplier for the current planet.
 * prestigeCount = number of prestiges done = index of current planet.
 */
export function getPlanetCostMultiplier(prestigeCount: number): number {
	return getPlanetInfo(prestigeCount).costMultiplier;
}

/**
 * @deprecated Use getPlanetInfo instead
 */
export function getColonyMilestone(prestigeCount: number): {
	colony: number;
	name: string;
	destination: string;
	unlock: string;
} {
	const planet = getPlanetInfo(prestigeCount);
	return {
		colony: planet.index,
		name: planet.name,
		destination: planet.name,
		unlock: planet.description,
	};
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
