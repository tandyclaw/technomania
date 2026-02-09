/**
 * SynergySystem.ts — Cross-division bonus calculations
 * Synergies are discovered by developing multiple divisions simultaneously
 *
 * How synergies work:
 * - Each synergy has a source and target division
 * - Activation requires minimum tier count (units owned) in both divisions
 * - Once active, the synergy applies a bonus to the target division's production
 * - Bonuses stack multiplicatively with other modifiers (power, prestige)
 */

import type { GameState } from '$lib/stores/gameState';

// --- Types ---

export type SynergyEffectType = 'cost_reduction' | 'speed_boost' | 'revenue_boost';

export interface SynergyEffect {
	type: SynergyEffectType;
	/** Multiplier value, e.g. 0.15 = 15% bonus */
	value: number;
}

export interface SynergyRequirement {
	/** Division that enables the synergy */
	sourceDivision: string;
	/** Minimum number of tiers unlocked in source division */
	sourceMinTiers: number;
	/** Division that benefits from the synergy */
	targetDivision: string;
	/** Minimum number of tiers unlocked in target division */
	targetMinTiers: number;
}

export interface Synergy {
	id: string;
	name: string;
	description: string;
	/** Flavor text explanation */
	flavorText: string;
	icon: string;
	requirement: SynergyRequirement;
	effect: SynergyEffect;
}

export interface ActiveSynergy {
	id: string;
	/** When this synergy was first activated (timestamp) */
	activatedAt: number;
}

// --- MVP Synergy Definitions ---

