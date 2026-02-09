/**
 * techTree.ts — Tech tree data for the Research system (T037)
 *
 * 18 research nodes across 7 categories.
 * Each node has prerequisites, RP cost, research time, and effects.
 * The tree is roughly shaped as a diamond:
 *   - 3 starter nodes (no prereqs)
 *   - Middle layer branches by division/category
 *   - Late-game nodes require cross-category investment
 */

import type { ResearchNode } from '$lib/systems/ResearchSystem';

export const TECH_TREE: ResearchNode[] = [
	// ──────────── TIER 1: Starters (no prerequisites) ────────────

	{
		id: 'basic_photovoltaics',
		name: 'Basic Photovoltaics',
		description: 'Improved solar cell efficiency. Tesla Energy production speed +15%.',
		cost: 10,
		timeMs: 15_000,
		category: 'energy',
		prerequisites: [],
		effects: [
			{
				type: 'production_speed',
				target: 'teslaenergy',
				value: 0.15,
				description: '+15% Tesla Energy production speed',
			},
		],
	},
	{
		id: 'composite_materials',
		name: 'Composite Materials',
		description: 'Lighter, stronger rocket bodies. SpaceX production speed +15%.',
		cost: 10,
		timeMs: 15_000,
		category: 'materials',
		prerequisites: [],
		effects: [
			{
				type: 'production_speed',
				target: 'spacex',
				value: 0.15,
				description: '+15% SpaceX production speed',
			},
		],
	},
	{
		id: 'drivetrain_optimization',
		name: 'Drivetrain Optimization',
		description: 'More efficient EV powertrains. Tesla revenue +15%.',
		cost: 10,
		timeMs: 15_000,
		category: 'manufacturing',
		prerequisites: [],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'tesla',
				value: 0.15,
				description: '+15% Tesla revenue',
			},
		],
	},

	// ──────────── TIER 2: Division specialists ────────────

	{
		id: 'battery_chemistry_v2',
		name: 'Battery Chemistry V2',
		description: 'Next-gen 4680 cells. Tesla Energy revenue +20%.',
		cost: 25,
		timeMs: 30_000,
		category: 'energy',
		prerequisites: ['basic_photovoltaics'],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'teslaenergy',
				value: 0.20,
				description: '+20% Tesla Energy revenue',
			},
		],
	},
	{
		id: 'rapid_reusability',
		name: 'Rapid Reusability',
		description: 'Faster booster turnaround. SpaceX cost reduction -10%.',
		cost: 25,
		timeMs: 30_000,
		category: 'aerospace',
		prerequisites: ['composite_materials'],
		effects: [
			{
				type: 'cost_reduction',
				target: 'spacex',
				value: 0.10,
				description: '-10% SpaceX tier costs',
			},
		],
	},
	{
		id: 'gigacasting',
		name: 'Gigacasting',
		description: 'Single-piece body casting. Tesla production speed +20%.',
		cost: 25,
		timeMs: 30_000,
		category: 'manufacturing',
		prerequisites: ['drivetrain_optimization'],
		effects: [
			{
				type: 'production_speed',
				target: 'tesla',
				value: 0.20,
				description: '+20% Tesla production speed',
			},
		],
	},
	{
		id: 'software_autopilot',
		name: 'Autopilot Software',
		description: 'Neural net vision. Tesla revenue +20%.',
		cost: 30,
		timeMs: 35_000,
		category: 'software',
		prerequisites: ['drivetrain_optimization'],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'tesla',
				value: 0.20,
				description: '+20% Tesla revenue',
			},
		],
	},

	// ──────────── TIER 3: Cross-division unlocks ────────────

	{
		id: 'grid_scale_storage',
		name: 'Grid-Scale Storage',
		description: 'Megapack infrastructure. Tesla Energy production speed +25% and revenue +10%.',
		cost: 50,
		timeMs: 45_000,
		category: 'energy',
		prerequisites: ['battery_chemistry_v2'],
		effects: [
			{
				type: 'production_speed',
				target: 'teslaenergy',
				value: 0.25,
				description: '+25% Tesla Energy production speed',
			},
			{
				type: 'revenue_multiplier',
				target: 'teslaenergy',
				value: 0.10,
				description: '+10% Tesla Energy revenue',
			},
		],
	},
	{
		id: 'starship_heat_shield',
		name: 'Starship Heat Shield',
		description: 'Reusable heat tiles. SpaceX production speed +25%.',
		cost: 50,
		timeMs: 45_000,
		category: 'aerospace',
		prerequisites: ['rapid_reusability'],
		effects: [
			{
				type: 'production_speed',
				target: 'spacex',
				value: 0.25,
				description: '+25% SpaceX production speed',
			},
		],
	},
	{
		id: 'fsd_v12',
		name: 'Full Self-Driving V12',
		description: 'End-to-end neural driving. Tesla revenue +30%.',
		cost: 60,
		timeMs: 50_000,
		category: 'software',
		prerequisites: ['software_autopilot', 'gigacasting'],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'tesla',
				value: 0.30,
				description: '+30% Tesla revenue',
			},
		],
	},
	{
		id: 'orbital_refueling',
		name: 'Orbital Refueling',
		description: 'In-space propellant transfer. SpaceX revenue +25%.',
		cost: 60,
		timeMs: 50_000,
		category: 'aerospace',
		prerequisites: ['starship_heat_shield'],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'spacex',
				value: 0.25,
				description: '+25% SpaceX revenue',
			},
		],
	},

	// ──────────── TIER 4: Synergies & cross-division ────────────

	{
		id: 'shared_battery_platform',
		name: 'Shared Battery Platform',
		description: 'Unified cell design across divisions. All divisions revenue +10%.',
		cost: 80,
		timeMs: 60_000,
		category: 'manufacturing',
		prerequisites: ['battery_chemistry_v2', 'gigacasting'],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'teslaenergy',
				value: 0.10,
				description: '+10% Tesla Energy revenue',
			},
			{
				type: 'revenue_multiplier',
				target: 'tesla',
				value: 0.10,
				description: '+10% Tesla revenue',
			},
			{
				type: 'revenue_multiplier',
				target: 'spacex',
				value: 0.10,
				description: '+10% SpaceX revenue',
			},
		],
	},
	{
		id: 'ai_manufacturing',
		name: 'AI Manufacturing',
		description: 'Robot-optimized assembly lines. All divisions production speed +15%.',
		cost: 90,
		timeMs: 60_000,
		category: 'software',
		prerequisites: ['fsd_v12', 'shared_battery_platform'],
		effects: [
			{
				type: 'production_speed',
				target: 'teslaenergy',
				value: 0.15,
				description: '+15% Tesla Energy production speed',
			},
			{
				type: 'production_speed',
				target: 'tesla',
				value: 0.15,
				description: '+15% Tesla production speed',
			},
			{
				type: 'production_speed',
				target: 'spacex',
				value: 0.15,
				description: '+15% SpaceX production speed',
			},
		],
	},
	{
		id: 'solar_launch_grid',
		name: 'Solar Launch Grid',
		description: 'Solar-powered launch complex. Power output +30%.',
		cost: 75,
		timeMs: 55_000,
		category: 'infrastructure',
		prerequisites: ['grid_scale_storage', 'starship_heat_shield'],
		effects: [
			{
				type: 'power_output',
				target: 'teslaenergy',
				value: 0.30,
				description: '+30% power output',
			},
		],
	},

	// ──────────── TIER 5: Endgame ────────────

	{
		id: 'optimus_workforce',
		name: 'Optimus Workforce',
		description: 'Humanoid robot labor. All divisions cost reduction -15%.',
		cost: 120,
		timeMs: 75_000,
		category: 'manufacturing',
		prerequisites: ['ai_manufacturing'],
		effects: [
			{
				type: 'cost_reduction',
				target: 'teslaenergy',
				value: 0.15,
				description: '-15% Tesla Energy tier costs',
			},
			{
				type: 'cost_reduction',
				target: 'tesla',
				value: 0.15,
				description: '-15% Tesla tier costs',
			},
			{
				type: 'cost_reduction',
				target: 'spacex',
				value: 0.15,
				description: '-15% SpaceX tier costs',
			},
		],
	},
	{
		id: 'mars_colony_alpha',
		name: 'Mars Colony Alpha',
		description: 'First permanent Mars settlement. SpaceX revenue +50%.',
		cost: 150,
		timeMs: 90_000,
		category: 'aerospace',
		prerequisites: ['orbital_refueling', 'solar_launch_grid'],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'spacex',
				value: 0.50,
				description: '+50% SpaceX revenue',
			},
		],
	},
	{
		id: 'neural_link_v2',
		name: 'Neuralink V2',
		description: 'Brain-computer interface at scale. All revenue +20%.',
		cost: 140,
		timeMs: 80_000,
		category: 'biotech',
		prerequisites: ['fsd_v12', 'optimus_workforce'],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'teslaenergy',
				value: 0.20,
				description: '+20% Tesla Energy revenue',
			},
			{
				type: 'revenue_multiplier',
				target: 'tesla',
				value: 0.20,
				description: '+20% Tesla revenue',
			},
			{
				type: 'revenue_multiplier',
				target: 'spacex',
				value: 0.20,
				description: '+20% SpaceX revenue',
			},
		],
	},
];

/**
 * Lookup map for fast access by ID
 */
export const TECH_TREE_MAP: Record<string, ResearchNode> = {};
for (const node of TECH_TREE) {
	TECH_TREE_MAP[node.id] = node;
}

/**
 * Category metadata for display
 */
export const CATEGORY_META: Record<string, { name: string; icon: string; color: string }> = {
	energy: { name: 'Energy', icon: '⚡', color: '#FFCC44' },
	materials: { name: 'Materials', icon: '🧱', color: '#8899aa' },
	manufacturing: { name: 'Manufacturing', icon: '🏭', color: '#4488FF' },
	software: { name: 'Software', icon: '💻', color: '#9944FF' },
	aerospace: { name: 'Aerospace', icon: '🚀', color: '#FF4444' },
	infrastructure: { name: 'Infrastructure', icon: '🏗️', color: '#44DDFF' },
	biotech: { name: 'Biotech', icon: '🧬', color: '#44FF88' },
};
