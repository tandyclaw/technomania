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

export type MegaUpgradeEffect = 'speed' | 'revenue' | 'vp_bonus' | 'starting_cash' | 'auto_chiefs' | 'lucky_start' | 'warp_drive';

export type MegaUpgradeCategory = 'Speed' | 'Revenue' | 'Starting Cash' | 'Auto-Chiefs' | 'Lucky Events' | 'Special';

export interface MegaUpgrade {
	id: string;
	name: string;
	description: string;
	cost: number; // in Vision Points
	effect: MegaUpgradeEffect;
	multiplier: number;
	category: MegaUpgradeCategory;
}

export const MEGA_UPGRADES: MegaUpgrade[] = [
	// Speed
	{ id: 'mega_speed_1', name: 'Hyper Chiefs', description: '2× all production speed', cost: 25, effect: 'speed', multiplier: 2, category: 'Speed' },
	{ id: 'mega_speed_2', name: 'Quantum Computing', description: '3× all production speed', cost: 100, effect: 'speed', multiplier: 3, category: 'Speed' },
	{ id: 'mega_speed_3', name: 'Time Dilation Engine', description: '5× all production speed', cost: 500, effect: 'speed', multiplier: 5, category: 'Speed' },
	{ id: 'mega_warp_1', name: 'Warp Drive I', description: 'Reduce all cycle times by 10% (stacks)', cost: 75, effect: 'warp_drive', multiplier: 0.9, category: 'Speed' },
	{ id: 'mega_warp_2', name: 'Warp Drive II', description: 'Reduce all cycle times by another 10%', cost: 300, effect: 'warp_drive', multiplier: 0.9, category: 'Speed' },

	// Revenue
	{ id: 'mega_rev_1', name: 'Revenue Amplifier', description: '3× all revenue', cost: 50, effect: 'revenue', multiplier: 3, category: 'Revenue' },
	{ id: 'mega_rev_2', name: 'Galactic Contracts', description: '5× all revenue', cost: 200, effect: 'revenue', multiplier: 5, category: 'Revenue' },
	{ id: 'mega_vp_1', name: 'Vision Amplifier', description: 'VP revenue bonus doubled (2% → 4% per VP)', cost: 150, effect: 'vp_bonus', multiplier: 2, category: 'Revenue' },

	// Starting Cash
	{ id: 'mega_cash_1', name: 'Seed Fund', description: 'Start each colony with $10K', cost: 30, effect: 'starting_cash', multiplier: 10_000, category: 'Starting Cash' },
	{ id: 'mega_cash_2', name: 'Venture Capital', description: 'Start each colony with $100K', cost: 120, effect: 'starting_cash', multiplier: 100_000, category: 'Starting Cash' },

	// Auto-Chiefs
	{ id: 'mega_chiefs_1', name: 'Start with Chiefs I', description: 'Begin each colony with Lv1 chiefs in first 3 divisions', cost: 80, effect: 'auto_chiefs', multiplier: 1, category: 'Auto-Chiefs' },
	{ id: 'mega_chiefs_2', name: 'Start with Chiefs II', description: 'Begin each colony with Lv1 chiefs in ALL divisions', cost: 250, effect: 'auto_chiefs', multiplier: 2, category: 'Auto-Chiefs' },

	// Lucky Events
	{ id: 'mega_lucky_1', name: 'Lucky Start', description: '2× event frequency for first 10 min after colony', cost: 60, effect: 'lucky_start', multiplier: 2, category: 'Lucky Events' },
	{ id: 'mega_lucky_2', name: 'Fortune Favors the Bold', description: '3× event frequency for first 10 min after colony', cost: 200, effect: 'lucky_start', multiplier: 3, category: 'Lucky Events' },
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
 * Get warp drive cycle time multiplier (stacks multiplicatively)
 */
export function getWarpDriveMultiplier(state: GameState): number {
	const purchased = state.purchasedMegaUpgrades ?? [];
	let mult = 1;
	for (const id of purchased) {
		const mu = MEGA_UPGRADES.find(m => m.id === id);
		if (mu && mu.effect === 'warp_drive') mult *= mu.multiplier;
	}
	return mult;
}

/**
 * Get starting cash bonus from mega-upgrades (takes highest)
 */
export function getStartingCashBonus(state: GameState): number {
	const purchased = state.purchasedMegaUpgrades ?? [];
	let best = 0;
	for (const id of purchased) {
		const mu = MEGA_UPGRADES.find(m => m.id === id);
		if (mu && mu.effect === 'starting_cash' && mu.multiplier > best) best = mu.multiplier;
	}
	return best;
}

/**
 * Get auto-chiefs level from mega-upgrades (1 = first 3 divisions, 2 = all)
 */
export function getAutoChiefsLevel(state: GameState): number {
	const purchased = state.purchasedMegaUpgrades ?? [];
	let level = 0;
	for (const id of purchased) {
		const mu = MEGA_UPGRADES.find(m => m.id === id);
		if (mu && mu.effect === 'auto_chiefs' && mu.multiplier > level) level = mu.multiplier;
	}
	return level;
}

/**
 * Get lucky start event frequency multiplier
 */
export function getLuckyStartMultiplier(state: GameState): number {
	const purchased = state.purchasedMegaUpgrades ?? [];
	let best = 1;
	for (const id of purchased) {
		const mu = MEGA_UPGRADES.find(m => m.id === id);
		if (mu && mu.effect === 'lucky_start' && mu.multiplier > best) best = mu.multiplier;
	}
	return best;
}

/**
 * Get unique mega-upgrade categories that have at least one upgrade
 */
export function getMegaUpgradeCategories(): MegaUpgradeCategory[] {
	const cats = new Set<MegaUpgradeCategory>();
	for (const mu of MEGA_UPGRADES) cats.add(mu.category);
	return Array.from(cats);
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

// === PRESTIGE MILESTONES ===

export interface PrestigeMilestone {
	colonies: number;
	name: string;
	emoji: string;
	bonus: string;
	description: string;
	effect: 'speed' | 'revenue' | 'vp_earn' | 'starting_tech';
	multiplier: number;
}

export const PRESTIGE_MILESTONES: PrestigeMilestone[] = [
	{ colonies: 2, name: 'Dual Colony', emoji: '🌐', bonus: '+10% speed', description: 'Two worlds under your banner', effect: 'speed', multiplier: 1.10 },
	{ colonies: 5, name: 'Star Network', emoji: '🌟', bonus: '+25% revenue', description: 'A network of thriving colonies', effect: 'revenue', multiplier: 1.25 },
	{ colonies: 8, name: 'Galactic Presence', emoji: '🛸', bonus: '+50% VP earned', description: 'Your vision echoes across the stars', effect: 'vp_earn', multiplier: 1.50 },
	{ colonies: 10, name: 'Decaworld', emoji: '👑', bonus: '2× speed', description: 'Ten worlds bow to your genius', effect: 'speed', multiplier: 2.0 },
	{ colonies: 15, name: 'Stellar Empire', emoji: '⚡', bonus: '3× revenue', description: 'An empire spanning light-years', effect: 'revenue', multiplier: 3.0 },
	{ colonies: 20, name: 'Cosmic Dominion', emoji: '🔮', bonus: '5× speed', description: 'Reality bends to your will', effect: 'speed', multiplier: 5.0 },
	{ colonies: 30, name: 'Multiverse Architect', emoji: '🌀', bonus: '10× revenue', description: 'You have transcended mere colonization', effect: 'revenue', multiplier: 10.0 },
];

/**
 * Get all milestones achieved at a given colony count
 */
export function getAchievedMilestones(prestigeCount: number): PrestigeMilestone[] {
	return PRESTIGE_MILESTONES.filter(m => prestigeCount >= m.colonies);
}

/**
 * Get the next unachieved milestone
 */
export function getNextMilestone(prestigeCount: number): PrestigeMilestone | null {
	return PRESTIGE_MILESTONES.find(m => prestigeCount < m.colonies) ?? null;
}

/**
 * Get combined milestone speed multiplier
 */
export function getMilestoneSpeedMultiplier(prestigeCount: number): number {
	let mult = 1;
	for (const m of PRESTIGE_MILESTONES) {
		if (prestigeCount >= m.colonies && m.effect === 'speed') mult *= m.multiplier;
	}
	return mult;
}

/**
 * Get combined milestone revenue multiplier
 */
export function getMilestoneRevenueMultiplier(prestigeCount: number): number {
	let mult = 1;
	for (const m of PRESTIGE_MILESTONES) {
		if (prestigeCount >= m.colonies && m.effect === 'revenue') mult *= m.multiplier;
	}
	return mult;
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
