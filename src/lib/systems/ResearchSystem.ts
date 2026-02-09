/**
 * ResearchSystem.ts — Tech tree state, research progress, RP generation, and bonus calculations
 *
 * T037: Research node types and canResearch logic
 * T038: startResearch, completeResearch for UI integration
 * T039: RP generation (passive from divisions + per production cycle)
 *
 * Research bonuses are applied as multipliers in the production engine.
 */

import { get } from 'svelte/store';
import { gameState, type GameState } from '$lib/stores/gameState';
import { TECH_TREE, TECH_TREE_MAP } from '$lib/data/techTree';
import { eventBus } from '$lib/engine/EventBus';

// ── Types ──

export interface ResearchNode {
	id: string;
	name: string;
	description: string;
	cost: number; // Research Points
	timeMs: number; // Time to research in ms
	category: 'materials' | 'manufacturing' | 'software' | 'energy' | 'biotech' | 'aerospace' | 'infrastructure';
	prerequisites: string[]; // IDs of required research
	effects: ResearchEffect[];
	division?: string; // If division-specific, otherwise cross-division
}

export interface ResearchEffect {
	type: 'production_speed' | 'revenue_multiplier' | 'cost_reduction' | 'unlock_tier' | 'power_output' | 'synergy';
	target: string; // Division or system affected
	value: number; // Multiplier or flat bonus
	description: string;
}

export type NodeStatus = 'locked' | 'available' | 'researching' | 'completed';

// ── Status Queries ──

/**
 * Get the status of a research node given current game state
 */
export function getNodeStatus(
	node: ResearchNode,
	unlockedResearch: string[],
	activeResearch: { id: string; progress: number } | null
): NodeStatus {
	if (unlockedResearch.includes(node.id)) return 'completed';
	if (activeResearch?.id === node.id) return 'researching';
	const prereqsMet = node.prerequisites.every((id) => unlockedResearch.includes(id));
	if (prereqsMet) return 'available';
	return 'locked';
}

/**
 * Check if a research node can be started
 */
export function canResearch(
	node: ResearchNode,
	unlockedResearch: string[],
	availableRP: number,
	activeResearch: { id: string; progress: number } | null
): boolean {
	const prereqsMet = node.prerequisites.every((id) => unlockedResearch.includes(id));
	const canAfford = availableRP >= node.cost;
	const notAlreadyDone = !unlockedResearch.includes(node.id);
	const noActiveResearch = activeResearch === null;
	return prereqsMet && canAfford && notAlreadyDone && noActiveResearch;
}

// ── Actions ──

/**
 * Start researching a node. Deducts RP cost immediately.
 * Returns true if research was started.
 */
export function startResearch(nodeId: string): boolean {
	const node = TECH_TREE_MAP[nodeId];
	if (!node) return false;

	let started = false;

	gameState.update((state) => {
		if (!canResearch(node, state.unlockedResearch, state.researchPoints, state.activeResearch)) {
			return state;
		}

		started = true;
		return {
			...state,
			researchPoints: state.researchPoints - node.cost,
			activeResearch: { id: nodeId, progress: 0 },
		};
	});

	return started;
}

/**
 * Cancel active research. Refunds 50% of RP cost.
 * Returns true if research was cancelled.
 */
export function cancelResearch(): boolean {
	let cancelled = false;

	gameState.update((state) => {
		if (!state.activeResearch) return state;

		const node = TECH_TREE_MAP[state.activeResearch.id];
		const refund = node ? Math.floor(node.cost * 0.5) : 0;

		cancelled = true;
		return {
			...state,
			researchPoints: state.researchPoints + refund,
			activeResearch: null,
		};
	});

	return cancelled;
}

/**
 * Tick research progress forward by deltaMs.
 * Called from the game loop. Completes research when progress reaches 1.0.
 */
export function tickResearch(deltaMs: number): void {
	gameState.update((state) => {
		if (!state.activeResearch) return state;

		const node = TECH_TREE_MAP[state.activeResearch.id];
		if (!node) return state;

		const progressDelta = deltaMs / node.timeMs;
		const newProgress = state.activeResearch.progress + progressDelta;

		if (newProgress >= 1.0) {
			// Research complete!
			const newUnlocked = [...state.unlockedResearch, node.id];

			eventBus.emit('research:complete', { id: node.id, name: node.name });

			return {
				...state,
				unlockedResearch: newUnlocked,
				activeResearch: null,
				stats: {
					...state.stats,
					totalResearchCompleted: state.stats.totalResearchCompleted + 1,
				},
			};
		}

		return {
			...state,
			activeResearch: { id: state.activeResearch.id, progress: newProgress },
		};
	});
}

