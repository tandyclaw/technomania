/**
 * WorkerSystem.ts — REMOVED (mechanics stripped out)
 * Stub exports to avoid breaking any remaining references.
 */

import type { GameState } from '$lib/stores/gameState';

export function getWorkerEfficiencyMultiplier(_state: GameState, _divisionId: string): number {
	return 1;
}

export function getWorkersForDivision(_state: GameState, _divisionId: string): number {
	return 0;
}

export function getTotalWorkers(_state: GameState): number {
	return 0;
}

export function getAllocatedWorkers(_state: GameState): number {
	return 0;
}

export function getFreeWorkers(_state: GameState): number {
	return 0;
}
