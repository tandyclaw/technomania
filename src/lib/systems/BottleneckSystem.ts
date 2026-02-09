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
	/** Research point cost to resolve (alternative resolution path) */
	researchCost?: number;
	/** Time to wait for auto-resolution in ms */
	waitDurationMs?: number;
	/** Flavor text shown when bottleneck triggers */
	flavorText: string;
	/**
	 * T033: "Production Hell" — special bottleneck with extra flavor.
	 * Gets unique UI treatment (pulsing red, extra text, harder to resolve).
	 */
	isProductionHell?: boolean;
	/** Extra flavor text lines shown for Production Hell events */
	productionHellFlavor?: string[];
	/** Real-world tooltip explaining the engineering concept behind this bottleneck */
	tooltip?: string;
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
		tooltip: 'The "duck curve" — California\'s grid sees huge solar oversupply at midday and steep demand ramps at sunset. Too much distributed solar without storage can cause voltage instability and frequency deviations.',
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
		tooltip: 'The global battery cell supply chain depends on lithium, cobalt, nickel, and manganese. As of 2024, demand for EV and storage batteries is growing ~30% annually, outpacing mining and refining capacity.',
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
		tooltip: 'In the US, utility-scale energy projects often wait 4-5 years in interconnection queues. Environmental impact assessments, zoning permits, and grid studies create massive delays for clean energy deployment.',
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
		tooltip: 'Solar inverters convert DC from panels to AC for the grid. They rely on IGBTs and MOSFETs — power semiconductors that faced severe shortages in 2021-2023 due to auto industry competition and fab capacity limits.',
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
		tooltip: 'As of 2024, over 2,600 GW of generation and storage projects sit in US interconnection queues — 5x the entire current grid capacity. Average wait time is 5 years. This is the #1 bottleneck for clean energy growth.',
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
		tooltip: 'SpaceX operates pads at Cape Canaveral (LC-40), KSC (LC-39A), and Vandenberg (SLC-4E). Turnaround between launches requires pad refurbishment, propellant loading, and range safety clearance — limiting cadence to ~every 3 days per pad.',
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
		tooltip: 'Starship uses ~18,000 hexagonal heat shield tiles made of silica fiber. Unlike the Space Shuttle\'s unique tiles, SpaceX uses uniform shapes for manufacturability. Tiles must survive 1,400°C during reentry at Mach 25.',
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
		flavorText: 'Full-flow staged combustion: theoretically optimal, practically nightmarish.',
		tooltip: 'Raptor is the first operational full-flow staged combustion engine — both turbopumps run fuel-rich and oxidizer-rich preburners. This is thermodynamically optimal but incredibly hard to build. Each Starship uses 33 Raptors on the booster alone.',
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
		tooltip: 'The Eastern Range at Cape Canaveral is managed by the US Space Force. All launches share the same airspace and tracking assets. SpaceX\'s rapid launch cadence has pushed the range to adopt autonomous flight safety systems (AFSS) to reduce scheduling conflicts.',
		shouldActivate: (state) => {
			const tiers = state.divisions.spacex.tiers;
			// Triggers when Falcon 1 count > 40
			return tiers[0].count > 40;
		},
	},

	// ── Tesla EVs (5 bottlenecks) ─────────────────────────────────────────────
	{
		id: 'ts_production_hell',
		name: '🔥 PRODUCTION HELL 🔥',
		description: 'Model 3 production line is a nightmare. Robots are fighting each other. Humans are sleeping on the floor. Welcome to the machine.',
		division: 'tesla',
		category: 'scaling',
		severity: 0.50,
		resolveCost: 250000,
		researchCost: 20,
		waitDurationMs: 600_000, // 10 minutes — much longer than normal
		flavorText: '"I\'m sleeping on the factory floor." — Elon, 2018.',
		tooltip: 'In 2018, Tesla nearly went bankrupt trying to scale Model 3 production. The team slept on the factory floor for months. They scrapped an over-automated assembly line and rebuilt with more human workers. Production went from 2,000 to 5,000/week in 3 months.',
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
		name: 'Panel Gap Crisis',
		description: 'Quality control issues are piling up. Customers are complaining.',
		division: 'tesla',
		category: 'engineering',
		severity: 0.20,
		resolveCost: 25000,
		researchCost: 4,
		waitDurationMs: 150_000, // 2.5 minutes
		flavorText: 'Reddit is not happy about the panel gaps.',
		tooltip: 'Panel gaps — the uneven spacing between body panels — became a meme for Tesla quality issues. Traditional automakers use decades of stamping expertise; Tesla prioritized speed over fit-and-finish, leading to inconsistent panel alignment.',
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
		tooltip: 'Tesla\'s Gigafactories are among the largest buildings by footprint on Earth. Giga Nevada alone covers 5.3 million sq ft. "The machine that builds the machine" philosophy means factory design is as important as car design.',
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
		tooltip: 'NHTSA has investigated Tesla\'s Autopilot/FSD system multiple times. In 2023, Tesla issued an OTA software recall affecting 2 million vehicles. Unlike traditional recalls requiring dealer visits, Tesla can fix software issues remotely.',
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
		flavorText: 'The infamous window shatter. Live on stage. Millions watching.',
		tooltip: 'At the Nov 2019 Cybertruck reveal, Franz von Holzhausen threw a steel ball at the "armor glass" windows — which promptly shattered on live TV. Elon\'s stunned "Oh my f***ing God" became one of the most memed product launch moments ever.',
		shouldActivate: (state) => {
			const tiers = state.divisions.tesla.tiers;
			// Triggers when Cybertruck count > 5
			return tiers[5].count > 5;
		},
	},
	{
		id: 'ts_cybertruck_production_hell',
		name: '🔥 CYBERTRUCK HELL 🔥',
		description: 'Stainless steel is nearly impossible to stamp. Every panel is a custom job. The entire factory is a bottleneck.',
		division: 'tesla',
		category: 'scaling',
		severity: 0.55,
		resolveCost: 500000,
		researchCost: 30,
		waitDurationMs: 900_000, // 15 minutes — the hardest bottleneck in the game
		flavorText: 'The best product ever. Also the hardest to build.',
		tooltip: 'Cybertruck uses 3mm ultra-hard 30X stainless steel that can\'t be stamped like normal auto body panels. Each panel must be laser-cut and precisely folded. The exoskeleton design means the body IS the frame — no room for error.',
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
			// Triggers when Cybertruck count >= 10
			return tiers[5].count >= 10;
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
		tooltip: 'Modern factories and rocket facilities consume enormous amounts of power. Tesla\'s Gigafactory Nevada alone uses ~250 MW — enough for a small city. Vertical integration of energy production is key to scaling.',
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
				const resolved: BottleneckState = { ...existing, active: false, resolved: true, waitStartedAt: 0 };
				divState.bottlenecks[existingIdx] = resolved;
				changed = true;
				notifiedBottlenecks.delete(def.id);
				eventBus.emit('bottleneck:resolved', {
					division: def.division,
					type: def.name,
				});
			}

			// Check wait-it-out timer resolution
			if (existing?.active && !existing.resolved && existing.waitStartedAt && existing.waitStartedAt > 0 && def.waitDurationMs) {
				const elapsed = Date.now() - existing.waitStartedAt;
				if (elapsed >= def.waitDurationMs) {
					const resolved: BottleneckState = { ...existing, active: false, resolved: true, severity: 0, waitStartedAt: 0 };
					divState.bottlenecks[existingIdx] = resolved;
					changed = true;
					notifiedBottlenecks.delete(def.id);
					eventBus.emit('bottleneck:resolved', {
						division: def.division,
						type: def.name,
					});
				}
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
						i === idx ? { ...b, active: false, resolved: true, severity: 0, waitStartedAt: 0 } : b
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
 * Resolve a bottleneck by spending research points.
 * Returns true if resolution succeeded.
 */
export function resolveBottleneckWithRP(divisionId: string, bottleneckId: string): boolean {
	const def = BOTTLENECK_MAP.get(bottleneckId);
	if (!def || !def.researchCost || def.researchCost <= 0) return false;

	let success = false;

	gameState.update((state) => {
		if (state.researchPoints < def.researchCost!) return state;

		const divId = divisionId as 'teslaenergy' | 'spacex' | 'tesla';
		const divState = state.divisions[divId];
		if (!divState) return state;

		const idx = divState.bottlenecks.findIndex((b) => b.id === bottleneckId && b.active);
		if (idx < 0) return state;

		const newState = {
			...state,
			researchPoints: state.researchPoints - def.researchCost!,
			divisions: {
				...state.divisions,
				[divId]: {
					...divState,
					bottlenecks: divState.bottlenecks.map((b, i) =>
						i === idx ? { ...b, active: false, resolved: true, severity: 0, waitStartedAt: 0 } : b
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
 * Start the "wait it out" timer on a bottleneck.
 * The bottleneck will auto-resolve after its waitDurationMs elapses.
 */
export function startBottleneckWait(divisionId: string, bottleneckId: string): boolean {
	const def = BOTTLENECK_MAP.get(bottleneckId);
	if (!def || !def.waitDurationMs || def.waitDurationMs <= 0) return false;

	let success = false;

	gameState.update((state) => {
		const divId = divisionId as 'teslaenergy' | 'spacex' | 'tesla';
		const divState = state.divisions[divId];
		if (!divState) return state;

		const idx = divState.bottlenecks.findIndex((b) => b.id === bottleneckId && b.active && !b.resolved);
		if (idx < 0) return state;

		// Already waiting?
		if (divState.bottlenecks[idx].waitStartedAt && divState.bottlenecks[idx].waitStartedAt! > 0) return state;

		const newState = {
			...state,
			divisions: {
				...state.divisions,
				[divId]: {
					...divState,
					bottlenecks: divState.bottlenecks.map((b, i) =>
						i === idx ? { ...b, waitStartedAt: Date.now() } : b
					),
				},
			},
		};

		success = true;
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
