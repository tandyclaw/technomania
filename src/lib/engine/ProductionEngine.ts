/**
 * ProductionEngine.ts — Adventure Capitalist-style timed production cycles
 *
 * Production flow:
 * 1. Player taps a tier → starts a production cycle (progress 0→1 over cycleDuration)
 * 2. Progress bar fills smoothly over cycleDuration seconds
 * 3. When progress reaches 1.0, revenue is awarded (cash payout)
 * 4. If chiefLevel > 0, production auto-restarts immediately
 * 5. If no chief, player must tap again to start the next cycle
 *
 * CRITICAL: tapProduce() NO LONGER gives instant cash.
 * It only starts a production cycle. Cash comes from completion.
 *
 * Power system (T019):
 * - Energy tiers generate power (positive powerMW)
 * - Rockets/Manufacturing tiers consume power (negative powerMW)
 * - When consumed > generated, non-Energy production speed is reduced
 * - Minimum 10% efficiency to avoid total standstill
 *
 * IMPORTANT: All state mutations create new object references for Svelte 5 reactivity.
 */

import { get } from 'svelte/store';
import { gameState, type GameState, type TierState, getNgPlusCostMultiplier } from '$lib/stores/gameState';
import { DIVISIONS, type DivisionMeta } from '$lib/divisions';
import { calculateRevenue, getCycleDurationMs, calculateBulkCost, calculateMaxBuyable } from '$lib/systems/ProductionSystem';
import { getPlanetCostMultiplier } from '$lib/systems/PrestigeSystem';

/** Combined cost multiplier from NG+ and planet chain */
function getCostMultiplier(state: GameState): number {
	return getNgPlusCostMultiplier(state.ngPlusLevel ?? 0) * getPlanetCostMultiplier(state.prestigeCount);
}
import { calculatePowerBalance, calculatePowerEfficiency } from '$lib/systems/PowerSystem';
import { getNextChiefCost } from '$lib/systems/ChiefSystem';
import { getDivisionUnlockCost } from '$lib/systems/DivisionUnlockSystem';
import { getActiveSynergies, getSynergyMultiplier, MVP_SYNERGIES, type Synergy } from '$lib/systems/SynergySystem';
import { getBottleneckMultiplier } from '$lib/systems/BottleneckSystem';
import { getMilestoneSpeedMultiplier, getMilestoneRevenueMultiplier } from '$lib/systems/MilestoneSystem';
import { getUpgradeSpeedMultiplier, getUpgradeRevenueMultiplier } from '$lib/systems/UpgradeSystem';
import { getMegaUpgradeSpeedMultiplier, getMegaUpgradeRevenueMultiplier, getVisionPointRevenueMultiplier, getMilestoneSpeedMultiplier as getPrestigeMilestoneSpeedMult, getMilestoneRevenueMultiplier as getPrestigeMilestoneRevMult, getWarpDriveMultiplier } from '$lib/systems/PrestigeSystem';
import { getDivisionStarSpeedMultiplier, getDivisionStarRevenueMultiplier } from '$lib/systems/DivisionPrestigeSystem';
import { getWorkerEfficiencyMultiplier } from '$lib/systems/WorkerSystem';
import { queueSynergyCelebration } from '$lib/stores/synergyCelebrationStore';
import { eventBus } from './EventBus';

/**
 * Calculate the prestige multiplier from Colony Tech.
 * Each Colony Tech point = +3% production speed.
 * Inlined here to avoid circular dependency with GameManager.
 */
function getPrestigeMultiplier(state: GameState): number {
	return 1 + (state.colonyTech ?? 0) * 0.03;
}

const DIVISION_IDS = ['teslaenergy', 'spacex', 'tesla', 'ai', 'tunnels', 'robotics'] as const;

/**
 * Get the EFFECTIVE cycle duration for a tier, including all speed modifiers:
 * - Base cycle duration from tier config
 * - Chief speed bonus
 * - Power efficiency (non-Energy divisions)
 * - Synergy speed boosts
 * - Bottleneck penalties
 *
 * This is what the progress bar animation should use.
 */
