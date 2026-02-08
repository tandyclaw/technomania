/**
 * ProductionEngine.ts — Manages production cycles for all divisions
 * Hooks into the game loop to tick progress bars and award revenue
 *
 * Production flow:
 * 1. Player taps a tier → starts a production cycle (progress 0→1 over baseTime ms)
 * 2. When progress reaches 1.0, revenue is awarded and progress resets
 * 3. If chiefLevel > 0, production auto-restarts after completion
 * 4. Manual taps instantly complete one cycle (tap-to-produce)
 *
 * IMPORTANT: All state mutations create new object references for Svelte 5 reactivity.
 * gameState.update() with in-place mutation doesn't trigger $derived recomputation
 * because Svelte 5 tracks object identity for non-$state objects.
 */

import { get } from 'svelte/store';
import { gameState, type GameState, type TierState } from '$lib/stores/gameState';
import { DIVISIONS, type DivisionMeta } from '$lib/divisions';
import { calculateRevenue, calculateProductionTime } from '$lib/systems/ProductionSystem';
import { eventBus } from './EventBus';

const DIVISION_IDS = ['helios', 'apex', 'volt'] as const;
type DivisionId = (typeof DIVISION_IDS)[number];

/**
 * Clone state with new references for the parts that changed.
 * This ensures Svelte 5's $derived() picks up changes.
 */
function cloneState(state: GameState): GameState {
	return {
		...state,
		stats: { ...state.stats },
		divisions: {
			helios: {
				...state.divisions.helios,
				tiers: state.divisions.helios.tiers.map(t => ({ ...t })),
			},
			apex: {
				...state.divisions.apex,
				tiers: state.divisions.apex.tiers.map(t => ({ ...t })),
			},
			volt: {
				...state.divisions.volt,
				tiers: state.divisions.volt.tiers.map(t => ({ ...t })),
			},
		},
	};
}

/**
 * Tick all active production cycles forward by deltaMs
 * Called every game tick (1s) from the game loop
 */
export function tickProduction(deltaMs: number): void {
	gameState.update((state) => {
		const newState = cloneState(state);
		let changed = false;

		for (const divId of DIVISION_IDS) {
			const divState = newState.divisions[divId];
			if (!divState.unlocked) continue;

			const divMeta = DIVISIONS[divId];
			if (!divMeta) continue;

			for (let i = 0; i < divState.tiers.length; i++) {
				const tier = divState.tiers[i];
				if (!tier.unlocked || tier.count === 0) continue;
				if (!tier.producing) {
					// Auto-start production if chief is hired
					if (divState.chiefLevel > 0) {
						tier.producing = true;
						tier.progress = 0;
						changed = true;
					}
					continue;
				}

				const tierData = divMeta.tiers[i];
				if (!tierData) continue;

				const prodTimeMs = calculateProductionTime(tierData.config, divState.chiefLevel);
				const progressDelta = deltaMs / prodTimeMs;
				tier.progress += progressDelta;
				changed = true;

				// Check for production completion
				if (tier.progress >= 1.0) {
					const completedCycles = Math.floor(tier.progress);
					const revenue = calculateRevenue(tierData.config, tier.count, tier.level);
					const totalRevenue = revenue * completedCycles;

					newState.cash += totalRevenue;
					newState.totalValueEarned += totalRevenue;
					newState.stats.totalCashEarned += totalRevenue;

					eventBus.emit('production:complete', {
						division: divId,
						tier: i,
						amount: totalRevenue,
					});

					// Reset progress (keep fractional remainder for smooth cycling)
					if (divState.chiefLevel > 0) {
						// Auto-restart: keep remainder
						tier.progress = tier.progress - completedCycles;
					} else {
						// Manual: stop after completion
						tier.progress = 0;
						tier.producing = false;
					}
				}
			}

			// Recalculate power generation for Helios
			if (divId === 'helios') {
				let totalPower = 0;
				for (let i = 0; i < divState.tiers.length; i++) {
					const tier = divState.tiers[i];
					const tierData = divMeta.tiers[i];
					if (tier.unlocked && tier.count > 0 && tierData?.powerMW) {
						totalPower += tierData.powerMW * tier.count;
					}
				}
				newState.powerGenerated = totalPower;
			}
		}

		return changed ? newState : state;
	});
}

/**
 * Tap-to-produce: instantly complete one production cycle for a tier
 * Returns the revenue earned from the tap
 */
export function tapProduce(divisionId: string, tierIndex: number): number {
	let earned = 0;

	gameState.update((state) => {
		const divState = state.divisions[divisionId as DivisionId];
		if (!divState?.unlocked) return state;

		const tier = divState.tiers[tierIndex];
		if (!tier?.unlocked || tier.count === 0) return state;

		const divMeta = DIVISIONS[divisionId];
		const tierData = divMeta?.tiers[tierIndex];
		if (!tierData) return state;

		// Calculate revenue for one cycle
		const revenue = calculateRevenue(tierData.config, tier.count, tier.level);
		earned = revenue;

		// Clone state with new references
		const newState = cloneState(state);
		const newTier = newState.divisions[divisionId as DivisionId].tiers[tierIndex];

		// Award revenue
		newState.cash += revenue;
		newState.totalValueEarned += revenue;
		newState.stats.totalCashEarned += revenue;
		newState.stats.totalTaps += 1;

		// If currently producing, reset progress; otherwise start+complete
		newTier.progress = 0;
		newTier.producing = false; // Will restart on next tap or auto if chief hired

		eventBus.emit('production:complete', {
			division: divisionId,
			tier: tierIndex,
			amount: revenue,
		});

		return newState;
	});

	return earned;
}

/**
 * Start a production cycle for a tier (tap to begin, fills over time)
 */
export function startProduction(divisionId: string, tierIndex: number): void {
	gameState.update((state) => {
		const divState = state.divisions[divisionId as DivisionId];
		if (!divState?.unlocked) return state;

		const tier = divState.tiers[tierIndex];
		if (!tier?.unlocked || tier.count === 0) return state;

		// Start producing if not already
		if (!tier.producing) {
			const newState = cloneState(state);
			const newTier = newState.divisions[divisionId as DivisionId].tiers[tierIndex];
			newTier.producing = true;
			newTier.progress = 0;
			return newState;
		}

		return state;
	});
}

/**
 * Purchase a tier unit — spend cash to increase count
 * Returns true if purchase succeeded
 */
export function purchaseTier(divisionId: string, tierIndex: number): boolean {
	let success = false;

	gameState.update((state) => {
		const divState = state.divisions[divisionId as DivisionId];
		if (!divState?.unlocked) return state;

		const tier = divState.tiers[tierIndex];
		if (!tier?.unlocked) return state;

		const divMeta = DIVISIONS[divisionId];
		const tierData = divMeta?.tiers[tierIndex];
		if (!tierData) return state;

		// Calculate cost
		const cost = tierData.config.baseCost * Math.pow(tierData.config.costMultiplier, tier.count);

		if (state.cash < cost) return state;

		// Clone state with new references
		const newState = cloneState(state);
		const newDivState = newState.divisions[divisionId as DivisionId];
		const newTier = newDivState.tiers[tierIndex];

		// Deduct cost and increase count
		newState.cash -= cost;
		newTier.count += 1;

		// Unlock next tier if this is the first purchase
		if (newTier.count === 1 && tierIndex + 1 < newDivState.tiers.length) {
			newDivState.tiers[tierIndex + 1].unlocked = true;
		}

		success = true;

		eventBus.emit('upgrade:purchased', {
			division: divisionId,
			tier: tierIndex,
			level: newTier.level,
		});

		return newState;
	});

	return success;
}
