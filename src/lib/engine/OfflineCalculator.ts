/**
 * OfflineCalculator.ts — Calculate production gains while the player was away
 * Efficient batch calculation (not tick-by-tick) for up to 8 hours offline
 */

import type { GameState, DivisionState } from '$lib/stores/gameState';
import { getOfflineEfficiencyBonus } from '$lib/systems/UpgradeSystem';

/** Maximum offline time in ms (8 hours base, 16 hours for premium) */
const MAX_OFFLINE_MS_BASE = 8 * 60 * 60 * 1000;
const MAX_OFFLINE_MS_PREMIUM = 16 * 60 * 60 * 1000;

/** Offline efficiency — players earn a fraction of online rates to encourage active play */
const OFFLINE_EFFICIENCY = 0.5;

/** Minimum offline duration to trigger calculation (1 minute) */
const MIN_OFFLINE_MS = 60_000;

/**
 * Summary of what happened while the player was away
 */
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
 * Base revenue rates per tier per second (will be defined in division configs later)
 * For now, these are reasonable defaults for the MVP
 */
const TIER_BASE_REVENUE: Record<string, number[]> = {
	teslaenergy: [0.5, 3, 15, 80, 400, 2000],    // Nuclear Reactor → Wireless Energy Beaming
	spacex:      [1, 8, 50, 300, 1500, 8000],     // Small Orbital Rocket → Starship Lander
	tesla:       [2, 12, 60, 350, 2000, 10000],    // Electric Cars → Colony Kit Factory
	ai:          [3, 20, 100, 600, 3000, 15000],   // Chatbot → AGI
	tunnels:     [4, 25, 120, 700, 3500, 18000],   // Test Bore → Hyperloop
	robotics:    [5, 30, 130, 750, 3800, 20000],   // Assembly Bot → General Purpose Robot
};

const TIER_BASE_PRODUCTION: Record<string, number[]> = {
	teslaenergy: [0.1, 0.5, 2, 10, 50, 200],     // MW generation contribution
	spacex:      [0.01, 0.05, 0.2, 1, 5, 20],     // Launches/period contribution
	tesla:       [0.02, 0.1, 0.5, 3, 15, 80],      // Units/period contribution
	ai:          [0.02, 0.1, 0.5, 3, 15, 80],     // AI compute contribution
	tunnels:     [0.01, 0.08, 0.4, 2, 10, 50],    // Tunnel length contribution
	robotics:    [0.02, 0.1, 0.5, 3, 12, 60],     // Robot production contribution
};

const DIVISION_NAMES: Record<string, string> = {
	teslaenergy: 'Energy',
	spacex: 'Rockets',
	tesla: 'Manufacturing',
	ai: 'AI',
	tunnels: 'Tunnels',
	robotics: 'Robotics',
};

/**
 * Calculate offline progress for the given state and duration
 * Uses batch calculation for efficiency (O(divisions * tiers), not O(ticks))
 */
export function calculateOfflineProgress(
	state: GameState,
	offlineDurationMs: number,
	prestigeMultiplier: number = 1
): OfflineReport {
	// Cap duration
	const maxMs = MAX_OFFLINE_MS_BASE; // TODO: check premium status
	const cappedMs = Math.min(Math.max(offlineDurationMs, 0), maxMs);

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
	let totalPowerGenerated = 0;

	// Calculate per-division
	const divisionEntries = Object.entries(state.divisions) as [string, DivisionState][];

	for (const [divId, divState] of divisionEntries) {
		if (!divState.unlocked) continue;

		const report = calculateDivisionOffline(
			divId,
			divState,
			offlineSeconds,
			prestigeMultiplier,
			efficiency
		);

		divisionReports.push(report);
		totalCashEarned += report.cashEarned;

		// Energy generates power (MW) that other divisions need
		if (divId === 'teslaenergy') {
			totalPowerGenerated += calculatePowerGeneration(divState, offlineSeconds);
		}
	}

	// Research points from R&D labs (if any active research exists)
	if (state.activeResearch) {
		// Base RP rate: 1 per 10 seconds, scaled by prestige
		totalRPEarned = Math.floor(
			(offlineSeconds / 10) * prestigeMultiplier * efficiency
		);
	}

	return {
		durationMs: offlineDurationMs,
		cappedDurationMs: cappedMs,
		cashEarned: totalCashEarned,
		researchPointsEarned: totalRPEarned,
		powerGenerated: totalPowerGenerated,
		divisionReports,
		efficiency,
	};
}

