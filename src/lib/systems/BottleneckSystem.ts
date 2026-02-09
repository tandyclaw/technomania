/**
 * BottleneckSystem.ts — Dynamic bottleneck detection engine
 *
 * Monitors game state and triggers bottleneck events when the player hits
 * real-world-inspired production constraints. Each bottleneck:
 *   - Activates when a threshold is met (e.g., too many units, power deficit)
 *   - Applies a production speed penalty to the affected division
 *   - Can be resolved by spending cash (investment) or meeting other conditions
 *
 * Bottlenecks fire EventBus events so the toast system (T016) can notify players.
 *
 * Check frequency: called from GameManager tick, throttled to once per 2s.
 */

import { get } from 'svelte/store';
import { gameState, type GameState, type BottleneckState } from '$lib/stores/gameState';
import { DIVISIONS } from '$lib/divisions';
import { calculatePowerBalance, calculatePowerEfficiency } from './PowerSystem';
import { eventBus } from '$lib/engine/EventBus';

// ─── Bottleneck Definitions ─────────────────────────────────────────────────

export interface BottleneckDef {
	id: string;
	name: string;
	description: string;
	division: string;
	category: 'engineering' | 'power' | 'supply_chain' | 'regulatory' | 'scaling';
	/** Severity: fraction of production speed lost (0.0–1.0). 0.3 = 30% slowdown. */
	severity: number;
	/** Cash cost to resolve the bottleneck */
	resolveCost: number;
	/** Flavor text shown when bottleneck triggers */
	flavorText: string;
	/** Return true if the bottleneck should activate given current game state */
	shouldActivate: (state: GameState) => boolean;
	/** Return true if the bottleneck auto-resolves (e.g., player fixes the underlying cause) */
	autoResolveCheck?: (state: GameState) => boolean;
}

/**
 * All bottleneck definitions.
 * 3-5 per division with real-world flavor (T032).
 */
