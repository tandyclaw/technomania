/**
 * BottleneckSystem.ts — Dynamic bottleneck events that slow production
 *
 * Bottlenecks trigger when certain thresholds are met (tier counts, etc.)
 * and can be resolved in three ways:
 *   1. Spend cash (instant fix)
 *   2. Spend research points (instant fix, cheaper in cash)
 *   3. Wait it out (real-time countdown)
 *
 * Each bottleneck has:
 *   - Severity: how much it slows production (0.0 - 1.0)
 *   - resolveCost: cash to instantly fix
 *   - researchCost: RP to instantly fix
 *   - waitDurationMs: how long to wait if you don't pay
 *
 * Some bottlenecks are "Production Hell" — major events with extra flavor.
 */

import { get } from 'svelte/store';
import { gameState, type GameState, type BottleneckState } from '$lib/stores/gameState';
import { eventBus } from '$lib/engine/EventBus';
import { calculatePowerBalance } from './PowerSystem';

export type BottleneckCategory = 'engineering' | 'supply_chain' | 'regulatory' | 'scaling' | 'power';

export interface BottleneckDef {
	id: string;
	name: string;
	description: string;
	division: 'teslaenergy' | 'spacex' | 'tesla' | 'all';
	category: BottleneckCategory;
	severity: number; // 0.0 = no effect, 1.0 = total stop
	resolveCost: number; // cash to fix instantly
	researchCost?: number; // RP to fix instantly (optional)
	waitDurationMs?: number; // time to wait it out (if allowed)
	flavorText?: string;
	tooltip?: string;
	isProductionHell?: boolean;
	productionHellFlavor?: string[];
	shouldActivate: (state: GameState) => boolean;
	autoResolveCheck?: (state: GameState) => boolean;
}

/**
 * All bottleneck definitions.
 * 3-5 per division with engineering/industry flavor.
 */
