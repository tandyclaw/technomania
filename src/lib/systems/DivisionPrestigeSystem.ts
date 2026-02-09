/**
 * DivisionPrestigeSystem.ts — Reset individual divisions for permanent division-specific bonuses
 *
 * Each division can be "reset" independently (without full colony prestige).
 * Requirements: all 6 tiers owned, minimum count thresholds.
 * On reset: lose all tiers/counts in that division, gain "Division Stars".
 * Each star gives: +10% revenue, +5% speed for that division permanently.
 * Stars persist through colony prestiges.
 */

import { get } from 'svelte/store';
import { gameState, type GameState } from '$lib/stores/gameState';
import { DIVISIONS } from '$lib/divisions';
import { eventBus } from '$lib/engine/EventBus';

/** Minimum count per tier required before division prestige is available */
const MIN_TIER_COUNTS = [25, 20, 15, 10, 5, 3];

const DIVISION_IDS = ['spacex', 'tesla', 'teslaenergy', 'ai', 'tunnels', 'robotics'] as const;
type DivisionId = (typeof DIVISION_IDS)[number];

/**
 * Check if a division is eligible for prestige reset
 */
export function canPrestigeDivision(state: GameState, divisionId: string): boolean {
	const divState = state.divisions[divisionId as DivisionId];
	if (!divState?.unlocked) return false;

	// All 6 tiers must be unlocked and meet minimum count thresholds
	for (let i = 0; i < divState.tiers.length; i++) {
		const tier = divState.tiers[i];
		if (!tier.unlocked) return false;
		const minCount = MIN_TIER_COUNTS[i] ?? 3;
		if (tier.count < minCount) return false;
	}

	return true;
}

/**
 * Get the minimum tier count requirements for display
 */
export function getDivisionPrestigeRequirements(): number[] {
	return [...MIN_TIER_COUNTS];
}

/**
 * Get the number of Division Stars for a division
 */
export function getDivisionStars(state: GameState, divisionId: string): number {
	return (state.divisionStars as Record<string, number> | undefined)?.[divisionId] ?? 0;
}

/**
 * Get the revenue multiplier from Division Stars (+10% per star)
 */
export function getDivisionStarRevenueMultiplier(state: GameState, divisionId: string): number {
	const stars = getDivisionStars(state, divisionId);
	return 1 + stars * 0.10;
}

/**
 * Get the speed multiplier from Division Stars (+5% per star)
 */
export function getDivisionStarSpeedMultiplier(state: GameState, divisionId: string): number {
	const stars = getDivisionStars(state, divisionId);
	return 1 + stars * 0.05;
}

/**
 * Perform a division prestige reset.
 * Resets all tiers/counts in the division, awards a Division Star.
 * Returns true if successful.
 */
export function prestigeDivision(divisionId: string): boolean {
	let success = false;

	gameState.update((state) => {
		if (!canPrestigeDivision(state, divisionId)) return state;

		const newState = {
			...state,
			divisions: {
				...state.divisions,
				[divisionId]: {
					...state.divisions[divisionId as DivisionId],
					// Reset tiers: keep unlocked state for first tier only, zero counts
					tiers: state.divisions[divisionId as DivisionId].tiers.map((t, i) => ({
						unlocked: i === 0,
						count: 0,
						level: 0,
						producing: false,
						progress: 0,
					})),
					// Keep chief level
					chiefLevel: state.divisions[divisionId as DivisionId].chiefLevel,
					bottlenecks: [],
				},
			},
			divisionStars: {
				...(state.divisionStars ?? {}),
				[divisionId]: ((state.divisionStars as Record<string, number> | undefined)?.[divisionId] ?? 0) + 1,
			},
		};

		success = true;
		return newState;
	});

	if (success) {
		eventBus.emit('division:prestige', { division: divisionId });
	}

	return success;
}