export function getEffectiveCycleDurationMs(
	state: GameState,
	divisionId: string,
	tierIndex: number
): number {
	const divState = state.divisions[divisionId as DivisionId];
	if (!divState?.unlocked) return 1000;

	const divMeta = DIVISIONS[divisionId];
	const tierData = divMeta?.tiers[tierIndex];
	if (!tierData) return 1000;

	// Base duration with chief speed bonus
	const baseDurationMs = getCycleDurationMs(tierData.config, divState.chiefLevel);

	// Power efficiency (Energy is immune)
	const { generated, consumed } = calculatePowerBalance(state);
	const powerEfficiency = divisionId === 'teslaenergy' ? 1 : calculatePowerEfficiency(generated, consumed);

	// Synergy speed boosts
	const activeSynergies = getActiveSynergies(state, MVP_SYNERGIES);
	const synergySpeedMult = getSynergyMultiplier(activeSynergies, divisionId, 'speed_boost');

	// Bottleneck penalties
	const bottleneckMult = getBottleneckMultiplier(divisionId, state);

	// Milestone & upgrade speed boosts
	const milestoneSpeedMult = getMilestoneSpeedMultiplier(divisionId, tierIndex, state);
	const upgradeSpeedMult = getUpgradeSpeedMultiplier(divisionId, tierIndex, state);
	const megaSpeedMult = getMegaUpgradeSpeedMultiplier(state);

	// Division star & worker bonuses
	const divStarSpeedMult = getDivisionStarSpeedMultiplier(state, divisionId);
	const workerMult = getWorkerEfficiencyMultiplier(state, divisionId);

	// Prestige milestone speed bonus
	const prestigeMilestoneSpeedMult = getPrestigeMilestoneSpeedMult(state.prestigeCount);

	// Warp drive reduces cycle times (stacks multiplicatively, value < 1)
	const warpMult = getWarpDriveMultiplier(state);

	// Combined speed multiplier
	const combinedSpeedMult = powerEfficiency * synergySpeedMult * bottleneckMult * milestoneSpeedMult * upgradeSpeedMult * megaSpeedMult * divStarSpeedMult * workerMult * prestigeMilestoneSpeedMult;

	// Effective duration (higher speed = shorter duration, warp reduces base)
	return (baseDurationMs * warpMult) / combinedSpeedMult;
}
type DivisionId = (typeof DIVISION_IDS)[number];

/**
 * Clone state with new references for the parts that changed.
 * This ensures Svelte 5's $derived() picks up changes.
 *
 * PERF: Only deep-clones divisions that have active/auto-startable production.
 * Inactive divisions keep the same reference so Svelte skips re-rendering them.
 */
function cloneState(state: GameState): GameState {
	const divisions = { ...state.divisions } as GameState['divisions'];

	for (const divId of DIVISION_IDS) {
		const div = state.divisions[divId];
		// Clone divisions that might be mutated: unlocked with active tiers/chief,
		// OR locked (may be unlocked by this update — must clone to get new reference)
		if (!div.unlocked || div.chiefLevel > 0 || div.tiers.some(t => t.producing)) {
			divisions[divId] = {
				...div,
				tiers: div.tiers.map(t => ({ ...t })),
			};
		}
	}

	return {
		...state,
		stats: { ...state.stats },
		divisions,
	};
}

/**
 * Tick all active production cycles forward by deltaMs.
 * Called every game tick from the game loop.
 *
 * This is the ONLY place where cash is awarded from production.
 * No more instant cash from tapping.
 *
 * PERF: Defers cloneState until we know mutation is needed, and caches
 * expensive multiplier lookups that don't change within a single tick.
 */