/**
 * Calculate offline production for a single division
 */
function calculateDivisionOffline(
	divId: string,
	divState: DivisionState,
	offlineSeconds: number,
	prestigeMultiplier: number
): DivisionOfflineReport {
	const revenueRates = TIER_BASE_REVENUE[divId] ?? [];
	const productionRates = TIER_BASE_PRODUCTION[divId] ?? [];

	let cashEarned = 0;
	let unitsProduced = 0;

	// Only automated tiers produce offline (need chief level > 0)
	const automationMultiplier = getAutomationMultiplier(divState.chiefLevel);
	if (automationMultiplier === 0) {
		return {
			divisionId: divId,
			divisionName: DIVISION_NAMES[divId] ?? divId,
			cashEarned: 0,
			unitsProduced: 0,
		};
	}

	for (let i = 0; i < divState.tiers.length; i++) {
		const tier = divState.tiers[i];
		if (!tier.unlocked || tier.count === 0) continue;

		const baseRevenue = revenueRates[i] ?? 0;
		const baseProduction = productionRates[i] ?? 0;

		// Revenue = base * count * (1 + level * 0.25) * automation * prestige * offline_efficiency
		const levelMultiplier = 1 + tier.level * 0.25;
		const tierRevenue = baseRevenue * tier.count * levelMultiplier
			* automationMultiplier * prestigeMultiplier * OFFLINE_EFFICIENCY;
		const tierProduction = baseProduction * tier.count * levelMultiplier
			* automationMultiplier * OFFLINE_EFFICIENCY;

		cashEarned += tierRevenue * offlineSeconds;
		unitsProduced += tierProduction * offlineSeconds;
	}

	return {
		divisionId: divId,
		divisionName: DIVISION_NAMES[divId] ?? divId,
		cashEarned: Math.floor(cashEarned),
		unitsProduced: Math.floor(unitsProduced),
	};
}

/**
 * Calculate power generation from Energy during offline time
 */
function calculatePowerGeneration(
	divState: DivisionState,
	offlineSeconds: number
): number {
	const productionRates = TIER_BASE_PRODUCTION['teslaenergy'] ?? [];
	let totalMW = 0;

	for (let i = 0; i < divState.tiers.length; i++) {
		const tier = divState.tiers[i];
		if (!tier.unlocked || tier.count === 0) continue;

		const baseMW = productionRates[i] ?? 0;
		const levelMultiplier = 1 + tier.level * 0.25;
		totalMW += baseMW * tier.count * levelMultiplier;
	}

	return totalMW; // Average MW during offline period
}

/**
 * Get the automation multiplier from chief level
 * Level 0 = no automation (0x — manual only, no offline production)
 * Level 1-6 = escalating automation speed
 */
function getAutomationMultiplier(chiefLevel: number): number {
	const multipliers = [0, 1, 2, 5, 10, 50, 100]; // Matches automation tiers from PROJECT_PLAN
	return multipliers[chiefLevel] ?? 0;
}

/**
 * Apply the offline report to the game state (mutates state)
 */
export function applyOfflineReport(state: GameState, report: OfflineReport): GameState {
	state.cash += report.cashEarned;
	state.researchPoints += report.researchPointsEarned;
	state.stats.totalCashEarned += report.cashEarned;

	// Update power generation to reflect offline average
	if (report.powerGenerated > 0) {
		state.powerGenerated = report.powerGenerated;
	}

	return state;
}

/**
 * Create an empty report for very short offline durations
 */
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
