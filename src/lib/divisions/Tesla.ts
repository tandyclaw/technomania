/**
 * Manufacturing.ts — Manufacturing division
 * From hand-built EVs to full Mars colony industrial base
 *
 * PROGRESSION: cars → mass production → vertical integration → Mars manufacturing
 *
 * - Unlocks at $2,500 (reachable ~5-7 min)
 * - Medium cycle times (manufacturing is factory work)
 * - This becomes the MONEY ENGINE at scale
 * - Highest revenue potential but steep late-game costs
 * - Power CONSUMER — factories need massive energy
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const TESLA_TIERS: { name: string; description: string; tooltip: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Electric Car Workshop',
		description: 'Hand-built electric sports cars. Prove EVs are the future.',
		tooltip: 'A small team hand-assembling electric sports cars. Low volume, high impact. Prove that EVs can be fast, desirable, and cool — not boring golf carts.',
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
		name: 'Vehicle Assembly Line',
		description: 'Mass-produce EVs. Sedans, SUVs, trucks at scale.',
		tooltip: 'Conveyor belts, robotic welders, stamping presses. Interchangeable parts and division of labor turn hand-built cars into thousands per week. Production Hell awaits.',
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
		description: 'Batteries, vehicles, solar panels — vertically integrated under one roof.',
		tooltip: 'A single building producing more battery capacity than the entire world did a decade ago. Raw lithium in one end, finished vehicles and powerwalls out the other. The machine that builds the machine.',
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
		name: 'Lithium Mines & Chip Fabs',
		description: 'Own your supply chain. Mine lithium, fabricate chips in-house.',
		tooltip: 'Vertical integration taken to the extreme. Open-pit lithium mines in Nevada, semiconductor fabs producing custom chips. No more begging suppliers — you ARE the supplier.',
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
		name: 'Martian Mining Complex',
		description: 'Extract iron, water ice, and rare minerals from Mars. The red planet is your supply chain.',
		tooltip: 'Deep drilling rigs, autonomous ore processors, water ice extractors. Mars has iron oxide everywhere, water ice at the poles, and rare earth elements underground. Mine it all — Earth resupply costs $1M/kg.',
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