export const BOTTLENECK_DEFS: BottleneckDef[] = [
	// ── Tesla Energy (5 bottlenecks) ──────────────────────────────────────────
	{
		id: 'te_grid_overload',
		name: 'Grid Overload',
		description: 'Too many solar installations are destabilizing the local grid.',
		division: 'teslaenergy',
		category: 'engineering',
		severity: 0.25,
		resolveCost: 5000,
		researchCost: 3,
		waitDurationMs: 120_000, // 2 minutes
		flavorText: 'Utility companies are pushing back on net metering.',
		shouldActivate: (state) => {
			const tiers = state.divisions.teslaenergy.tiers;
			return tiers[0].count + tiers[1].count > 50;
		},
	},
	{
		id: 'te_supply_shortage',
		name: 'Battery Cell Shortage',
		description: 'Global lithium-ion cell supply can\'t keep up with Megapack demand.',
		division: 'teslaenergy',
		category: 'supply_chain',
		severity: 0.30,
		resolveCost: 50000,
		researchCost: 8,
		waitDurationMs: 300_000, // 5 minutes
		flavorText: 'Every automaker wants the same battery cells you do.',
		shouldActivate: (state) => {
			const tiers = state.divisions.teslaenergy.tiers;
			return tiers[2].count > 20;
		},
	},
	{
		id: 'te_permitting',
		name: 'Permitting Delays',
		description: 'Grid-scale battery installations require extensive regulatory approval.',
		division: 'teslaenergy',
		category: 'regulatory',
		severity: 0.35,
		resolveCost: 200000,
		researchCost: 15,
		waitDurationMs: 600_000, // 10 minutes
		flavorText: 'Environmental impact studies take forever.',
		shouldActivate: (state) => {
			const tiers = state.divisions.teslaenergy.tiers;
			return tiers[4].count > 5;
		},
	},
	{
		id: 'te_inverter_shortage',
		name: 'Inverter Chip Shortage',
		description: 'Semiconductor supply issues are delaying solar inverter production.',
		division: 'teslaenergy',
		category: 'supply_chain',
		severity: 0.20,
		resolveCost: 15000,
		researchCost: 5,
		waitDurationMs: 180_000, // 3 minutes
		flavorText: 'TSMC is at max capacity. Everyone wants chips.',
		shouldActivate: (state) => {
			const tiers = state.divisions.teslaenergy.tiers;
			// Triggers when Solar Roof count > 15
			return tiers[3].count > 15;
		},
	},
	{
		id: 'te_interconnection_queue',
		name: 'Interconnection Queue',
		description: 'New grid-scale projects are stuck in a multi-year utility queue.',
		division: 'teslaenergy',
		category: 'regulatory',
		severity: 0.30,
		resolveCost: 350000,
		researchCost: 20,
		waitDurationMs: 480_000, // 8 minutes
		flavorText: 'There are 2,000 GW of projects waiting in line ahead of you.',
		shouldActivate: (state) => {
			const tiers = state.divisions.teslaenergy.tiers;
			// Triggers when Virtual Power Plant count > 3
			return tiers[5].count > 3;
		},
	},

	// ── SpaceX (5 bottlenecks) ────────────────────────────────────────────────
	{
		id: 'sx_launch_cadence',
		name: 'Launch Pad Congestion',
		description: 'Not enough launch pads for your rocket fleet.',
		division: 'spacex',
		category: 'engineering',
		severity: 0.25,
		resolveCost: 8000,
		researchCost: 4,
		waitDurationMs: 150_000, // 2.5 minutes
		flavorText: 'FAA wants a word about your launch frequency.',
		shouldActivate: (state) => {
			const tiers = state.divisions.spacex.tiers;
			return tiers[1].count > 30;
		},
	},
	{
		id: 'sx_heat_shield',
		name: 'Heat Shield Cracking',
		description: 'Starship\'s thermal protection tiles keep falling off during reentry.',
		division: 'spacex',
		category: 'engineering',
		severity: 0.35,
		resolveCost: 150000,
		researchCost: 12,
		waitDurationMs: 420_000, // 7 minutes
		flavorText: 'Each tile is hand-applied. There are 18,000 of them.',
		shouldActivate: (state) => {
			const tiers = state.divisions.spacex.tiers;
			return tiers[4].count > 5;
		},
	},
	{
		id: 'sx_faa_review',
		name: 'FAA Environmental Review',
		description: 'Federal regulators have grounded your Mars program pending review.',
		division: 'spacex',
		category: 'regulatory',
		severity: 0.40,
		resolveCost: 500000,
		researchCost: 25,
		waitDurationMs: 900_000, // 15 minutes
		flavorText: '"We need to study the impact on the lesser prairie chicken."',
		shouldActivate: (state) => {
			const tiers = state.divisions.spacex.tiers;
			return tiers[5].count > 3;
		},
	},
	{
		id: 'sx_raptor_reliability',
		name: 'Raptor Engine Reliability',
		description: 'Raptor engines keep RUD-ing on the test stand. Production yield is abysmal.',
		division: 'spacex',
		category: 'engineering',
		severity: 0.25,
		resolveCost: 40000,
		researchCost: 6,
		waitDurationMs: 240_000, // 4 minutes
		flavorText: '"Full flow staged combustion is hard. We knew that." — Elon',
		shouldActivate: (state) => {
			const tiers = state.divisions.spacex.tiers;
			// Triggers when Heavy Falcon count > 15
			return tiers[2].count > 15;
		},
	},
	{
		id: 'sx_range_safety',
		name: 'Range Safety Shutdown',
		description: 'Space Force has grounded launches due to range scheduling conflicts.',
		division: 'spacex',
		category: 'regulatory',
		severity: 0.20,
		resolveCost: 20000,
		researchCost: 5,
		waitDurationMs: 180_000, // 3 minutes
		flavorText: 'Cape Canaveral can only handle so many launches per week.',
		shouldActivate: (state) => {
			const tiers = state.divisions.spacex.tiers;
			// Triggers when Falcon 1 count > 40
			return tiers[0].count > 40;
		},
	},

	// ── Tesla EVs (5 bottlenecks) ─────────────────────────────────────────────
	{
		id: 'ts_production_hell',
		name: 'Production Hell',
		description: 'Model 3 production line is a nightmare. Welcome to the machine.',
		division: 'tesla',
		category: 'scaling',
		severity: 0.30,
		resolveCost: 75000,
		researchCost: 10,
		waitDurationMs: 360_000, // 6 minutes
		flavorText: '"I\'m sleeping on the factory floor." — Elon, probably.',
		shouldActivate: (state) => {
			const tiers = state.divisions.tesla.tiers;
			return tiers[3].count > 10;
		},
	},
	{
		id: 'ts_panel_gaps',
		name: 'Panel Gap Crisis',
		description: 'Quality control issues are piling up. Customers are complaining.',
		division: 'tesla',
		category: 'engineering',
		severity: 0.20,
		resolveCost: 25000,
		researchCost: 4,
		waitDurationMs: 150_000, // 2.5 minutes
		flavorText: 'Reddit is not happy about the panel gaps.',
		shouldActivate: (state) => {
			const tiers = state.divisions.tesla.tiers;
			return tiers[0].count + tiers[1].count + tiers[2].count > 60;
		},
	},
	{
		id: 'ts_gigafactory_scaling',
		name: 'Gigafactory Scaling',
		description: 'Building cars at scale requires an entirely new factory paradigm.',
		division: 'tesla',
		category: 'scaling',
		severity: 0.35,
		resolveCost: 300000,
		researchCost: 18,
		waitDurationMs: 540_000, // 9 minutes
		flavorText: 'The factory IS the product.',
		shouldActivate: (state) => {
			const tiers = state.divisions.tesla.tiers;
			return tiers[4].count > 8;
		},
	},
	{
		id: 'ts_autopilot_recall',
		name: 'Autopilot Recall',
		description: 'NHTSA has issued a safety recall on Full Self-Driving. All hands on deck.',
		division: 'tesla',
		category: 'regulatory',
		severity: 0.25,
		resolveCost: 100000,
		researchCost: 8,
		waitDurationMs: 300_000, // 5 minutes
		flavorText: '"It\'s a software update, not really a recall." — Elon',
		shouldActivate: (state) => {
			const tiers = state.divisions.tesla.tiers;
			// Triggers when Model S + Model X count > 40
			return tiers[1].count + tiers[2].count > 40;
		},
	},
	{
		id: 'ts_cybertruck_glass',
		name: 'Armor Glass Failure',
		description: 'The "unbreakable" Cybertruck windows keep shattering during demos.',
		division: 'tesla',
		category: 'engineering',
		severity: 0.30,
		resolveCost: 200000,
		researchCost: 12,
		waitDurationMs: 360_000, // 6 minutes
		flavorText: '"Oh my f***ing God." — Elon at the Cybertruck unveil.',
		shouldActivate: (state) => {
			const tiers = state.divisions.tesla.tiers;
			// Triggers when Cybertruck count > 5
			return tiers[5].count > 5;
		},
	},

	// ── Cross-cutting: Power ──────────────────────────────────────────────────
	{
		id: 'power_deficit',
		name: 'Power Deficit',
		description: 'Your facilities consume more power than you generate.',
		division: 'all',
		category: 'power',
		severity: 0.0,
		resolveCost: 0,
		flavorText: 'Build more Tesla Energy infrastructure to restore full speed.',
		shouldActivate: (state) => {
			const { generated, consumed } = calculatePowerBalance(state);
			return consumed > generated && consumed > 0;
		},
		autoResolveCheck: (state) => {
			const { generated, consumed } = calculatePowerBalance(state);
			return generated >= consumed;
		},
	},
];