// ── RP Generation (T039) ──

/**
 * Calculate passive RP generation rate (RP per second).
 *
 * RP sources:
 * - Base: 0.1 RP/s per unlocked division
 * - Bonus: +0.05 RP/s per active tier (count > 0) across all divisions
 * - Chief bonus: +0.2 RP/s per division with a chief hired
 *
 * This rewards players who expand and automate.
 */
export function calculateRPPerSecond(state: GameState): number {
	let rpPerSec = 0;

	const divIds = ['teslaenergy', 'spacex', 'tesla'] as const;

	for (const divId of divIds) {
		const div = state.divisions[divId];
		if (!div.unlocked) continue;

		// Base RP from unlocked division
		rpPerSec += 0.1;

		// RP from active tiers
		for (const tier of div.tiers) {
			if (tier.unlocked && tier.count > 0) {
				rpPerSec += 0.05;
			}
		}

		// Chief bonus
		if (div.chiefLevel > 0) {
			rpPerSec += 0.2;
		}
	}

	return rpPerSec;
}

/**
 * Tick passive RP generation. Called from game loop every tick.
 * Accumulates fractional RP and adds whole amounts to state.
 */
let rpAccumulator = 0;

export function tickRPGeneration(deltaMs: number): void {
	gameState.update((state) => {
		const rpPerSec = calculateRPPerSecond(state);
		if (rpPerSec <= 0) return state;

		rpAccumulator += rpPerSec * (deltaMs / 1000);

		if (rpAccumulator >= 0.01) {
			const earned = rpAccumulator;
			rpAccumulator = 0;
			return {
				...state,
				researchPoints: state.researchPoints + earned,
			};
		}

		return state;
	});
}

// ── Bonus Calculations ──

/**
 * Calculate the cumulative production speed multiplier from completed research
 * for a given division. Returns 1.0 if no bonuses.
 */
export function getResearchSpeedMultiplier(divisionId: string, unlockedResearch: string[]): number {
	let multiplier = 1.0;

	for (const researchId of unlockedResearch) {
		const node = TECH_TREE_MAP[researchId];
		if (!node) continue;

		for (const effect of node.effects) {
			if (effect.type === 'production_speed' && effect.target === divisionId) {
				multiplier += effect.value;
			}
		}
	}

	return multiplier;
}

/**
 * Calculate the cumulative revenue multiplier from completed research
 * for a given division. Returns 1.0 if no bonuses.
 */
export function getResearchRevenueMultiplier(divisionId: string, unlockedResearch: string[]): number {
	let multiplier = 1.0;

	for (const researchId of unlockedResearch) {
		const node = TECH_TREE_MAP[researchId];
		if (!node) continue;

		for (const effect of node.effects) {
			if (effect.type === 'revenue_multiplier' && effect.target === divisionId) {
				multiplier += effect.value;
			}
		}
	}

	return multiplier;
}

/**
 * Calculate the cumulative cost reduction from completed research
 * for a given division. Returns a multiplier (e.g., 0.85 = 15% cheaper).
 */
export function getResearchCostMultiplier(divisionId: string, unlockedResearch: string[]): number {
	let reduction = 0;

	for (const researchId of unlockedResearch) {
		const node = TECH_TREE_MAP[researchId];
		if (!node) continue;

		for (const effect of node.effects) {
			if (effect.type === 'cost_reduction' && effect.target === divisionId) {
				reduction += effect.value;
			}
		}
	}

	// Cap at 50% reduction
	return Math.max(0.5, 1 - reduction);
}

/**
 * Calculate the power output multiplier from research.
 */
export function getResearchPowerMultiplier(unlockedResearch: string[]): number {
	let multiplier = 1.0;

	for (const researchId of unlockedResearch) {
		const node = TECH_TREE_MAP[researchId];
		if (!node) continue;

		for (const effect of node.effects) {
			if (effect.type === 'power_output') {
				multiplier += effect.value;
			}
		}
	}

	return multiplier;
}
