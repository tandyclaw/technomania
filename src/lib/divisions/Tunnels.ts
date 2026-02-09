/**
 * Tunnels.ts — Tunnel Infrastructure division
 * From test bores to hyperloop — slow cycles, massive revenue
 *
 * PROGRESSION DESIGN (balanced Feb 2026):
 * - Unlocks at $25,000 (~12 min) — keeps mid-game momentum
 * - Slowest cycles in the game (infrastructure projects take time)
 * - Highest per-cycle revenue to compensate
 * - Heavy power consumer (boring machines eat electricity)
 * - Late-game money engine for patient players
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const TUNNELS_TIERS: { name: string; description: string; tooltip: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Test Bore',
		description: 'Proof of concept. Dig a short tunnel under a parking lot.',
		tooltip: 'Before you bore under cities, you need to prove your machine works. Start small.',
		powerMW: -0.1,
		config: {
			baseCost: 25000,
			baseRevenue: 4500,
			cycleDuration: 5,
			costMultiplier: 1.09,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'City Tunnel',
		description: 'Urban transit tunnel. Navigate utilities, sewers, and politics.',
		tooltip: 'Boring under a city means dodging water mains, subway lines, and building foundations.',
		powerMW: -0.8,
		config: {
			baseCost: 250000,
			baseRevenue: 40000,
			cycleDuration: 12,
			costMultiplier: 1.11,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Transit Loop',
		description: 'Underground autonomous vehicle loop connecting key destinations.',
		tooltip: 'A network of tunnels with electric sleds moving people at 150mph beneath traffic.',
		powerMW: -3,
		config: {
			baseCost: 2500000,
			baseRevenue: 375000,
			cycleDuration: 30,
			costMultiplier: 1.12,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Freight Network',
		description: 'Underground freight corridors replacing surface trucking.',
		tooltip: 'Moving goods underground eliminates traffic, emissions, and weather delays.',
		powerMW: -15,
		config: {
			baseCost: 25000000,
			baseRevenue: 3750000,
			cycleDuration: 70,
			costMultiplier: 1.14,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Continental Link',
		description: 'Cross-country tunnel network. Coast to coast underground.',
		tooltip: 'Thousands of miles of tunnel connecting major cities. The infrastructure project of the century.',
		powerMW: -60,
		config: {
			baseCost: 250000000,
			baseRevenue: 37500000,
			cycleDuration: 160,
			costMultiplier: 1.16,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Hyperloop',
		description: 'Near-vacuum tube transport. 700mph in a tunnel.',
		tooltip: 'Partial vacuum + magnetic levitation + tunnel = faster than flying, cheaper than rockets.',
		powerMW: -250,
		config: {
			baseCost: 2500000000,
			baseRevenue: 500000000,
			cycleDuration: 360,
			costMultiplier: 1.20,
			revenueMultiplier: 1.0
		}
	}
];

export const TUNNELS_COLOR = '#CC7744';
export const TUNNELS_ICON = '🚇';
export const TUNNELS_NAME = 'Tunnels';
