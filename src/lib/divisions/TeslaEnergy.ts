/**
 * Energy.ts — Sustainable Energy division
 * Solar and battery storage progression — the foundation for everything
 *
 * cycleDuration = how long one production cycle takes (in seconds)
 * Revenue is earned ONLY when the cycle completes (Adventure Capitalist style)
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const TESLA_ENERGY_TIERS: { name: string; description: string; tooltip: string; powerMW: number; config: ProductionConfig }[] = [
	{
		name: 'Solar Panels',
		description: 'Residential rooftop solar. Everyone starts somewhere.',
		tooltip: 'Rooftop solar is the foundation of sustainable energy. A typical home installation is 5-10 kW. Solar costs have dropped 90% in 15 years, making it cheaper than grid power in most places.',
		powerMW: 0.005,
		config: { baseCost: 4, baseRevenue: 1, cycleDuration: 0.6, costMultiplier: 1.07, revenueMultiplier: 1.0 }
	},
	{
		name: 'Home Battery',
		description: 'Store solar energy for nighttime use.',
		tooltip: 'Batteries solve solar\'s biggest problem — the sun doesn\'t shine at night. A home battery stores 13-15 kWh, enough to power a house through the evening. When the grid fails, you stay on.',
		powerMW: 0.01,
		config: { baseCost: 60, baseRevenue: 8, cycleDuration: 3, costMultiplier: 1.15, revenueMultiplier: 1.0 }
	},
	{
		name: 'Commercial Battery',
		description: 'Grid-scale storage. Utility-level power.',
		tooltip: 'Commercial batteries store megawatt-hours — enough to power thousands of homes. They stabilize the grid, store renewable energy, and respond to demand spikes in milliseconds instead of minutes.',
		powerMW: 0.5,
		config: { baseCost: 720, baseRevenue: 90, cycleDuration: 6, costMultiplier: 1.14, revenueMultiplier: 1.0 }
	},
	{
		name: 'Solar Roof',
		description: 'Integrated solar tiles. Invisible power generation.',
		tooltip: 'Solar tiles that look like regular roofing. More expensive than panels but aesthetically invisible. Uses tempered glass rated for hurricane winds and hail. Your roof generates power and looks beautiful.',
		powerMW: 0.02,
		config: { baseCost: 8640, baseRevenue: 1080, cycleDuration: 12, costMultiplier: 1.13, revenueMultiplier: 1.0 }
	},
	{
		name: 'Grid Battery Farm',
		description: 'Massive grid-connected storage. Stabilize entire cities.',
		tooltip: 'Grid-scale battery farms store gigawatt-hours. They can replace fossil fuel peaker plants, respond to fluctuations instantly, and make 100% renewable grids possible. These pay for themselves in years.',
		powerMW: 5,
		config: { baseCost: 103680, baseRevenue: 12960, cycleDuration: 24, costMultiplier: 1.12, revenueMultiplier: 1.0 }
	},
	{
		name: 'Virtual Power Plant',
		description: 'Thousands of distributed batteries as one. The future.',
		tooltip: 'A network of thousands of home batteries coordinated by software to act as one giant power plant. No central infrastructure needed. Could make traditional power plants obsolete.',
		powerMW: 50,
		config: { baseCost: 1244160, baseRevenue: 155520, cycleDuration: 48, costMultiplier: 1.10, revenueMultiplier: 1.0 }
	}
];

export const TESLA_ENERGY_COLOR = '#FFCC44';
export const TESLA_ENERGY_ICON = '☀️';
export const TESLA_ENERGY_NAME = 'Energy';