export const MVP_SYNERGIES: Synergy[] = [
	{
		id: 'teslaenergy_spacex_power',
		name: 'Powered Launch Complex',
		description: 'Clean energy powers rocket facilities, reducing power deficit penalties.',
		flavorText: 'Launch sites run on solar. Every rocket powered by the sun.',
		icon: '⚡🚀',
		requirement: {
			sourceDivision: 'teslaenergy',
			sourceMinTiers: 2,
			targetDivision: 'spacex',
			targetMinTiers: 2,
		},
		effect: { type: 'speed_boost', value: 0.15 },
	},
	{
		id: 'tesla_teslaenergy_batteries',
		name: 'Integrated Supply Chain',
		description: 'Manufacturing and Energy share battery cell production, boosting output for both.',
		flavorText: 'Same cells, same factory, two products. Vertical integration.',
		icon: '🏭☀️',
		requirement: {
			sourceDivision: 'tesla',
			sourceMinTiers: 2,
			targetDivision: 'teslaenergy',
			targetMinTiers: 2,
		},
		effect: { type: 'revenue_boost', value: 0.20 },
	},
	{
		id: 'teslaenergy_tesla_batteries',
		name: 'Gigafactory Synergy',
		description: 'Energy battery tech feeds back into manufacturing efficiency and throughput.',
		flavorText: 'Next-gen cells change everything. Energy density is destiny.',
		icon: '☀️🔋',
		requirement: {
			sourceDivision: 'teslaenergy',
			sourceMinTiers: 3,
			targetDivision: 'tesla',
			targetMinTiers: 3,
		},
		effect: { type: 'revenue_boost', value: 0.15 },
	},
	{
		id: 'spacex_tesla_materials',
		name: 'Aerospace Materials Transfer',
		description: 'Rocket-grade alloys and composites improve factory output quality.',
		flavorText: 'Stainless steel expertise from rockets to production lines.',
		icon: '🚀🏭',
		requirement: {
			sourceDivision: 'spacex',
			sourceMinTiers: 3,
			targetDivision: 'tesla',
			targetMinTiers: 4,
		},
		effect: { type: 'speed_boost', value: 0.10 },
	},
	// ── AI Synergies ─────────────────────────────────────────────────────────
	{
		id: 'ai_tesla_autopilot',
		name: 'AI-Powered Autopilot',
		description: 'AI models dramatically improve self-driving capabilities.',
		flavorText: 'Neural nets trained on billions of miles of driving data.',
		icon: '🤖🚗',
		requirement: {
			sourceDivision: 'ai',
			sourceMinTiers: 2,
			targetDivision: 'tesla',
			targetMinTiers: 2,
		},
		effect: { type: 'revenue_boost', value: 0.20 },
	},
	{
		id: 'ai_spacex_guidance',
		name: 'AI Flight Guidance',
		description: 'AI optimizes rocket trajectories and landing algorithms.',
		flavorText: 'Machine learning lands rockets better than humans ever could.',
		icon: '🤖🚀',
		requirement: {
			sourceDivision: 'ai',
			sourceMinTiers: 3,
			targetDivision: 'spacex',
			targetMinTiers: 3,
		},
		effect: { type: 'speed_boost', value: 0.15 },
	},
	{
		id: 'teslaenergy_ai_datacenter',
		name: 'Solar-Powered Data Centers',
		description: 'Clean energy reduces AI compute costs significantly.',
		flavorText: 'GPU clusters running on free photons from the sun.',
		icon: '☀️🤖',
		requirement: {
			sourceDivision: 'teslaenergy',
			sourceMinTiers: 3,
			targetDivision: 'ai',
			targetMinTiers: 2,
		},
		effect: { type: 'cost_reduction', value: 0.15 },
	},
	// ── Tunnels Synergies ────────────────────────────────────────────────────
	{
		id: 'tesla_tunnels_evtransit',
		name: 'EV Transit Fleet',
		description: 'Electric vehicles fill tunnel transit loops.',
		flavorText: 'Autonomous EVs shuttle passengers through underground networks.',
		icon: '🚗🚇',
		requirement: {
			sourceDivision: 'tesla',
			sourceMinTiers: 3,
			targetDivision: 'tunnels',
			targetMinTiers: 2,
		},
		effect: { type: 'revenue_boost', value: 0.20 },
	},
	{
		id: 'tunnels_teslaenergy_geothermal',
		name: 'Geothermal Boring',
		description: 'Tunnel boring tech enables geothermal energy extraction.',
		flavorText: 'The same machines that dig transit tunnels can tap Earth\'s heat.',
		icon: '🚇☀️',
		requirement: {
			sourceDivision: 'tunnels',
			sourceMinTiers: 3,
			targetDivision: 'teslaenergy',
			targetMinTiers: 3,
		},
		effect: { type: 'revenue_boost', value: 0.15 },
	},
	{
		id: 'ai_tunnels_routing',
		name: 'AI-Optimized Routing',
		description: 'AI plans optimal tunnel routes through complex geology.',
		flavorText: 'Ground-penetrating radar + neural nets = perfect bore paths.',
		icon: '🤖🚇',
		requirement: {
			sourceDivision: 'ai',
			sourceMinTiers: 2,
			targetDivision: 'tunnels',
			targetMinTiers: 2,
		},
		effect: { type: 'speed_boost', value: 0.15 },
	},
	// ── Robotics Synergies ───────────────────────────────────────────────────
	{
		id: 'robotics_tesla_assembly',
		name: 'Automated Assembly',
		description: 'Robots build EVs faster on the production line.',
		flavorText: 'Robotic arms weld, paint, and assemble vehicles 24/7 without breaks.',
		icon: '🦾🚗',
		requirement: {
			sourceDivision: 'robotics',
			sourceMinTiers: 2,
			targetDivision: 'tesla',
			targetMinTiers: 2,
		},
		effect: { type: 'speed_boost', value: 0.20 },
	},
	{
		id: 'robotics_tunnels_boring',
		name: 'Robotic Boring',
		description: 'Robots operate boring machines, reducing tunnel construction costs.',
		flavorText: 'Autonomous robots work in conditions too dangerous for humans.',
		icon: '🦾🚇',
		requirement: {
			sourceDivision: 'robotics',
			sourceMinTiers: 3,
			targetDivision: 'tunnels',
			targetMinTiers: 2,
		},
		effect: { type: 'cost_reduction', value: 0.15 },
	},
	{
		id: 'ai_robotics_neural',
		name: 'Neural Control',
		description: 'AI makes robots smarter — better perception, planning, and dexterity.',
		flavorText: 'Neural networks give robots human-level hand-eye coordination.',
		icon: '🤖🦾',
		requirement: {
			sourceDivision: 'ai',
			sourceMinTiers: 3,
			targetDivision: 'robotics',
			targetMinTiers: 2,
		},
		effect: { type: 'revenue_boost', value: 0.20 },
	},
	{
		id: 'teslaenergy_spacex_supercharger',
		name: 'Solar-Powered Mission Control',
		description: 'Battery farms provide backup power for mission-critical launch systems.',
		flavorText: 'Redundancy is everything when you\'re landing rockets.',
		icon: '☀️🚀',
		requirement: {
			sourceDivision: 'teslaenergy',
			sourceMinTiers: 4,
			targetDivision: 'spacex',
			targetMinTiers: 4,
		},
		effect: { type: 'revenue_boost', value: 0.20 },
	},
];

