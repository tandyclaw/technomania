/**
 * OfflineCalculator.ts — Calculate production gains while the player was away
 * Uses getDivisionTrueIncomePerSec for accurate earnings that match online play.
 */

import type { GameState } from '$lib/stores/gameState';
import { getDivisionTrueIncomePerSec } from '$lib/engine/ProductionEngine';
import { getOfflineEfficiencyBonus } from '$lib/systems/UpgradeSystem';

/** Maximum offline time in ms (8 hours base) */
const MAX_OFFLINE_MS_BASE = 8 * 60 * 60 * 1000;

/** Offline efficiency — players earn a fraction of online rates to encourage active play */
const OFFLINE_EFFICIENCY = 0.5;

/** Minimum offline duration to trigger calculation (1 minute) */
const MIN_OFFLINE_MS = 60_000;

const DIVISION_IDS = ['teslaenergy', 'tesla', 'spacex', 'ai', 'robotics'] as const;

const DIVISION_NAMES: Record<string, string> = {
	teslaenergy: 'Energy',
	spacex: 'Rockets',
	tesla: 'Manufacturing',
	ai: 'AI',
	robotics: 'Robotics',
};

export interface OfflineReport {
	durationMs: number;
	cappedDurationMs: number;
	cashEarned: number;
	researchPointsEarned: number;
	powerGenerated: number;
	divisionReports: DivisionOfflineReport[];
	efficiency: number;
}

export interface DivisionOfflineReport {
	divisionId: string;
	divisionName: string;
	cashEarned: number;
	unitsProduced: number;
}

/**
 * Calculate offline progress using the same income math as online play.
 */
export function calculateOfflineProgress(
	state: GameState,
	offlineDurationMs: number,
	_prestigeMultiplier: number = 1
): OfflineReport {
	const cappedMs = Math.min(Math.max(offlineDurationMs, 0), MAX_OFFLINE_MS_BASE);

	if (cappedMs < MIN_OFFLINE_MS) {
		return createEmptyReport(offlineDurationMs, cappedMs);
	}

	// Dynamic offline efficiency: base 50% + upgrade bonuses
	const efficiencyBonus = getOfflineEfficiencyBonus(state);
	const efficiency = Math.min(OFFLINE_EFFICIENCY + efficiencyBonus, 1.0);

	const offlineSeconds = cappedMs / 1000;
	const divisionReports: DivisionOfflineReport[] = [];
	let totalCashEarned = 0;
	let totalRPEarned = 0;

	for (const divId of DIVISION_IDS) {
		const divState = state.divisions[divId];
		if (!divState?.unlocked) continue;

		// Use the TRUE income/sec (same multipliers as tickProduction)
		const incomePerSec = getDivisionTrueIncomePerSec(state, divId);
		const cashEarned = incomePerSec * offlineSeconds * efficiency;

		divisionReports.push({
			divisionId: divId,
			divisionName: DIVISION_NAMES[divId] ?? divId,
			cashEarned: Math.floor(cashEarned),
			unitsProduced: 0,
		});

		totalCashEarned += cashEarned;
	}

	// Research points from R&D labs (if any active research exists)
	if (state.activeResearch) {
		totalRPEarned = Math.floor((offlineSeconds / 10) * efficiency);
	}

	return {
		durationMs: offlineDurationMs,
		cappedDurationMs: cappedMs,
		cashEarned: Math.floor(totalCashEarned),
		researchPointsEarned: totalRPEarned,
		powerGenerated: 0,
		divisionReports,
		efficiency,
	};
}

/**
 * Apply the offline report to the game state (mutates state)
 */
export function applyOfflineReport(state: GameState, report: OfflineReport): GameState {
	state.cash += report.cashEarned;
	state.researchPoints += report.researchPointsEarned;
	state.stats.totalCashEarned += report.cashEarned;
	return state;
}

function createEmptyReport(durationMs: number, cappedMs: number): OfflineReport {
	return {
		durationMs,
		cappedDurationMs: cappedMs,
		cashEarned: 0,
		researchPointsEarned: 0,
		powerGenerated: 0,
		divisionReports: [],
		efficiency: OFFLINE_EFFICIENCY,
	};
}
