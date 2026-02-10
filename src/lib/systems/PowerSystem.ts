/**
 * PowerSystem.ts — Power generation/consumption balance
 * The meta-game: every facility needs electricity
 *
 * Energy tiers GENERATE power (positive powerMW)
 * Rockets & Manufacturing tiers CONSUME power (negative powerMW)
 *
 * When consumption > generation, a power deficit exists.
 * Deficit reduces production speed for all non-Energy divisions.
 */

import type { GameState } from '$lib/stores/gameState';
import { DIVISIONS } from '$lib/divisions';

const DIVISION_IDS = ['teslaenergy', 'tesla', 'spacex', 'ai', 'tunnels', 'robotics'] as const;

/**
 * Recalculate total power generated and consumed from current game state.
 * Energy tiers have positive powerMW (generation).
 * Rockets/Manufacturing tiers have negative powerMW (consumption).
 * Returns { generated, consumed } in MW.
 */
export function calculatePowerBalance(state: GameState): { generated: number; consumed: number } {
	let generated = 0;
	let consumed = 0;

	for (const divId of DIVISION_IDS) {
		const divState = state.divisions[divId];
		if (!divState.unlocked) continue;

		const divMeta = DIVISIONS[divId];
		if (!divMeta) continue;

		for (let i = 0; i < divState.tiers.length; i++) {
			const tier = divState.tiers[i];
			if (!tier.unlocked || tier.count === 0) continue;

			const tierData = divMeta.tiers[i];
			if (!tierData?.powerMW) continue;

			const totalPower = tierData.powerMW * tier.count;
			if (totalPower > 0) {
				generated += totalPower;
			} else {
				consumed += Math.abs(totalPower);
			}
		}
	}

	return { generated, consumed };
}

/**
 * Calculate efficiency multiplier based on power availability.
 * - surplus or balanced → 1.0 (full speed)
 * - deficit → generated / consumed (e.g. 0.5 = 50% speed)
 * - no consumers → 1.0
 *
 * Minimum efficiency is 0.1 (10%) to prevent complete standstill.
 */
export function calculatePowerEfficiency(generated: number, consumed: number): number {
	if (consumed === 0) return 1;
	if (generated >= consumed) return 1;
	return Math.max(0.1, generated / consumed);
}

/**
 * Determine power status for UI display.
 */
export function getPowerStatus(generated: number, consumed: number): 'ok' | 'warning' | 'deficit' {
	if (generated === 0 && consumed === 0) return 'ok';
	if (consumed > generated) return 'deficit';
	if (consumed > generated * 0.8) return 'warning';
	return 'ok';
}
