/**
 * TeslaEnergy.ts — Energy & Solar division
 * Real Tesla Energy / SolarCity product progression
 * THE FOUNDATION: powers everything else
 *
 * cycleDuration = how long one production cycle takes (in seconds)
 * Revenue is earned ONLY when the cycle completes (Adventure Capitalist style)
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const TESLA_ENERGY_TIERS: { name: string; description: string; tooltip: string; powerMW: number; config: ProductionConfig }[] = [
	{
		name: 'Solar Panels',
		description: 'Residential rooftop solar. Everyone starts somewhere.',
		tooltip: 'Residential Solar: Tesla acquired SolarCity in 2016 for $2.6B. A typical home installation is 5-10 kW. Solar panel costs have dropped 90% since 2010, making rooftop solar the fastest-growing energy source.',
		powerMW: 0.005, // 5 kW
		config: { baseCost: 15, baseRevenue: 2, cycleDuration: 0.5, costMultiplier: 1.15, revenueMultiplier: 1.1 }
	},
	{
		name: 'Powerwall',
		description: 'Home battery. Store solar energy for nighttime use.',
		tooltip: 'Powerwall: Tesla\'s home battery stores 13.5 kWh. During Texas winter storm Uri (2021), Powerwall owners kept their lights on while the grid collapsed. Over 500,000 deployed worldwide.',
		powerMW: 0.01, // 10 kW storage
		config: { baseCost: 200, baseRevenue: 20, cycleDuration: 3, costMultiplier: 1.14, revenueMultiplier: 1.12 }
	},
	{
		name: 'Megapack',
		description: 'Grid-scale battery storage. Utility-scale power.',
		tooltip: 'Megapack: Each unit stores 3.9 MWh — enough to power ~3,600 homes for one hour. The Moss Landing project in California holds 400 Megapacks (1.6 GWh), one of the world\'s largest battery installations.',
		powerMW: 0.5,
		config: { baseCost: 3000, baseRevenue: 250, cycleDuration: 6, costMultiplier: 1.13, revenueMultiplier: 1.15 }
	},
	{
		name: 'Solar Roof',
		description: 'Integrated solar shingles. Sleek, invisible power.',
		tooltip: 'Solar Roof: Glass tiles with embedded solar cells that look like regular roofing. Uses tempered glass rated for 110 mph winds and Class 4 hail. More expensive than panels but aesthetically invisible.',
		powerMW: 0.02,
		config: { baseCost: 50000, baseRevenue: 3000, cycleDuration: 12, costMultiplier: 1.12, revenueMultiplier: 1.18 }
	},
	{
		name: 'Grid Battery',
		description: 'Massive grid-connected battery farms. Stabilize entire cities.',
		tooltip: 'Grid-Scale Batteries: Tesla\'s 100 MW battery in South Australia (the "Big Battery") paid for itself in 2 years by providing grid stability. It responds to power fluctuations in milliseconds vs minutes for gas plants.',
		powerMW: 5,
		config: { baseCost: 1000000, baseRevenue: 50000, cycleDuration: 24, costMultiplier: 1.11, revenueMultiplier: 1.2 }
	},
	{
		name: 'Virtual Power Plant',
		description: 'Network of distributed batteries acting as one. The future of energy.',
		tooltip: 'Virtual Power Plant: A network of thousands of Powerwalls coordinated by software to act as one giant battery. South Australia\'s VPP connects 50,000 homes. Could make traditional peaker plants obsolete.',
		powerMW: 50,
		config: { baseCost: 20000000, baseRevenue: 800000, cycleDuration: 48, costMultiplier: 1.10, revenueMultiplier: 1.25 }
	}
];

export const TESLA_ENERGY_COLOR = '#FFCC44';
export const TESLA_ENERGY_ICON = '☀️';
export const TESLA_ENERGY_NAME = 'Tesla Energy';
