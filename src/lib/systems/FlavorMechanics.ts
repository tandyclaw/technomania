/**
 * FlavorMechanics.ts — Division-specific flavor stat tracking
 *
 * T024: SpaceX launch cadence (launches per month)
 * T028: Manufacturing production rate (units per week)
 *
 * Each completed production cycle on a division's tiers counts as:
 * - A "launch" for SpaceX
 * - A "unit produced" for Manufacturing
 *
 * Stats are tracked with timestamps so we can calculate rolling windows
 * (last 30 days for launches, last 7 days for vehicles).
 *
 * Persisted in game state via the `flavorStats` field.
 */

import { get } from 'svelte/store';
import { gameState, type GameState } from '$lib/stores/gameState';
import { eventBus } from '$lib/engine/EventBus';
import { SPACEX_TIERS } from '$lib/divisions/SpaceX';
import { TESLA_TIERS } from '$lib/divisions/Tesla';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LaunchLogEntry {
	/** Timestamp (Date.now()) */
	ts: number;
	/** Tier index that completed */
	tier: number;
	/** Tier name (e.g., "Small Orbital Rocket") */
	name: string;
	/** Number of units that produced (tier count at time of completion) */
	units: number;
}

export interface FlavorStats {
	/** SpaceX: recent launch log (capped at 50 entries) */
	launchLog: LaunchLogEntry[];
	/** Manufacturing: recent production log (capped at 50 entries) */
	productionLog: LaunchLogEntry[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

/** In-game time compression: 1 real second = 1 in-game hour (for flavor display) */
const GAME_MONTH_MS = 30 * 24 * 1000; // 30 "days" × 24 "hours" × 1000ms/hour = 720s = 12 min real time
const GAME_WEEK_MS = 7 * 24 * 1000; // 7 "days" × 24 "hours" × 1000ms/hour = 168s ≈ 2.8 min real time

/** Maximum log entries to keep per division */
const MAX_LOG_ENTRIES = 50;

// ─── Accessors ──────────────────────────────────────────────────────────────

export function getDefaultFlavorStats(): FlavorStats {
	return {
		launchLog: [],
		productionLog: [],
	};
}

/**
 * Count SpaceX launches in the rolling "month" window.
 */
export function getLaunchesThisMonth(stats: FlavorStats): number {
	const cutoff = Date.now() - GAME_MONTH_MS;
	return stats.launchLog.filter((e) => e.ts >= cutoff).length;
}

/**
 * Count Manufacturing units produced in the rolling "week" window.
 */
export function getVehiclesThisWeek(stats: FlavorStats): number {
	const cutoff = Date.now() - GAME_WEEK_MS;
	return stats.productionLog.filter((e) => e.ts >= cutoff).length;
}

/**
 * Get total all-time launches.
 */
export function getTotalLaunches(stats: FlavorStats): number {
	return stats.launchLog.length;
}

/**
 * Get total all-time units produced.
 */
export function getTotalVehiclesProduced(stats: FlavorStats): number {
	return stats.productionLog.length;
}

/**
 * Get recent launch log entries (most recent first), limited to `limit`.
 */
export function getRecentLaunches(stats: FlavorStats, limit = 5): LaunchLogEntry[] {
	return stats.launchLog.slice(-limit).reverse();
}

/**
 * Get recent production log entries (most recent first), limited to `limit`.
 */
export function getRecentProduction(stats: FlavorStats, limit = 5): LaunchLogEntry[] {
	return stats.productionLog.slice(-limit).reverse();
}

// ─── Event Listener Setup ───────────────────────────────────────────────────

let listenerActive = false;
let unsubscribe: (() => void) | null = null;

/**
 * Initialize the flavor mechanics event listeners.
 * Call once from GameManager after initialization.
 * Listens to production:complete events and logs them.
 */
export function initFlavorMechanics(): void {
	if (listenerActive) return;
	listenerActive = true;

	unsubscribe = eventBus.on('production:complete', (data) => {
		const { division, tier } = data;

		if (division === 'spacex') {
			recordLaunch(tier);
		} else if (division === 'tesla') {
			recordVehicleProduction(tier);
		}
	});
}

/**
 * Clean up listeners (for shutdown / testing).
 */
export function destroyFlavorMechanics(): void {
	if (unsubscribe) {
		unsubscribe();
		unsubscribe = null;
	}
	listenerActive = false;
}

// ─── Internal Recording Functions ───────────────────────────────────────────

function recordLaunch(tierIndex: number): void {
	const now = Date.now();
	const tierData = SPACEX_TIERS[tierIndex];
	if (!tierData) return;

	const state = get(gameState);
	const tierState = state.divisions.spacex.tiers[tierIndex];
	if (!tierState) return;

	const entry: LaunchLogEntry = {
		ts: now,
		tier: tierIndex,
		name: tierData.name,
		units: tierState.count,
	};

	gameState.update((s) => {
		const stats = s.flavorStats ?? getDefaultFlavorStats();
		const newLog = [...stats.launchLog, entry];
		// Trim to max entries
		if (newLog.length > MAX_LOG_ENTRIES) {
			newLog.splice(0, newLog.length - MAX_LOG_ENTRIES);
		}
		return {
			...s,
			flavorStats: { ...stats, launchLog: newLog },
		};
	});
}

function recordVehicleProduction(tierIndex: number): void {
	const now = Date.now();
	const tierData = TESLA_TIERS[tierIndex];
	if (!tierData) return;

	const state = get(gameState);
	const tierState = state.divisions.tesla.tiers[tierIndex];
	if (!tierState) return;

	const entry: LaunchLogEntry = {
		ts: now,
		tier: tierIndex,
		name: tierData.name,
		units: tierState.count,
	};

	gameState.update((s) => {
		const stats = s.flavorStats ?? getDefaultFlavorStats();
		const newLog = [...stats.productionLog, entry];
		// Trim to max entries
		if (newLog.length > MAX_LOG_ENTRIES) {
			newLog.splice(0, newLog.length - MAX_LOG_ENTRIES);
		}
		return {
			...s,
			flavorStats: { ...stats, productionLog: newLog },
		};
	});
}

/**
 * Reset flavor stats (called on prestige).
 */
export function resetFlavorStats(): void {
	gameState.update((s) => ({
		...s,
		flavorStats: getDefaultFlavorStats(),
	}));
}
