/**
 * WorkerSystem.ts — Worker allocation for division efficiency bonuses
 *
 * Start with 10 workers, gain more as you grow (1 per $1M total earned, up to 100).
 * Assign workers to divisions for bonus efficiency (+2% per worker per division).
 * Workers are a global resource — allocating to one takes from the pool.
 * Persisted in gameState.workerAllocation.
 */

import { get } from 'svelte/store';
import { gameState, type GameState } from '$lib/stores/gameState';
import { DIVISIONS } from '$lib/divisions';

const BASE_WORKERS = 10;
const MAX_WORKERS = 100;
const CASH_PER_WORKER = 1_000_000; // $1M total earned per extra worker
const BONUS_PER_WORKER = 0.02; // +2% per worker

const DIVISION_IDS = ['spacex', 'tesla', 'teslaenergy', 'ai', 'tunnels', 'robotics'] as const;

/**
 * Calculate total available workers based on total cash earned
 */
export function getTotalWorkers(state: GameState): number {
	const earned = state.stats.totalCashEarned;
	const bonus = Math.floor(earned / CASH_PER_WORKER);
	return Math.min(BASE_WORKERS + bonus, MAX_WORKERS);
}

/**
 * Get workers allocated to a specific division
 */
export function getWorkersForDivision(state: GameState, divisionId: string): number {
	return (state.workerAllocation as Record<string, number> | undefined)?.[divisionId] ?? 0;
}

/**
 * Get total workers currently allocated across all divisions
 */
export function getAllocatedWorkers(state: GameState): number {
	const alloc = state.workerAllocation as Record<string, number> | undefined;
	if (!alloc) return 0;
	return Object.values(alloc).reduce((sum, n) => sum + (n || 0), 0);
}

/**
 * Get unallocated (free) workers
 */
export function getFreeWorkers(state: GameState): number {
	return Math.max(0, getTotalWorkers(state) - getAllocatedWorkers(state));
}

/**
 * Get the efficiency multiplier from workers for a division (+2% per worker)
 */
export function getWorkerEfficiencyMultiplier(state: GameState, divisionId: string): number {
	const workers = getWorkersForDivision(state, divisionId);
	return 1 + workers * BONUS_PER_WORKER;
}

/**
 * Allocate one worker to a division. Returns true if successful.
 */
export function allocateWorker(divisionId: string): boolean {
	let success = false;
	gameState.update((state) => {
		if (getFreeWorkers(state) <= 0) return state;
		const current = getWorkersForDivision(state, divisionId);
		success = true;
		return {
			...state,
			workerAllocation: {
				...(state.workerAllocation ?? {}),
				[divisionId]: current + 1,
			},
		};
	});
	return success;
}

/**
 * Deallocate one worker from a division. Returns true if successful.
 */
export function deallocateWorker(divisionId: string): boolean {
	let success = false;
	gameState.update((state) => {
		const current = getWorkersForDivision(state, divisionId);
		if (current <= 0) return state;
		success = true;
		return {
			...state,
			workerAllocation: {
				...(state.workerAllocation ?? {}),
				[divisionId]: current - 1,
			},
		};
	});
	return success;
}

/**
 * Auto-allocate workers evenly across unlocked divisions
 */
export function autoAllocateEven(): void {
	gameState.update((state) => {
		const total = getTotalWorkers(state);
		const unlocked = DIVISION_IDS.filter((id) => state.divisions[id]?.unlocked);
		if (unlocked.length === 0) return state;

		const perDiv = Math.floor(total / unlocked.length);
		let remainder = total - perDiv * unlocked.length;

		const alloc: Record<string, number> = {};
		for (const id of unlocked) {
			alloc[id] = perDiv + (remainder > 0 ? 1 : 0);
			if (remainder > 0) remainder--;
		}
		return { ...state, workerAllocation: alloc };
	});
}

/**
 * Auto-allocate workers proportional to division revenue
 */
export function autoAllocateByRevenue(): void {
	gameState.update((state) => {
		const total = getTotalWorkers(state);
		const unlocked = DIVISION_IDS.filter((id) => state.divisions[id]?.unlocked);
		if (unlocked.length === 0) return state;

		// Simple heuristic: count total owned tiers as proxy for revenue
		const weights: Record<string, number> = {};
		let totalWeight = 0;
		for (const id of unlocked) {
			const w = state.divisions[id].tiers.reduce((s, t) => s + t.count, 0) || 1;
			weights[id] = w;
			totalWeight += w;
		}

		const alloc: Record<string, number> = {};
		let assigned = 0;
		for (const id of unlocked) {
			const share = Math.floor((weights[id] / totalWeight) * total);
			alloc[id] = share;
			assigned += share;
		}
		// Distribute remainder to highest-weight divisions
		let remainder = total - assigned;
		const sorted = [...unlocked].sort((a, b) => (weights[b] || 0) - (weights[a] || 0));
		for (const id of sorted) {
			if (remainder <= 0) break;
			alloc[id] = (alloc[id] || 0) + 1;
			remainder--;
		}

		return { ...state, workerAllocation: alloc };
	});
}