// ─── Bottleneck Engine ──────────────────────────────────────────────────────

/** Lookup table for quick access by id */
const BOTTLENECK_MAP = new Map<string, BottleneckDef>(
	BOTTLENECK_DEFS.map((b) => [b.id, b])
);

/** Track which bottlenecks we've already notified about (to avoid repeat toasts) */
const notifiedBottlenecks = new Set<string>();

/** Last time we ran the check */
let lastCheckMs = 0;
const CHECK_INTERVAL_MS = 2000;

/**
 * Tick the bottleneck detection engine. Called from the game loop.
 * Throttled to run every CHECK_INTERVAL_MS.
 */
export function tickBottlenecks(deltaMs: number): void {
	lastCheckMs += deltaMs;
	if (lastCheckMs < CHECK_INTERVAL_MS) return;
	lastCheckMs = 0;

	gameState.update((state) => {
		let changed = false;
		const newState = { ...state };

		// Deep clone divisions to mutate bottleneck arrays
		newState.divisions = {
			teslaenergy: { ...state.divisions.teslaenergy, bottlenecks: [...state.divisions.teslaenergy.bottlenecks] },
			spacex: { ...state.divisions.spacex, bottlenecks: [...state.divisions.spacex.bottlenecks] },
			tesla: { ...state.divisions.tesla, bottlenecks: [...state.divisions.tesla.bottlenecks] },
		};

		for (const def of BOTTLENECK_DEFS) {
			// Skip 'all' division bottlenecks in the division loop — handle separately
			if (def.division === 'all') {
				handleGlobalBottleneck(def, state);
				continue;
			}

			const divId = def.division as 'teslaenergy' | 'spacex' | 'tesla';
			const divState = newState.divisions[divId];
			if (!divState.unlocked) continue;

			const existingIdx = divState.bottlenecks.findIndex((b) => b.id === def.id);
			const existing = existingIdx >= 0 ? divState.bottlenecks[existingIdx] : null;

			const shouldBeActive = def.shouldActivate(state);

			if (shouldBeActive && (!existing || !existing.active)) {
				// Check if already resolved — once resolved, stays resolved unless state changes
				if (existing?.resolved) {
					// Already resolved, don't re-trigger
					continue;
				}

				// Activate bottleneck
				const bottleneckState: BottleneckState = {
					id: def.id,
					active: true,
					severity: def.severity,
					resolved: false,
				};

				if (existingIdx >= 0) {
					divState.bottlenecks[existingIdx] = bottleneckState;
				} else {
					divState.bottlenecks.push(bottleneckState);
				}

				changed = true;

				// Emit event (only if not already notified)
				if (!notifiedBottlenecks.has(def.id)) {
					notifiedBottlenecks.add(def.id);
					eventBus.emit('bottleneck:hit', {
						division: def.division,
						type: def.name,
						description: def.description,
					});
				}
			} else if (!shouldBeActive && existing?.active && !existing.resolved) {
				// Auto-resolve: condition no longer met (shouldn't normally happen unless player sells)
				// Keep it active — they still need to pay to resolve
			}

			// Check auto-resolve conditions
			if (existing?.active && !existing.resolved && def.autoResolveCheck?.(state)) {
				const resolved: BottleneckState = { ...existing, active: false, resolved: true };
				divState.bottlenecks[existingIdx] = resolved;
				changed = true;
				notifiedBottlenecks.delete(def.id);
				eventBus.emit('bottleneck:resolved', {
					division: def.division,
					type: def.name,
				});
			}
		}

		return changed ? newState : state;
	});
}

