/**
 * MilestoneSystem.ts — AdCap-style milestone rewards
 * 
 * Milestones unlock permanent bonuses when you own X units of a specific tier.
 * Thresholds: 25, 50, 100, 200 units — each grants a speed or revenue multiplier.
 */

import type { GameState } from '$lib/stores/gameState';

export interface Milestone {
	divisionId: string;
	tierIndex: number;
	threshold: number;       // units needed
	rewardType: 'speed' | 'revenue';
	multiplier: number;      // e.g. 2 = 2x
	label: string;           // display label
}

/** All milestones across all divisions and tiers */
export const ALL_MILESTONES: Milestone[] = generateAllMilestones();

function generateAllMilestones(): Milestone[] {
	const milestones: Milestone[] = [];

	const divisions: { id: string; tiers: string[] }[] = [
		{ id: 'teslaenergy', tiers: ['Solar Panels', 'Home Battery', 'Commercial Battery', 'Solar Roof', 'Grid Battery Farm', 'Virtual Power Plant'] },
		{ id: 'spacex', tiers: ['Small Orbital Rocket', 'Reusable Booster', 'Crew Capsule', 'Heavy Lift Vehicle', 'Super Heavy Starship', 'Mars Lander'] },
		{ id: 'tesla', tiers: ['Electric Car Workshop', 'Vehicle Assembly Line', 'Gigafactory', 'Lithium Mines & Chip Fabs', 'Mars Fabricator', 'Colony Forge'] },
		{ id: 'ai', tiers: ['Chatbot', 'Language Model', 'AI Assistant', 'Autonomous Agent', 'Neural Network Hub', 'AGI'] },
		{ id: 'tunnels', tiers: ['Test Bore', 'City Tunnel', 'Transit Loop', 'Freight Network', 'Continental Link', 'Hyperloop'] },
	];

	// Pattern per tier: 25→2x speed, 50→2x revenue, 100→3x speed, 200→3x revenue
	const templates: { threshold: number; rewardType: 'speed' | 'revenue'; multiplier: number }[] = [
		{ threshold: 25,  rewardType: 'speed',   multiplier: 2 },
		{ threshold: 50,  rewardType: 'revenue', multiplier: 2 },
		{ threshold: 100, rewardType: 'speed',   multiplier: 3 },
		{ threshold: 200, rewardType: 'revenue', multiplier: 3 },
	];

	for (const div of divisions) {
		for (let ti = 0; ti < div.tiers.length; ti++) {
			for (const tmpl of templates) {
				milestones.push({
					divisionId: div.id,
					tierIndex: ti,
					threshold: tmpl.threshold,
					rewardType: tmpl.rewardType,
					multiplier: tmpl.multiplier,
					label: `${div.tiers[ti]} ×${tmpl.threshold} → ${tmpl.multiplier}x ${tmpl.rewardType}`,
				});
			}
		}
	}

	return milestones;
}

/**
 * Check if a milestone is unlocked given current game state
 */
export function isMilestoneUnlocked(milestone: Milestone, state: GameState): boolean {
	const div = state.divisions[milestone.divisionId as keyof typeof state.divisions];
	if (!div) return false;
	const tier = div.tiers[milestone.tierIndex];
	if (!tier) return false;
	return tier.count >= milestone.threshold;
}

/**
 * Get all unlocked milestones for a division
 */
export function getUnlockedMilestones(divisionId: string, state: GameState): Milestone[] {
	return ALL_MILESTONES.filter(m => m.divisionId === divisionId && isMilestoneUnlocked(m, state));
}

/**
 * Get the combined milestone speed multiplier for a specific tier
 */
export function getMilestoneSpeedMultiplier(divisionId: string, tierIndex: number, state: GameState): number {
	let mult = 1;
	for (const m of ALL_MILESTONES) {
		if (m.divisionId === divisionId && m.tierIndex === tierIndex && m.rewardType === 'speed' && isMilestoneUnlocked(m, state)) {
			mult *= m.multiplier;
		}
	}
	return mult;
}

/**
 * Get the combined milestone revenue multiplier for a specific tier
 */
export function getMilestoneRevenueMultiplier(divisionId: string, tierIndex: number, state: GameState): number {
	let mult = 1;
	for (const m of ALL_MILESTONES) {
		if (m.divisionId === divisionId && m.tierIndex === tierIndex && m.rewardType === 'revenue' && isMilestoneUnlocked(m, state)) {
			mult *= m.multiplier;
		}
	}
	return mult;
}

/**
 * Get milestones for a specific tier with unlock status
 */
export function getTierMilestones(divisionId: string, tierIndex: number, state: GameState): (Milestone & { unlocked: boolean })[] {
	return ALL_MILESTONES
		.filter(m => m.divisionId === divisionId && m.tierIndex === tierIndex)
		.map(m => ({ ...m, unlocked: isMilestoneUnlocked(m, state) }));
}

/**
 * Get next unlockable milestone for a tier (or null if all done)
 */
export function getNextMilestone(divisionId: string, tierIndex: number, state: GameState): (Milestone & { current: number }) | null {
	const div = state.divisions[divisionId as keyof typeof state.divisions];
	if (!div) return null;
	const tier = div.tiers[tierIndex];
	if (!tier) return null;

	const tierMilestones = ALL_MILESTONES
		.filter(m => m.divisionId === divisionId && m.tierIndex === tierIndex)
		.sort((a, b) => a.threshold - b.threshold);

	for (const m of tierMilestones) {
		if (tier.count < m.threshold) {
			return { ...m, current: tier.count };
		}
	}
	return null;
}

/**
 * Count total unlocked milestones for a division
 */
export function countUnlockedMilestones(divisionId: string, state: GameState): { unlocked: number; total: number } {
	const divMilestones = ALL_MILESTONES.filter(m => m.divisionId === divisionId);
	const unlocked = divMilestones.filter(m => isMilestoneUnlocked(m, state)).length;
	return { unlocked, total: divMilestones.length };
}
