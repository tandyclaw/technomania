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
 * Power system (T019):
 * - Tesla Energy tiers generate power (positive powerMW)
 * - SpaceX/Tesla tiers consume power (negative powerMW)
 * - When consumed > generated, non-Tesla Energy production speed is reduced
 * - Minimum 10% efficiency to avoid total standstill
 *
 * IMPORTANT: All state mutations create new object references for Svelte 5 reactivity.
 * gameState.update() with in-place mutation doesn't trigger $derived recomputation
 * because Svelte 5 tracks object identity for non-$state objects.
 */

import { get } from 'svelte/store';
import { gameState, type GameState, type TierState } from '$lib/stores/gameState';
import { DIVISIONS, type DivisionMeta } from '$lib/divisions';
import { calculateRevenue, calculateProductionTime } from '$lib/systems/ProductionSystem';
import { calculatePowerBalance, calculatePowerEfficiency } from '$lib/systems/PowerSystem';
import { getNextChiefCost } from '$lib/systems/ChiefSystem';
import { getDivisionUnlockCost } from '$lib/systems/DivisionUnlockSystem';
import { eventBus } from './EventBus';

const DIVISION_IDS = ['teslaenergy', 'spacex', 'tesla'] as const;
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
			teslaenergy: {
				...state.divisions.teslaenergy,
				tiers: state.divisions.teslaenergy.tiers.map(t => ({ ...t })),
			},
			spacex: {
				...state.divisions.spacex,
				tiers: state.divisions.spacex.tiers.map(t => ({ ...t })),
			},
			tesla: {
				...state.divisions.tesla,
				tiers: state.divisions.tesla.tiers.map(t => ({ ...t })),
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

		// Calculate power balance from current state for efficiency multiplier
		const { generated, consumed } = calculatePowerBalance(state);
		const powerEfficiency = calculatePowerEfficiency(generated, consumed);

		// Update power tracking in state
		newState.powerGenerated = generated;
		newState.powerConsumed = consumed;
		if (generated !== state.powerGenerated || consumed !== state.powerConsumed) {
			changed = true;
		}

		for (const divId of DIVISION_IDS) {
			const divState = newState.divisions[divId];
			if (!divState.unlocked) continue;

			const divMeta = DIVISIONS[divId];
			if (!divMeta) continue;

			// Power deficit slows non-Tesla Energy divisions
			// Tesla Energy always runs at full speed (it generates the power!)
			const efficiencyMult = divId === 'teslaenergy' ? 1 : powerEfficiency;

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
				// Apply power efficiency to production speed
				const effectiveProdTimeMs = prodTimeMs / efficiencyMult;
				const progressDelta = deltaMs / effectiveProdTimeMs;
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

		// Recalculate power after state change
		const { generated, consumed } = calculatePowerBalance(newState);
		newState.powerGenerated = generated;
		newState.powerConsumed = consumed;

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

		// Recalculate power after purchase (new facility adds generation or consumption)
		const { generated, consumed } = calculatePowerBalance(newState);
		newState.powerGenerated = generated;
		newState.powerConsumed = consumed;

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

/**
 * Hire or upgrade a division chief
 * Returns the new chief level, or 0 if purchase failed
 */
export function hireChief(divisionId: string): number {
	let newLevel = 0;

	gameState.update((state) => {
		const divState = state.divisions[divisionId as DivisionId];
		if (!divState?.unlocked) return state;

		const cost = getNextChiefCost(divState.chiefLevel);
		if (cost === null) return state; // Already max level
		if (state.cash < cost) return state;

		// Clone state
		const newState = cloneState(state);
		const newDivState = newState.divisions[divisionId as DivisionId];

		// Deduct cost and upgrade chief
		newState.cash -= cost;
		newDivState.chiefLevel += 1;
		newLevel = newDivState.chiefLevel;

		// When chief is first hired (level 0 → 1), start production on all tiers that have units
		if (newLevel === 1) {
			for (const tier of newDivState.tiers) {
				if (tier.unlocked && tier.count > 0 && !tier.producing) {
					tier.producing = true;
					tier.progress = 0;
				}
			}
		}

		eventBus.emit('chief:hired', {
			division: divisionId,
			level: newLevel,
		});

		return newState;
	});

	return newLevel;
}

/**
 * Unlock a locked tier by spending cash
 * Returns true if unlock succeeded
 */
export function unlockTier(divisionId: string, tierIndex: number): boolean {
	let success = false;

	gameState.update((state) => {
		const divState = state.divisions[divisionId as DivisionId];
		if (!divState?.unlocked) return state;

		const tier = divState.tiers[tierIndex];
		if (!tier || tier.unlocked) return state; // Already unlocked or doesn't exist

		const divMeta = DIVISIONS[divisionId];
		const tierData = divMeta?.tiers[tierIndex];
		if (!tierData) return state;

		// Calculate unlock cost (2x the base cost of the tier)
		const unlockCost = getUnlockCost(divisionId, tierIndex);
		if (state.cash < unlockCost) return state;

		// Clone state
		const newState = cloneState(state);
		const newDivState = newState.divisions[divisionId as DivisionId];
		const newTier = newDivState.tiers[tierIndex];

		// Deduct cost and unlock
		newState.cash -= unlockCost;
		newTier.unlocked = true;

		success = true;

		eventBus.emit('tier:unlocked', {
			division: divisionId,
			tier: tierIndex,
		});

		return newState;
	});

	return success;
}

/**
 * Get the unlock cost for a locked tier
 * Tier 0: free (always unlocked)
 * Tier 1+: scales exponentially based on tier index
 */
export function getUnlockCost(divisionId: string, tierIndex: number): number {
	if (tierIndex === 0) return 0; // First tier is always free

	const divMeta = DIVISIONS[divisionId];
	if (!divMeta) return Infinity;

	const tierData = divMeta.tiers[tierIndex];
	if (!tierData) return Infinity;

	// Unlock cost = 5x the base cost of the tier (feels like a significant gate)
	return tierData.config.baseCost * 5;
}

/**
 * Unlock a locked division by spending cash
 * Returns true if unlock succeeded
 */
export function unlockDivision(divisionId: string): boolean {
	let success = false;

	gameState.update((state) => {
		const divState = state.divisions[divisionId as DivisionId];
		if (!divState) return state;
		if (divState.unlocked) return state; // Already unlocked

		const cost = getDivisionUnlockCost(divisionId);
		if (state.cash < cost) return state;

		// Clone state
		const newState = cloneState(state);
		const newDivState = newState.divisions[divisionId as DivisionId];

		// Deduct cost and unlock
		newState.cash -= cost;
		newDivState.unlocked = true;

		success = true;

		eventBus.emit('division:unlocked', {
			division: divisionId,
		});

		return newState;
	});

	return success;
}
