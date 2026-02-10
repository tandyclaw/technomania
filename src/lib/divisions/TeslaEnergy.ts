/**
 * Energy.ts — Energy division
 * Power is the foundation for everything. No energy, no civilization.
 *
 * PROGRESSION: nuclear → solar → batteries → rocket fuel → space solar → wireless beaming
 * Each tier builds toward powering a Mars colony from Earth and beyond.
 *
 * MATH CHECK (verified Feb 2026 simulation):
 * - Start $25, buy 4 reactors immediately ($5 * 1.07^0..3 ≈ $22)
 * - Each earns $1/1.2s = $0.83/s → 4 reactors = $3.33/s
 * - Reach $500 (Rockets) at ~3 min, $2500 (Mfg) at ~9 min
 * - Slower pacing (~50% of original) to match AdCap feel
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const TESLA_ENERGY_TIERS: { name: string; description: string; tooltip: string; flavor?: string; powerMW: number; config: ProductionConfig }[] = [
	{
		name: 'Nuclear Reactor',
		description: 'Dense, reliable power. The backbone of your grid.',
		tooltip: 'Small modular reactors producing clean baseload power 24/7. No sun needed, no wind needed. Uranium fission generates massive energy density — one fuel pellet equals a ton of coal.',
		flavor: 'Clean energy, despite what the NIMBYs say. Not in my backyard? Fine, we\'ll put it in yours.',
		powerMW: 0.5,
		config: {
			baseCost: 5,
			baseRevenue: 1,
			cycleDuration: 1.2,
			costMultiplier: 1.07,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Solar Panel Farm',
		description: 'Harvest the sun at industrial scale. Fields of photovoltaics.',
		tooltip: 'Thousands of solar panels covering desert land. Free fuel forever, but only when the sun shines. Pairs perfectly with battery storage for round-the-clock power.',
		flavor: 'Free energy raining from the sky. Humanity ignored it for 4 billion years.',
		powerMW: 0.1,
		config: {
			baseCost: 75,
			baseRevenue: 10,
			cycleDuration: 3,
			costMultiplier: 1.08,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Grid Battery',
		description: 'Grid-scale storage. Store gigawatt-hours for when you need them.',
		tooltip: 'Massive lithium-ion battery installations that store excess energy and discharge on demand. Replace fossil fuel peaker plants. Stabilize entire cities during peak demand.',
		flavor: 'The world\'s most expensive battery backup. Worth it when the grid goes dark.',
		powerMW: 1,
		config: {
			baseCost: 600,
			baseRevenue: 75,
			cycleDuration: 8,
			costMultiplier: 1.10,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Rocket Fuel Refinery',
		description: 'Produce methane and LOX. Fuel your rockets from your own grid.',
		tooltip: 'Sabatier reactors converting CO2 and hydrogen into liquid methane. Electrolysis plants splitting water into liquid oxygen. Your energy grid now fuels your space program directly.',
		flavor: 'Making rocket fuel from air and water. Chemistry is basically magic.',
		powerMW: -2,
		config: {
			baseCost: 5000,
			baseRevenue: 600,
			cycleDuration: 24,
			costMultiplier: 1.12,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Space Solar Array',
		description: 'Orbital solar collectors. No clouds, no night, no limits.',
		tooltip: 'Massive photovoltaic arrays in geostationary orbit collecting sunlight 24/7 with no atmosphere in the way. 8x more efficient than ground solar. The ultimate clean energy source.',
		flavor: 'Finally, solar panels that never complain about cloudy days.',
		powerMW: 50,
		config: {
			baseCost: 40000,
			baseRevenue: 5000,
			cycleDuration: 60,
			costMultiplier: 1.14,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Wireless Energy Beaming',
		description: 'Beam power from orbit to anywhere on Earth — or to Mars.',
		tooltip: 'Microwave or laser power transmission from space solar arrays to ground receivers. Power any location on Earth without wires. Eventually beam energy across interplanetary distances to fuel your Mars colony.',
		flavor: 'A century-old dream, finally realized. Better late than never.',
		powerMW: 500,
		config: {
			baseCost: 350000,
			baseRevenue: 45000,
			cycleDuration: 120,
			costMultiplier: 1.16,
			revenueMultiplier: 1.0
		}
	}
];

export const TESLA_ENERGY_COLOR = '#FFCC44';
export const TESLA_ENERGY_ICON = '⚡';
export const TESLA_ENERGY_NAME = 'Energy';