/**
 * Handle global (cross-division) bottlenecks like power deficit.
 * These don't attach to a specific division's bottleneck array.
 */
function handleGlobalBottleneck(def: BottleneckDef, state: GameState): void {
	const isActive = def.shouldActivate(state);
	const wasNotified = notifiedBottlenecks.has(def.id);

	if (isActive && !wasNotified) {
		notifiedBottlenecks.add(def.id);
		eventBus.emit('bottleneck:hit', {
			division: 'all',
			type: def.name,
			description: def.description,
		});
	} else if (!isActive && wasNotified) {
		notifiedBottlenecks.delete(def.id);
		eventBus.emit('bottleneck:resolved', {
			division: 'all',
			type: def.name,
		});
	}
}

/**
 * Resolve a bottleneck by spending cash.
 * Returns true if resolution succeeded.
 */
export function resolveBottleneck(divisionId: string, bottleneckId: string): boolean {
	const def = BOTTLENECK_MAP.get(bottleneckId);
	if (!def || def.resolveCost <= 0) return false;

	let success = false;

	gameState.update((state) => {
		if (state.cash < def.resolveCost) return state;

		const divId = divisionId as 'teslaenergy' | 'spacex' | 'tesla';
		const divState = state.divisions[divId];
		if (!divState) return state;

		const idx = divState.bottlenecks.findIndex((b) => b.id === bottleneckId && b.active);
		if (idx < 0) return state;

		// Clone state
		const newState = {
			...state,
			cash: state.cash - def.resolveCost,
			divisions: {
				...state.divisions,
				[divId]: {
					...divState,
					bottlenecks: divState.bottlenecks.map((b, i) =>
						i === idx ? { ...b, active: false, resolved: true, severity: 0 } : b
					),
				},
			},
		};

		success = true;
		notifiedBottlenecks.delete(bottleneckId);

		eventBus.emit('bottleneck:resolved', {
			division: divisionId,
			type: def.name,
		});

		return newState;
	});

	return success;
}

/**
 * Get the total severity penalty for a division from active bottlenecks.
 * Returns a multiplier (e.g., 0.7 = 30% total slowdown).
 * Penalties stack additively then cap at 0.8 (never more than 80% slowdown).
 */
export function getBottleneckMultiplier(divisionId: string, state: GameState): number {
	const divId = divisionId as 'teslaenergy' | 'spacex' | 'tesla';
	const divState = state.divisions[divId];
	if (!divState) return 1;

	let totalSeverity = 0;
	for (const b of divState.bottlenecks) {
		if (b.active && !b.resolved) {
			totalSeverity += b.severity;
		}
	}

	// Cap at 80% slowdown (multiplier never below 0.2)
	return Math.max(0.2, 1 - Math.min(totalSeverity, 0.8));
}

/**
 * Get all active (unresolved) bottlenecks for a division.
 */
export function getActiveBottlenecks(divisionId: string, state: GameState): { state: BottleneckState; def: BottleneckDef }[] {
	const divId = divisionId as 'teslaenergy' | 'spacex' | 'tesla';
	const divState = state.divisions[divId];
	if (!divState) return [];

	const results: { state: BottleneckState; def: BottleneckDef }[] = [];
	for (const b of divState.bottlenecks) {
		if (b.active && !b.resolved) {
			const def = BOTTLENECK_MAP.get(b.id);
			if (def) results.push({ state: b, def });
		}
	}
	return results;
}

/**
 * Get a bottleneck definition by id.
 */
export function getBottleneckDef(id: string): BottleneckDef | undefined {
	return BOTTLENECK_MAP.get(id);
}

/**
 * Reset notification tracking (e.g., on prestige).
 */
export function resetBottleneckNotifications(): void {
	notifiedBottlenecks.clear();
	lastCheckMs = 0;
}
