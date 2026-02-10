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
		name: 'Mars-Grade Solar Cells',
		description: 'High-efficiency photovoltaics that power Earth operations and future Mars habitats. Energy production speed +15%.',
		cost: 10,
		timeMs: 15_000,
		category: 'energy',
		prerequisites: [],
		effects: [
			{
				type: 'production_speed',
				target: 'teslaenergy',
				value: 0.15,
				description: '+15% Energy production speed',
			},
		],
	},
	{
		id: 'composite_materials',
		name: 'Lightweight Composites',
		description: 'Lighter spacecraft means more cargo capacity for Mars missions. Rockets production speed +15%.',
		cost: 10,
		timeMs: 15_000,
		category: 'materials',
		prerequisites: [],
		effects: [
			{
				type: 'production_speed',
				target: 'spacex',
				value: 0.15,
				description: '+15% Rockets production speed',
			},
		],
	},
	{
		id: 'production_optimization',
		name: 'Lean Manufacturing',
		description: 'Streamlined production lines to scale Mars equipment output. Manufacturing revenue +15%.',
		cost: 10,
		timeMs: 15_000,
		category: 'manufacturing',
		prerequisites: [],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'tesla',
				value: 0.15,
				description: '+15% Manufacturing revenue',
			},
		],
	},

	// ──────────── TIER 2: Division specialists ────────────

	{
		id: 'battery_chemistry_v2',
		name: 'Advanced Battery Chemistry',
		description: 'Long-duration energy storage critical for Mars surface operations. Energy revenue +20%.',
		cost: 25,
		timeMs: 30_000,
		category: 'energy',
		prerequisites: ['basic_photovoltaics'],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'teslaenergy',
				value: 0.20,
				description: '+20% Energy revenue',
			},
		],
	},
	{
		id: 'rapid_reusability',
		name: 'Rapid Launch Reusability',
		description: 'Frequent Mars transit windows require rapid launch turnaround. Rockets cost reduction -10%.',
		cost: 25,
		timeMs: 30_000,
		category: 'aerospace',
		prerequisites: ['composite_materials'],
		effects: [
			{
				type: 'cost_reduction',
				target: 'spacex',
				value: 0.10,
				description: '-10% Rockets tier costs',
			},
		],
	},
	{
		id: 'gigacasting',
		name: 'Mega Casting',
		description: 'Single-piece structural casting accelerates Mars equipment production. Manufacturing production speed +20%.',
		cost: 25,
		timeMs: 30_000,
		category: 'manufacturing',
		prerequisites: ['production_optimization'],
		effects: [
			{
				type: 'production_speed',
				target: 'tesla',
				value: 0.20,
				description: '+20% Manufacturing production speed',
			},
		],
	},
	{
		id: 'software_autopilot',
		name: 'Autonomous Quality Control',
		description: 'AI-driven inspection ensures Mars-bound hardware meets zero-defect standards. Manufacturing revenue +20%.',
		cost: 30,
		timeMs: 35_000,
		category: 'software',
		prerequisites: ['production_optimization'],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'tesla',
				value: 0.20,
				description: '+20% Manufacturing revenue',
			},
		],
	},

	// ──────────── TIER 3: Cross-division unlocks ────────────

	{
		id: 'grid_scale_storage',
		name: 'Mission-Scale Energy Storage',
		description: 'Massive battery arrays for the long journey and Mars surface deployment. Energy production speed +25% and revenue +10%.',
		cost: 50,
		timeMs: 45_000,
		category: 'energy',
		prerequisites: ['battery_chemistry_v2'],
		effects: [
			{
				type: 'production_speed',
				target: 'teslaenergy',
				value: 0.25,
				description: '+25% Energy production speed',
			},
			{
				type: 'revenue_multiplier',
				target: 'teslaenergy',
				value: 0.10,
				description: '+10% Energy revenue',
			},
		],
	},
	{
		id: 'starship_heat_shield',
		name: 'Mars Entry Heat Shield',
		description: 'Reusable thermal protection for Mars atmospheric entry. Rockets production speed +25%.',
		cost: 50,
		timeMs: 45_000,
		category: 'aerospace',
		prerequisites: ['rapid_reusability'],
		effects: [
			{
				type: 'production_speed',
				target: 'spacex',
				value: 0.25,
				description: '+25% Rockets production speed',
			},
		],
	},
	{
		id: 'fsd_v12',
		name: 'Autonomous Production AI',
		description: 'Fully autonomous factory lines building Mars-bound hardware around the clock. Manufacturing revenue +30%.',
		cost: 60,
		timeMs: 50_000,
		category: 'software',
		prerequisites: ['software_autopilot', 'gigacasting'],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'tesla',
				value: 0.30,
				description: '+30% Manufacturing revenue',
			},
		],
	},
	{
		id: 'orbital_refueling',
		name: 'Orbital Fuel Depot',
		description: 'In-space propellant transfer enables fully loaded Mars transit vehicles. Rockets revenue +25%.',
		cost: 60,
		timeMs: 50_000,
		category: 'aerospace',
		prerequisites: ['starship_heat_shield'],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'spacex',
				value: 0.25,
				description: '+25% Rockets revenue',
			},
		],
	},

	// ──────────── TIER 4: Synergies & cross-division ────────────

	{
		id: 'shared_battery_platform',
		name: 'Unified Power Platform',
		description: 'Standardized energy cells across all Mars-bound systems reduce costs and complexity. All divisions revenue +10%.',
		cost: 80,
		timeMs: 60_000,
		category: 'manufacturing',
		prerequisites: ['battery_chemistry_v2', 'gigacasting'],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'teslaenergy',
				value: 0.10,
				description: '+10% Energy revenue',
			},
			{
				type: 'revenue_multiplier',
				target: 'tesla',
				value: 0.10,
				description: '+10% Manufacturing revenue',
			},
			{
				type: 'revenue_multiplier',
				target: 'spacex',
				value: 0.10,
				description: '+10% Rockets revenue',
			},
		],
	},
	{
		id: 'ai_manufacturing',
		name: 'AI-Driven Assembly',
		description: 'Machine-learning-optimized factories mass-producing Mars colony components. All divisions production speed +15%.',
		cost: 90,
		timeMs: 60_000,
		category: 'software',
		prerequisites: ['fsd_v12', 'shared_battery_platform'],
		effects: [
			{
				type: 'production_speed',
				target: 'teslaenergy',
				value: 0.15,
				description: '+15% Energy production speed',
			},
			{
				type: 'production_speed',
				target: 'tesla',
				value: 0.15,
				description: '+15% Manufacturing production speed',
			},
			{
				type: 'production_speed',
				target: 'spacex',
				value: 0.15,
				description: '+15% Rockets production speed',
			},
		],
	},
	{
		id: 'solar_launch_grid',
		name: 'Solar Launch Complex',
		description: 'Renewable-powered launch infrastructure for sustained Mars mission cadence. Power output +30%.',
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
		name: 'Robotic Workforce',
		description: 'Humanoid robots for hazardous Mars construction tasks no human should do. All divisions cost reduction -15%.',
		cost: 120,
		timeMs: 75_000,
		category: 'manufacturing',
		prerequisites: ['ai_manufacturing'],
		effects: [
			{
				type: 'cost_reduction',
				target: 'teslaenergy',
				value: 0.15,
				description: '-15% Energy tier costs',
			},
			{
				type: 'cost_reduction',
				target: 'tesla',
				value: 0.15,
				description: '-15% Manufacturing tier costs',
			},
			{
				type: 'cost_reduction',
				target: 'spacex',
				value: 0.15,
				description: '-15% Rockets tier costs',
			},
		],
	},
	{
		id: 'mars_colony_alpha',
		name: 'Mars Habitat Blueprint',
		description: 'Complete architectural design for a self-sustaining Mars habitat. Rockets revenue +50%.',
		cost: 150,
		timeMs: 90_000,
		category: 'aerospace',
		prerequisites: ['orbital_refueling', 'solar_launch_grid'],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'spacex',
				value: 0.50,
				description: '+50% Rockets revenue',
			},
		],
	},
	{
		id: 'neural_link_v2',
		name: 'Neural Interface',
		description: 'Brain-computer links for remote control of Mars robots across the 20-minute signal delay. All revenue +20%.',
		cost: 140,
		timeMs: 80_000,
		category: 'biotech',
		prerequisites: ['fsd_v12', 'optimus_workforce'],
		effects: [
			{
				type: 'revenue_multiplier',
				target: 'teslaenergy',
				value: 0.20,
				description: '+20% Energy revenue',
			},
			{
				type: 'revenue_multiplier',
				target: 'tesla',
				value: 0.20,
				description: '+20% Manufacturing revenue',
			},
			{
				type: 'revenue_multiplier',
				target: 'spacex',
				value: 0.20,
				description: '+20% Rockets revenue',
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