export function tickProduction(deltaMs: number): void {
	gameState.update((state) => {
		// --- Pre-compute expensive lookups ONCE per tick (read-only on old state) ---
		const prestigeMultiplier = getPrestigeMultiplier(state);
		const { generated, consumed } = calculatePowerBalance(state);
		const powerEfficiency = calculatePowerEfficiency(generated, consumed);
		const activeSynergies = getActiveSynergies(state, MVP_SYNERGIES);
		const activeSynergyIds = activeSynergies.map((s) => s.id);

		// Global multipliers (same for all divisions)
		const megaSpeedMult = getMegaUpgradeSpeedMultiplier(state);
		const megaRevenueMult = getMegaUpgradeRevenueMultiplier(state);
		const vpRevenueMult = getVisionPointRevenueMultiplier(state);
		const prestigeMilestoneSpeedMult = getPrestigeMilestoneSpeedMult(state.prestigeCount);
		const prestigeMilestoneRevMult = getPrestigeMilestoneRevMult(state.prestigeCount);
		const warpMult = getWarpDriveMultiplier(state);

		// --- Determine if anything needs to change before cloning ---
		let needsClone = false;

		// Power tracking changed?
		if (generated !== state.powerGenerated || consumed !== state.powerConsumed) {
			needsClone = true;
		}

		// Synergy tracking changed?
		const prevIds = state.activeSynergies ?? [];
		const synergiesChanged =
			activeSynergyIds.length !== prevIds.length ||
			activeSynergyIds.some((id, idx) => id !== prevIds[idx]);
		if (synergiesChanged) needsClone = true;

		// Check if any division has active or auto-startable production
		if (!needsClone) {
			for (const divId of DIVISION_IDS) {
				const divState = state.divisions[divId];
				if (!divState.unlocked) continue;
				for (const tier of divState.tiers) {
					if (!tier.unlocked || tier.count === 0) continue;
					if (tier.producing || divState.chiefLevel > 0) {
						needsClone = true;
						break;
					}
				}
				if (needsClone) break;
			}
		}

		// Nothing to do — return same reference (no Svelte re-render)
		if (!needsClone) return state;

		// --- Clone state only when mutation is needed ---
		const newState = cloneState(state);
		let changed = false;

		// Update power tracking
		newState.powerGenerated = generated;
		newState.powerConsumed = consumed;
		if (generated !== state.powerGenerated || consumed !== state.powerConsumed) {
			changed = true;
		}

		// Update synergy tracking if changed
		if (synergiesChanged) {
			newState.activeSynergies = activeSynergyIds;
			changed = true;

			const prevSet = new Set(prevIds);
			for (const synergy of activeSynergies) {
				if (!prevSet.has(synergy.id)) {
					eventBus.emit('synergy:discovered', {
						source: synergy.requirement.sourceDivision,
						target: synergy.requirement.targetDivision,
						bonus: `${Math.round(synergy.effect.value * 100)}% ${synergy.effect.type.replace('_', ' ')}`,
					});
					queueSynergyCelebration(synergy);
				}
			}
		}

		for (const divId of DIVISION_IDS) {
			const divState = newState.divisions[divId];
			if (!divState.unlocked) continue;

			const divMeta = DIVISIONS[divId];
			if (!divMeta) continue;

			// Cache per-division multipliers (computed once per division per tick)
			const efficiencyMult = divId === 'teslaenergy' ? 1 : powerEfficiency;
			const bottleneckMult = getBottleneckMultiplier(divId, newState);
			const synergySpeedMult = getSynergyMultiplier(activeSynergies, divId, 'speed_boost');
			const synergyRevenueMult = getSynergyMultiplier(activeSynergies, divId, 'revenue_boost');
			const divStarSpeedMult = getDivisionStarSpeedMultiplier(newState, divId);
			const divStarRevenueMult = getDivisionStarRevenueMultiplier(newState, divId);
			const workerMult = getWorkerEfficiencyMultiplier(newState, divId);

			for (let i = 0; i < divState.tiers.length; i++) {
				const tier = divState.tiers[i];
				if (!tier.unlocked || tier.count === 0) continue;

				// Auto-start production if chief is hired and tier is idle
				if (!tier.producing && divState.chiefLevel > 0) {
					tier.producing = true;
					tier.progress = 0;
					changed = true;
				}

				if (!tier.producing) continue;

				const tierData = divMeta.tiers[i];
				if (!tierData) continue;

				const cycleDurationMs = getCycleDurationMs(tierData.config, divState.chiefLevel);
				const milestoneSpeedMult = getMilestoneSpeedMultiplier(divId, i, state);
				const upgradeSpeedMult = getUpgradeSpeedMultiplier(divId, i, state);
				const combinedSpeedMult = efficiencyMult * synergySpeedMult * bottleneckMult * milestoneSpeedMult * upgradeSpeedMult * megaSpeedMult * divStarSpeedMult * workerMult * prestigeMilestoneSpeedMult;
				const effectiveDurationMs = (cycleDurationMs * warpMult) / combinedSpeedMult;
				const progressDelta = deltaMs / effectiveDurationMs;
				tier.progress += progressDelta;
				changed = true;

				// Check for cycle completion
				if (tier.progress >= 1.0) {
					const completedCycles = Math.floor(tier.progress);
					const revenue = calculateRevenue(tierData.config, tier.count, tier.level);
					const milestoneRevMult = getMilestoneRevenueMultiplier(divId, i, state);
					const upgradeRevMult = getUpgradeRevenueMultiplier(divId, i, state);
					const totalRevenue = revenue * completedCycles * synergyRevenueMult * prestigeMultiplier * milestoneRevMult * upgradeRevMult * megaRevenueMult * vpRevenueMult * divStarRevenueMult * workerMult * prestigeMilestoneRevMult;

					newState.cash += totalRevenue;
					newState.totalValueEarned += totalRevenue;
					newState.stats.totalCashEarned += totalRevenue;

					eventBus.emit('production:complete', {
						division: divId,
						tier: i,
						amount: totalRevenue,
						automated: divState.chiefLevel > 0,
					});

					if (divState.chiefLevel > 0) {
						tier.progress = tier.progress - completedCycles;
					} else {
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
 * Tap to start a production cycle (Adventure Capitalist style).
 *
 * Does NOT award instant cash. Instead:
 * - If idle: starts a new production cycle (progress bar begins filling)
 * - If already producing: does nothing (can't speed it up by mashing)
 *
 * Returns true if a cycle was started, false if already producing or can't produce.
 */
export function tapProduce(divisionId: string, tierIndex: number): boolean {
	let started = false;

	gameState.update((state) => {
		const divState = state.divisions[divisionId as DivisionId];
		if (!divState?.unlocked) return state;

		const tier = divState.tiers[tierIndex];
		if (!tier?.unlocked || tier.count === 0) return state;

		// Already producing — can't start another cycle
		if (tier.producing) return state;

		// Clone state and start production
		const newState = cloneState(state);
		const newTier = newState.divisions[divisionId as DivisionId].tiers[tierIndex];
		newTier.producing = true;
		newTier.progress = 0;
		newState.stats.totalTaps += 1;

		started = true;

		eventBus.emit('production:started', {
			division: divisionId,
			tier: tierIndex,
		});

		return newState;
	});

	return started;
}

/**
 * Start a production cycle for a tier (tap to begin, fills over time)
 * Alias for tapProduce for backward compatibility.
 */
export function startProduction(divisionId: string, tierIndex: number): void {
	tapProduce(divisionId, tierIndex);
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

		// Calculate cost (including NG+ multiplier)
		const ngMult = getCostMultiplier(state);
		const cost = tierData.config.baseCost * Math.pow(tierData.config.costMultiplier, tier.count) * ngMult;

		if (state.cash < cost) return state;

		// Clone state with new references
		const newState = cloneState(state);
		const newDivState = newState.divisions[divisionId as DivisionId];
		const newTier = newDivState.tiers[tierIndex];

		// Deduct cost and increase count
		newState.cash -= cost;
		newTier.count += 1;

		// If this is the first unit and chief is hired, auto-start production
		if (newTier.count === 1 && newDivState.chiefLevel > 0 && !newTier.producing) {
			newTier.producing = true;
			newTier.progress = 0;
		}

		// Recalculate power after purchase
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
 * Purchase multiple tier units at once (×10, ×100, or Max).
 * Returns the number of units actually purchased.
 */
export function purchaseTierBulk(divisionId: string, tierIndex: number, quantity: number | 'max'): number {
	let purchased = 0;

	gameState.update((state) => {
		const divState = state.divisions[divisionId as DivisionId];
		if (!divState?.unlocked) return state;

		const tier = divState.tiers[tierIndex];
		if (!tier?.unlocked) return state;

		const divMeta = DIVISIONS[divisionId];
		const tierData = divMeta?.tiers[tierIndex];
		if (!tierData) return state;

		// NG+ cost multiplier
		const ngMult = getCostMultiplier(state);

		// Calculate how many we can actually buy
		let qty: number;
		if (quantity === 'max') {
			qty = calculateMaxBuyable(tierData.config, tier.count, state.cash, ngMult);
		} else {
			// For ×10/×100, buy up to that many (limited by cash)
			const maxAffordable = calculateMaxBuyable(tierData.config, tier.count, state.cash, ngMult);
			qty = Math.min(quantity, maxAffordable);
		}

		if (qty <= 0) return state;

		const totalCost = calculateBulkCost(tierData.config, tier.count, qty, ngMult);
		if (state.cash < totalCost) return state;

		// Clone state with new references
		const newState = cloneState(state);
		const newDivState = newState.divisions[divisionId as DivisionId];
		const newTier = newDivState.tiers[tierIndex];

		const wasZero = newTier.count === 0;

		// Deduct cost and increase count
		newState.cash -= totalCost;
		newTier.count += qty;
		purchased = qty;

		// If first unit(s) and chief is hired, auto-start production
		if (wasZero && newTier.count > 0 && newDivState.chiefLevel > 0 && !newTier.producing) {
			newTier.producing = true;
			newTier.progress = 0;
		}

		// Recalculate power after purchase
		const { generated, consumed } = calculatePowerBalance(newState);
		newState.powerGenerated = generated;
		newState.powerConsumed = consumed;

		eventBus.emit('upgrade:purchased', {
			division: divisionId,
			tier: tierIndex,
			level: newTier.level,
		});

		return newState;
	});

	return purchased;
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

		const baseCost = getNextChiefCost(divState.chiefLevel);
		if (baseCost === null) return state;
		const cost = baseCost * getCostMultiplier(state);
		if (state.cash < cost) return state;

		// Clone state
		const newState = cloneState(state);
		const newDivState = newState.divisions[divisionId as DivisionId];

		// Deduct cost and upgrade chief
		newState.cash -= cost;
		newDivState.chiefLevel += 1;
		newLevel = newDivState.chiefLevel;

		// When chief is first hired (level 0 → 1), start production on all idle tiers
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
		if (!tier || tier.unlocked) return state;

		const divMeta = DIVISIONS[divisionId];
		const tierData = divMeta?.tiers[tierIndex];
		if (!tierData) return state;

		const baseUnlockCost = getUnlockCost(divisionId, tierIndex);
		const unlockCost = baseUnlockCost * getCostMultiplier(state);
		if (state.cash < unlockCost) return state;

		// Clone state
		const newState = cloneState(state);
		const newDivState = newState.divisions[divisionId as DivisionId];
		const newTier = newDivState.tiers[tierIndex];

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
 * Tier 1+: 5x base cost of the tier
 */
export function getUnlockCost(divisionId: string, tierIndex: number): number {
	if (tierIndex === 0) return 0;

	const divMeta = DIVISIONS[divisionId];
	if (!divMeta) return Infinity;

	const tierData = divMeta.tiers[tierIndex];
	if (!tierData) return Infinity;

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
		if (divState.unlocked) return state;

		const baseDivCost = getDivisionUnlockCost(divisionId);
		const cost = baseDivCost * getCostMultiplier(state);
		if (state.cash < cost) return state;

		// Clone state
		const newState = cloneState(state);
		const newDivState = newState.divisions[divisionId as DivisionId];

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