// --- Synergy Detection Engine ---

/**
 * Count how many tiers have at least 1 unit in a division
 */
function countUnlockedAndOwnedTiers(state: GameState, divisionId: string): number {
	const divState = state.divisions[divisionId as keyof typeof state.divisions];
	if (!divState?.unlocked) return 0;
	return divState.tiers.filter((t) => t.unlocked && t.count > 0).length;
}

/**
 * Check if a single synergy's requirements are met
 */
export function isSynergyActive(state: GameState, synergy: Synergy): boolean {
	const sourceTiers = countUnlockedAndOwnedTiers(state, synergy.requirement.sourceDivision);
	const targetTiers = countUnlockedAndOwnedTiers(state, synergy.requirement.targetDivision);
	return (
		sourceTiers >= synergy.requirement.sourceMinTiers &&
		targetTiers >= synergy.requirement.targetMinTiers
	);
}

/**
 * Get all currently active synergies from the full synergy list
 */
export function getActiveSynergies(state: GameState, allSynergies: Synergy[] = MVP_SYNERGIES): Synergy[] {
	return allSynergies.filter((s) => isSynergyActive(state, s));
}

/**
 * Calculate the combined synergy multiplier for a specific division and effect type.
 * Multipliers stack additively: 15% + 20% = 35% bonus → 1.35x multiplier.
 */
export function getSynergyMultiplier(
	activeSynergies: Synergy[],
	targetDivision: string,
	effectType: SynergyEffectType
): number {
	let bonus = 0;
	for (const synergy of activeSynergies) {
		if (synergy.requirement.targetDivision === targetDivision && synergy.effect.type === effectType) {
			bonus += synergy.effect.value;
		}
	}
	return 1 + bonus;
}

/**
 * Get all synergy bonuses for a division, grouped by effect type.
 * Returns a summary object for UI display.
 */
export function getDivisionSynergyBonuses(
	activeSynergies: Synergy[],
	divisionId: string
): { speedBoost: number; revenueBoost: number; costReduction: number; synergies: Synergy[] } {
	const relevant = activeSynergies.filter((s) => s.requirement.targetDivision === divisionId);
	return {
		speedBoost: getSynergyMultiplier(relevant, divisionId, 'speed_boost') - 1,
		revenueBoost: getSynergyMultiplier(relevant, divisionId, 'revenue_boost') - 1,
		costReduction: getSynergyMultiplier(relevant, divisionId, 'cost_reduction') - 1,
		synergies: relevant,
	};
}

/**
 * Get a progress report for all synergies — how close the player is to activating each one.
 */
export function getSynergyProgress(
	state: GameState,
	allSynergies: Synergy[] = MVP_SYNERGIES
): Array<{ synergy: Synergy; active: boolean; sourceProgress: number; targetProgress: number }> {
	return allSynergies.map((synergy) => {
		const sourceTiers = countUnlockedAndOwnedTiers(state, synergy.requirement.sourceDivision);
		const targetTiers = countUnlockedAndOwnedTiers(state, synergy.requirement.targetDivision);
		const sourceProgress = Math.min(1, sourceTiers / synergy.requirement.sourceMinTiers);
		const targetProgress = Math.min(1, targetTiers / synergy.requirement.targetMinTiers);
		return {
			synergy,
			active: sourceProgress >= 1 && targetProgress >= 1,
			sourceProgress,
			targetProgress,
		};
	});
}
