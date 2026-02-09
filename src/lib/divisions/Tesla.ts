/**
 * Manufacturing.ts — Manufacturing division
 * From garage workshop to full Mars colony industrial base
 *
 * PROGRESSION DESIGN:
 * - Unlocks at $2,500 (reachable ~5-7 min)
 * - Medium cycle times (manufacturing is factory work)
 * - This becomes the MONEY ENGINE at scale
 * - Highest revenue potential but steep late-game costs
 * - Power CONSUMER — factories need massive energy
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const TESLA_TIERS: { name: string; description: string; tooltip: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Small Workshop',
		description: 'Hand-built prototypes. Every empire starts in a garage.',
		tooltip: 'A single workbench, a soldering iron, and a dream. Prototype by hand, iterate fast, prove the concept works before scaling.',
		powerMW: -0.02,
		config: {
			baseCost: 15,
			baseRevenue: 3,
			cycleDuration: 3,
			costMultiplier: 1.08,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Assembly Line',
		description: 'Standardized production. Efficiency at scale.',
		tooltip: 'Interchangeable parts, division of labor, conveyor systems. What took a craftsman a day now takes minutes. Henry Ford figured this out in 1913.',
		powerMW: -0.1,
		config: {
			baseCost: 500,
			baseRevenue: 90,
			cycleDuration: 8,
			costMultiplier: 1.10,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Gigafactory',
		description: 'Massive automated facility. Batteries, vehicles, solar — all under one roof.',
		tooltip: 'A single building producing more battery capacity than the entire world did a decade ago. Raw materials in one end, finished products out the other.',
		powerMW: -0.5,
		config: {
			baseCost: 25000,
			baseRevenue: 5000,
			cycleDuration: 18,
			costMultiplier: 1.12,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Orbital Foundry',
		description: 'Zero-gravity manufacturing. Materials impossible to make on Earth.',
		tooltip: 'Microgravity enables perfect crystal growth, flawless fiber optics, and exotic alloys. No convection, no sedimentation — just pure physics.',
		powerMW: -2,
		config: {
			baseCost: 5000000,
			baseRevenue: 1000000,
			cycleDuration: 40,
			costMultiplier: 1.13,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Mars Fabricator',
		description: '3D-print structures from Martian regolith. Build with what\'s there.',
		tooltip: 'In-situ resource utilization (ISRU). Extract iron from regolith, sinter bricks, print habitats. Shipping from Earth costs $1M/kg — local manufacturing is survival.',
		powerMW: -10,
		config: {
			baseCost: 500000000,
			baseRevenue: 100000000,
			cycleDuration: 100,
			costMultiplier: 1.15,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Colony Forge',
		description: 'Full industrial base on Mars. Self-sustaining civilization.',
		tooltip: 'Steel mills, chip fabs, chemical plants — everything needed to sustain a million people without Earth resupply. This is the endgame of manufacturing.',
		powerMW: -30,
		config: {
			baseCost: 50000000000,
			baseRevenue: 10000000000,
			cycleDuration: 200,
			costMultiplier: 1.18,
			revenueMultiplier: 1.0
		}
	}
];

export const TESLA_COLOR = '#44AAFF';
export const TESLA_ICON = '🏭';
export const TESLA_NAME = 'Manufacturing';