export const BOTTLENECK_DEFS: BottleneckDef[] = [
	// ── Energy Division (5 bottlenecks) ──────────────────────────────────────
	{
		id: 'te_grid_overload',
		name: 'Grid Overload',
		description: 'Too many solar installations are destabilizing the local grid.',
		division: 'teslaenergy',
		category: 'engineering',
		severity: 0.25,
		resolveCost: 5000,
		researchCost: 3,
		waitDurationMs: 120_000,
		flavorText: 'Utility companies are pushing back on net metering.',
		tooltip: 'The "duck curve" — grids see huge solar oversupply at midday and steep demand ramps at sunset. Too much distributed solar without storage can cause voltage instability.',
		shouldActivate: (state) => {
			const tiers = state.divisions.teslaenergy.tiers;
			return tiers[0].count + tiers[1].count > 50;
		},
	},
	{
		id: 'te_supply_shortage',
		name: 'Battery Cell Shortage',
		description: 'Global lithium-ion cell supply can\'t keep up with demand.',
		division: 'teslaenergy',
		category: 'supply_chain',
		severity: 0.30,
		resolveCost: 50000,
		researchCost: 8,
		waitDurationMs: 300_000,
		flavorText: 'Every company wants the same battery cells you do.',
		tooltip: 'The global battery supply chain depends on lithium, cobalt, nickel, and manganese. Demand is growing ~30% annually, outpacing mining capacity.',
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
		waitDurationMs: 600_000,
		flavorText: 'Environmental impact studies take forever.',
		tooltip: 'Utility-scale energy projects often wait 4-5 years in interconnection queues. Environmental assessments and zoning permits create massive delays.',
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
		waitDurationMs: 180_000,
		flavorText: 'Chip fabs are at max capacity. Everyone wants semiconductors.',
		tooltip: 'Solar inverters rely on power semiconductors (IGBTs, MOSFETs) that face supply constraints due to auto industry competition.',
		shouldActivate: (state) => {
			const tiers = state.divisions.teslaenergy.tiers;
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
		waitDurationMs: 480_000,
		flavorText: 'There are 2,000 GW of projects waiting in line ahead of you.',
		tooltip: 'Over 2,600 GW of generation and storage projects sit in interconnection queues — 5x the entire current grid capacity. Average wait time is 5 years.',
		shouldActivate: (state) => {
			const tiers = state.divisions.teslaenergy.tiers;
			return tiers[5].count > 3;
		},
	},

	// ── Rockets Division (5 bottlenecks) ─────────────────────────────────────
	{
		id: 'sx_launch_cadence',
		name: 'Launch Pad Congestion',
		description: 'Not enough launch pads for your rocket fleet.',
		division: 'spacex',
		category: 'engineering',
		severity: 0.25,
		resolveCost: 8000,
		researchCost: 4,
		waitDurationMs: 150_000,
		flavorText: 'FAA wants a word about your launch frequency.',
		tooltip: 'Launch pads require turnaround time for refurbishment, propellant loading, and range safety clearance — limiting cadence.',
		shouldActivate: (state) => {
			const tiers = state.divisions.spacex.tiers;
			return tiers[1].count > 30;
		},
	},
	{
		id: 'sx_heat_shield',
		name: 'Heat Shield Cracking',
		description: 'Thermal protection tiles keep falling off during reentry.',
		division: 'spacex',
		category: 'engineering',
		severity: 0.35,
		resolveCost: 150000,
		researchCost: 12,
		waitDurationMs: 420_000,
		flavorText: 'Each tile is hand-applied. There are 18,000 of them.',
		tooltip: 'Reusable rockets need heat shield tiles made of silica fiber that survive 1,400°C during reentry at Mach 25.',
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
		waitDurationMs: 900_000,
		flavorText: '"We need to study the impact on the lesser prairie chicken."',
		shouldActivate: (state) => {
			const tiers = state.divisions.spacex.tiers;
			return tiers[5].count > 3;
		},
	},
	{
		id: 'sx_raptor_reliability',
		name: 'Engine Reliability Crisis',
		description: 'Engines keep exploding on the test stand. Production yield is abysmal.',
		division: 'spacex',
		category: 'engineering',
		severity: 0.25,
		resolveCost: 40000,
		researchCost: 6,
		waitDurationMs: 240_000,
		flavorText: 'Full-flow staged combustion: theoretically optimal, practically nightmarish.',
		tooltip: 'Full-flow staged combustion engines are thermodynamically optimal but incredibly hard to build. Each super-heavy rocket uses 30+ engines.',
		shouldActivate: (state) => {
			const tiers = state.divisions.spacex.tiers;
			return tiers[2].count > 15;
		},
	},
	{
		id: 'sx_range_safety',
		name: 'Range Safety Shutdown',
		description: 'Military has grounded launches due to range scheduling conflicts.',
		division: 'spacex',
		category: 'regulatory',
		severity: 0.20,
		resolveCost: 20000,
		researchCost: 5,
		waitDurationMs: 180_000,
		flavorText: 'The launch range can only handle so many launches per week.',
		tooltip: 'Launch ranges are managed by military. All launches share the same airspace and tracking assets, creating scheduling conflicts.',
		shouldActivate: (state) => {
			const tiers = state.divisions.spacex.tiers;
			return tiers[0].count > 40;
		},
	},

	// ── EVs Division (6 bottlenecks) ─────────────────────────────────────────
	{
		id: 'ts_production_hell',
		name: '🔥 PRODUCTION HELL 🔥',
		description: 'Mass market EV production is a nightmare. Robots fighting robots. Workers sleeping on floors.',
		division: 'tesla',
		category: 'scaling',
		severity: 0.50,
		resolveCost: 250000,
		researchCost: 20,
		waitDurationMs: 600_000,
		flavorText: 'Manufacturing at scale is war. The factory floor becomes home.',
		tooltip: 'Scaling from thousands to hundreds of thousands of vehicles per year is brutally hard. Over-automation backfires. You need to rebuild processes from scratch.',
		isProductionHell: true,
		productionHellFlavor: [
			'The paint shop is a disaster. Every car needs rework.',
			'Robots keep crashing into each other on the body line.',
			'Battery module production is in a tent in the parking lot.',
			'The CEO is personally inspecting every weld. This can\'t scale.',
			'"Manufacturing is hard. Manufacturing is really, really hard."',
		],
		shouldActivate: (state) => {
			const tiers = state.divisions.tesla.tiers;
			return tiers[3].count >= 10;
		},
	},
	{
		id: 'ts_panel_gaps',
		name: 'Quality Control Crisis',
		description: 'Build quality issues are piling up. Customers are complaining.',
		division: 'tesla',
		category: 'engineering',
		severity: 0.20,
		resolveCost: 25000,
		researchCost: 4,
		waitDurationMs: 150_000,
		flavorText: 'Social media is roasting your panel gaps.',
		tooltip: 'Panel gaps and fit-and-finish issues plague fast-scaling manufacturers. Traditional automakers have decades of stamping expertise.',
		shouldActivate: (state) => {
			const tiers = state.divisions.tesla.tiers;
			return tiers[0].count + tiers[1].count + tiers[2].count > 60;
		},
	},
	{
		id: 'ts_gigafactory_scaling',
		name: 'Factory Scaling Crisis',
		description: 'Building cars at scale requires an entirely new factory paradigm.',
		division: 'tesla',
		category: 'scaling',
		severity: 0.35,
		resolveCost: 300000,
		researchCost: 18,
		waitDurationMs: 540_000,
		flavorText: 'The factory IS the product.',
		tooltip: 'Gigafactories are among the largest buildings on Earth. "The machine that builds the machine" philosophy means factory design is as important as car design.',
		shouldActivate: (state) => {
			const tiers = state.divisions.tesla.tiers;
			return tiers[4].count > 8;
		},
	},
	{
		id: 'ts_autopilot_recall',
		name: 'Self-Driving Recall',
		description: 'NHTSA has issued a safety recall on your autonomous driving system.',
		division: 'tesla',
		category: 'regulatory',
		severity: 0.25,
		resolveCost: 100000,
		researchCost: 8,
		waitDurationMs: 300_000,
		flavorText: 'It\'s technically a software update, not a physical recall.',
		tooltip: 'Regulators investigate autonomous driving systems frequently. Unlike traditional recalls, software issues can be fixed over-the-air.',
		shouldActivate: (state) => {
			const tiers = state.divisions.tesla.tiers;
			return tiers[1].count + tiers[2].count > 40;
		},
	},
	{
		id: 'ts_truck_glass',
		name: 'Armor Glass Failure',
		description: 'The "unbreakable" truck windows keep shattering during demos.',
		division: 'tesla',
		category: 'engineering',
		severity: 0.30,
		resolveCost: 200000,
		researchCost: 12,
		waitDurationMs: 360_000,
		flavorText: 'The infamous window shatter. Live on stage. Millions watching.',
		tooltip: 'Demonstrating "unbreakable" glass on stage is risky. When it fails publicly, it becomes a meme.',
		shouldActivate: (state) => {
			const tiers = state.divisions.tesla.tiers;
			return tiers[5].count > 5;
		},
	},
	{
		id: 'ts_truck_production_hell',
		name: '🔥 TRUCK HELL 🔥',
		description: 'Stainless steel is nearly impossible to stamp. Every panel is a custom job.',
		division: 'tesla',
		category: 'scaling',
		severity: 0.55,
		resolveCost: 500000,
		researchCost: 30,
		waitDurationMs: 900_000,
		flavorText: 'The best product ever. Also the hardest to build.',
		tooltip: 'Stainless steel exoskeleton trucks can\'t be stamped like normal panels. Each piece must be laser-cut and precisely folded.',
		isProductionHell: true,
		productionHellFlavor: [
			'Stainless steel body panels require a completely new stamping process.',
			'The exoskeleton design means you can\'t fix panels — the whole body IS the frame.',
			'Laser-cutting each panel takes 3x longer than stamping aluminum.',
			'The giant wiper motor keeps failing QC. There\'s only ONE wiper.',
			'"This truck was designed by aliens who hate manufacturing engineers."',
		],
		shouldActivate: (state) => {
			const tiers = state.divisions.tesla.tiers;
			return tiers[5].count >= 10;
		},
	},

	// ── Cross-cutting: Power ─────────────────────────────────────────────────
	{
		id: 'power_deficit',
		name: 'Power Deficit',
		description: 'Your facilities consume more power than you generate.',
		division: 'all',
		category: 'power',
		severity: 0.0,
		resolveCost: 0,
		flavorText: 'Build more Energy infrastructure to restore full speed.',
		tooltip: 'Modern factories and rocket facilities consume enormous amounts of power. Vertical integration of energy production is key to scaling.',
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

/**
 * Get the bottleneck definition by ID.
 */
export function getBottleneckDef(id: string): BottleneckDef | null {
	return BOTTLENECK_DEFS.find((b) => b.id === id) ?? null;
}

/**
 * Check and activate bottlenecks for a given division.
 * Called from the game loop.
 */
export function checkBottlenecks(divisionId: string): void {
	const state = get(gameState);

	for (const def of BOTTLENECK_DEFS) {
		// Skip bottlenecks for other divisions
		if (def.division !== 'all' && def.division !== divisionId) continue;

		// Check if this bottleneck is already active
		const divState = divisionId === 'all' ? null : state.divisions[divisionId as keyof typeof state.divisions];
		if (!divState && def.division !== 'all') continue;

		const existingBottleneck = divState?.bottlenecks.find((b) => b.id === def.id);

		// If already resolved, skip
		if (existingBottleneck?.resolved) continue;

		// If already active, skip
		if (existingBottleneck?.active) continue;

		// Check activation condition
		if (def.shouldActivate(state)) {
			activateBottleneck(divisionId, def.id);
		}
	}
}

/**
 * Activate a bottleneck.
 */
export function activateBottleneck(divisionId: string, bottleneckId: string): void {
	const def = getBottleneckDef(bottleneckId);
	if (!def) return;

	gameState.update((s) => {
		if (def.division === 'all') {
			// Power deficit is global — apply to all divisions
			for (const divId of ['teslaenergy', 'spacex', 'tesla'] as const) {
				const divState = s.divisions[divId];
				const existing = divState.bottlenecks.find((b) => b.id === bottleneckId);
				if (!existing) {
					divState.bottlenecks.push({
						id: bottleneckId,
						active: true,
						severity: def.severity,
						resolved: false,
					});
				} else if (!existing.active && !existing.resolved) {
					existing.active = true;
				}
			}
		} else {
			const divState = s.divisions[divisionId as keyof typeof s.divisions];
			if (!divState) return s;

			const existing = divState.bottlenecks.find((b) => b.id === bottleneckId);
			if (!existing) {
				divState.bottlenecks.push({
					id: bottleneckId,
					active: true,
					severity: def.severity,
					resolved: false,
				});
			} else if (!existing.active && !existing.resolved) {
				existing.active = true;
			}
		}

		// Emit event for toast
		eventBus.emit('bottleneck:hit', {
			division: divisionId,
			bottleneckId,
			description: def.description,
		});

		return { ...s };
	});
}

/**
 * Resolve a bottleneck by spending cash.
 */
export function resolveBottleneck(divisionId: string, bottleneckId: string): boolean {
	const def = getBottleneckDef(bottleneckId);
	if (!def) return false;

	const state = get(gameState);
	if (state.cash < def.resolveCost) return false;

	gameState.update((s) => {
		s.cash -= def.resolveCost;

		const divState = s.divisions[divisionId as keyof typeof s.divisions];
		if (!divState) return s;

		const bottleneck = divState.bottlenecks.find((b) => b.id === bottleneckId);
		if (bottleneck) {
			bottleneck.active = false;
			bottleneck.resolved = true;
		}

		eventBus.emit('bottleneck:resolved', {
			division: divisionId,
			bottleneckId,
			type: 'cash',
		});

		return { ...s };
	});

	return true;
}

/**
 * Resolve a bottleneck by spending research points.
 */
export function resolveBottleneckWithRP(divisionId: string, bottleneckId: string): boolean {
	const def = getBottleneckDef(bottleneckId);
	if (!def || !def.researchCost) return false;

	const state = get(gameState);
	if (state.researchPoints < def.researchCost) return false;

	gameState.update((s) => {
		s.researchPoints -= def.researchCost!;

		const divState = s.divisions[divisionId as keyof typeof s.divisions];
		if (!divState) return s;

		const bottleneck = divState.bottlenecks.find((b) => b.id === bottleneckId);
		if (bottleneck) {
			bottleneck.active = false;
			bottleneck.resolved = true;
		}

		eventBus.emit('bottleneck:resolved', {
			division: divisionId,
			bottleneckId,
			type: 'research',
		});

		return { ...s };
	});

	return true;
}

/**
 * Start waiting out a bottleneck.
 */
export function startBottleneckWait(divisionId: string, bottleneckId: string): void {
	const def = getBottleneckDef(bottleneckId);
	if (!def || !def.waitDurationMs) return;

	gameState.update((s) => {
		const divState = s.divisions[divisionId as keyof typeof s.divisions];
		if (!divState) return s;

		const bottleneck = divState.bottlenecks.find((b) => b.id === bottleneckId);
		if (bottleneck && bottleneck.active) {
			bottleneck.waitStartedAt = Date.now();
		}

		return { ...s };
	});
}

/**
 * Check if a bottleneck's wait timer has completed.
 * Called from game loop tick.
 */
export function tickBottleneckWaits(divisionId: string): void {
	const state = get(gameState);
	const divState = state.divisions[divisionId as keyof typeof state.divisions];
	if (!divState) return;

	for (const bottleneck of divState.bottlenecks) {
		if (!bottleneck.active || !bottleneck.waitStartedAt) continue;

		const def = getBottleneckDef(bottleneck.id);
		if (!def || !def.waitDurationMs) continue;

		const elapsed = Date.now() - bottleneck.waitStartedAt;
		if (elapsed >= def.waitDurationMs) {
			// Wait complete — resolve it
			gameState.update((s) => {
				const div = s.divisions[divisionId as keyof typeof s.divisions];
				const b = div?.bottlenecks.find((x) => x.id === bottleneck.id);
				if (b) {
					b.active = false;
					b.resolved = true;
					b.waitStartedAt = undefined;
				}

				eventBus.emit('bottleneck:resolved', {
					division: divisionId,
					bottleneckId: bottleneck.id,
					type: 'wait',
				});

				return { ...s };
			});
		}
	}
}

/**
 * Check for auto-resolving bottlenecks (like power deficit when power is restored).
 */
export function checkAutoResolveBottlenecks(): void {
	const state = get(gameState);

	for (const def of BOTTLENECK_DEFS) {
		if (!def.autoResolveCheck) continue;

		// Check if condition for auto-resolve is met
		if (def.autoResolveCheck(state)) {
			// Mark as resolved in all divisions
			gameState.update((s) => {
				for (const divId of ['teslaenergy', 'spacex', 'tesla'] as const) {
					const divState = s.divisions[divId];
					const bottleneck = divState.bottlenecks.find((b) => b.id === def.id);
					if (bottleneck && bottleneck.active) {
						bottleneck.active = false;
						bottleneck.resolved = false; // Can reactivate if condition triggers again
					}
				}
				return { ...s };
			});
		}
	}
}

/**
 * Get active bottlenecks for a division.
 */
export function getActiveBottlenecks(
	divisionId: string,
	state: GameState
): { state: BottleneckState; def: BottleneckDef }[] {
	const divState = state.divisions[divisionId as keyof typeof state.divisions];
	if (!divState) return [];

	return divState.bottlenecks
		.filter((b) => b.active)
		.map((b) => ({
			state: b,
			def: getBottleneckDef(b.id)!,
		}))
		.filter((x) => x.def !== null);
}

/**
 * Calculate the production multiplier for a division based on active bottlenecks.
 * Returns a number between 0.1 and 1.0.
 */
export function getBottleneckMultiplier(divisionId: string, state: GameState): number {
	const active = getActiveBottlenecks(divisionId, state);
	if (active.length === 0) return 1.0;

	// Combine severities — each bottleneck reduces production by its severity
	let multiplier = 1.0;
	for (const { def } of active) {
		multiplier *= 1 - def.severity;
	}

	// Floor at 10% — never completely stop production
	return Math.max(0.1, multiplier);
}

// --- Tick Functions for Game Loop ---

/** How often to check bottleneck conditions (ms) */
const CHECK_INTERVAL_MS = 2000;
let lastCheckMs = 0;

/** Track which bottlenecks we've already notified about (to avoid spam) */
const notifiedBottlenecks = new Set<string>();

/**
 * Handle global bottlenecks (like power deficit) that affect all divisions.
 */
function handleGlobalBottleneck(def: BottleneckDef, state: GameState): void {
	const shouldBeActive = def.shouldActivate(state);
	const shouldAutoResolve = def.autoResolveCheck?.(state) ?? false;

	if (shouldAutoResolve) {
		// Auto-resolve in all divisions
		for (const divId of ['teslaenergy', 'spacex', 'tesla'] as const) {
			gameState.update((s) => {
				const bottleneck = s.divisions[divId].bottlenecks.find((b) => b.id === def.id);
				if (bottleneck?.active) {
					bottleneck.active = false;
				}
				return s;
			});
		}
		return;
	}

	if (shouldBeActive) {
		// Activate in all divisions
		for (const divId of ['teslaenergy', 'spacex', 'tesla'] as const) {
			gameState.update((s) => {
				const existing = s.divisions[divId].bottlenecks.find((b) => b.id === def.id);
				if (!existing) {
					s.divisions[divId].bottlenecks.push({
						id: def.id,
						active: true,
						severity: def.severity,
						resolved: false,
					});
				} else if (!existing.active && !existing.resolved) {
					existing.active = true;
				}
				return s;
			});
		}
	}
}

/**
 * Main tick function — check and update bottleneck states.
 * Called from game loop.
 */
export function tickBottlenecks(deltaMs: number): void {
	lastCheckMs += deltaMs;
	if (lastCheckMs < CHECK_INTERVAL_MS) return;
	lastCheckMs = 0;

	const state = get(gameState);

	for (const def of BOTTLENECK_DEFS) {
		// Handle global bottlenecks separately
		if (def.division === 'all') {
			handleGlobalBottleneck(def, state);
			continue;
		}

		const divId = def.division as 'teslaenergy' | 'spacex' | 'tesla';
		const divState = state.divisions[divId];
		if (!divState.unlocked) continue;

		const existing = divState.bottlenecks.find((b) => b.id === def.id);

		// Skip if already resolved
		if (existing?.resolved) continue;

		const shouldBeActive = def.shouldActivate(state);

		if (shouldBeActive && !existing?.active) {
			// Activate this bottleneck
			activateBottleneck(divId, def.id);

			// Notify once
			if (!notifiedBottlenecks.has(def.id)) {
				notifiedBottlenecks.add(def.id);
			}
		}
	}

	// Check wait timers
	for (const divId of ['teslaenergy', 'spacex', 'tesla'] as const) {
		tickBottleneckWaits(divId);
	}

	// Check auto-resolve conditions
	checkAutoResolveBottlenecks();
}

/**
 * Reset notification tracking (called on game reset/load).
 */
export function resetBottleneckNotifications(): void {
	notifiedBottlenecks.clear();
	lastCheckMs = 0;
}
