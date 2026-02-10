/**
 * Manufacturing.ts — Manufacturing division
 * From hand-built EVs to building everything needed to colonize Mars
 *
 * PROGRESSION: cars → mass production → vertical integration → orbital → colony kits
 *
 * - Unlocks at $2,500 (reachable ~9 min)
 * - Medium cycle times (manufacturing is factory work)
 * - This becomes the MONEY ENGINE at scale
 * - Highest revenue potential but steep late-game costs
 * - Power CONSUMER — factories need massive energy
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const TESLA_TIERS: { name: string; description: string; tooltip: string; flavor?: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Electric Cars',
		description: 'Build electric vehicles. Prove the future is electric.',
		tooltip: 'Start with sports cars, scale to sedans and trucks. EVs generate revenue and prove that sustainable transport works. Every car sold funds the mission.',
		flavor: '0-60 in 1.9 seconds. Speed limit still 65. Life isn\'t fair.',
		powerMW: -0.02,
		config: {
			baseCost: 15,
			baseRevenue: 3,
			cycleDuration: 6,
			costMultiplier: 1.08,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Gigafactory',
		description: 'Massive automated facility. The machine that builds the machine.',
		tooltip: 'A single building producing more battery capacity than the entire world did a decade ago. Vehicles, batteries, powerwalls — all under one roof. Vertical integration at unprecedented scale.',
		flavor: 'Visible from space. The parking lot alone has its own zip code.',
		powerMW: -0.1,
		config: {
			baseCost: 500,
			baseRevenue: 90,
			cycleDuration: 16,
			costMultiplier: 1.10,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Raw Material Processing',
		description: 'Mine lithium, refine metals, process raw materials in-house.',
		tooltip: 'Open-pit lithium mines, rare earth extraction, metal smelting. Stop buying from suppliers — pull it straight from the ground. Control the entire supply chain from ore to finished product.',
		flavor: 'Vertical integration means never having to say "supply chain issues."',
		powerMW: -0.5,
		config: {
			baseCost: 25000,
			baseRevenue: 5000,
			cycleDuration: 36,
			costMultiplier: 1.12,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Chip Fabrication',
		description: 'Build your own semiconductors. No more supply chain bottlenecks.',
		tooltip: 'Cleanrooms, EUV lithography, wafer fabs. Design and manufacture custom chips for your vehicles, robots, and AI systems. When you control the silicon, you control everything.',
		flavor: 'A single speck of dust ruins a $50M wafer. The cleanroom dress code is intense.',
		powerMW: -2,
		config: {
			baseCost: 5000000,
			baseRevenue: 1000000,
			cycleDuration: 80,
			costMultiplier: 1.13,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Orbital Shipyard',
		description: 'Assemble spacecraft and stations in orbit. Build what can\'t launch whole.',
		tooltip: 'Massive orbital assembly platforms. Space stations, fuel depots, interplanetary vehicles — components too large to launch in one piece. Microgravity enables alloys and optics impossible on Earth.',
		flavor: 'Welding in zero-G. OSHA has questions. So many questions.',
		powerMW: -10,
		config: {
			baseCost: 500000000,
			baseRevenue: 100000000,
			cycleDuration: 200,
			costMultiplier: 1.15,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Colony Kit Factory',
		description: 'Prebuilt factories and habitats, ready to deploy on Mars.',
		tooltip: 'Flat-pack factories, inflatable habitats, ISRU refineries, sealed rovers — everything a colony needs, prefabricated and packed into Starships. Land, unfold, power up, start building. Mars in a box.',
		flavor: 'IKEA for Mars, but the instructions are actually good. Mostly.',
		powerMW: -30,
		config: {
			baseCost: 50000000000,
			baseRevenue: 10000000000,
			cycleDuration: 400,
			costMultiplier: 1.18,
			revenueMultiplier: 1.0
		}
	}
];

export const TESLA_COLOR = '#44AAFF';
export const TESLA_ICON = '🏭';
export const TESLA_NAME = 'Manufacturing';
