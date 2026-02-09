/**
 * Energy.ts — Sustainable Energy division
 * Solar and battery storage — the FOUNDATION for everything else
 *
 * PROGRESSION DESIGN (10-min "flying" then slow):
 * - Tier 1: 0.6s cycle = feels snappy, ~1.7/s rate when tapped
 * - Each tier roughly doubles cycle time
 * - Costs increase gently at first (1.07-1.09), then steepen
 * - Revenue/cost ratio is GOOD early = feeling of rapid progress
 * - By tier 4-5, you need automation and the grind sets in
 *
 * MATH CHECK:
 * - Start $25, Tier 1 costs $5
 * - Buy 5 panels, each earns $1/0.6s = $1.67/s
 * - 5 panels = $8.33/s → reach $500 (Rockets) in ~1 minute
 * - This is the "flying" feeling
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const TESLA_ENERGY_TIERS: { name: string; description: string; tooltip: string; powerMW: number; config: ProductionConfig }[] = [
	{
		name: 'Solar Panels',
		description: 'Residential rooftop solar. Everyone starts somewhere.',
		tooltip: 'Rooftop solar is the foundation of sustainable energy. A typical home installation is 5-10 kW.',
		powerMW: 0.005,
		config: {
			baseCost: 5,
			baseRevenue: 1,
			cycleDuration: 0.6,      // Fast enough to feel responsive
			costMultiplier: 1.07,    // Gentle early game
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Home Battery',
		description: 'Store solar energy for nighttime use.',
		tooltip: 'Batteries solve solar\'s biggest problem — the sun doesn\'t shine at night.',
		powerMW: 0.01,
		config: {
			baseCost: 75,
			baseRevenue: 10,
			cycleDuration: 1.5,
			costMultiplier: 1.08,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Commercial Battery',
		description: 'Grid-scale storage. Utility-level power.',
		tooltip: 'Commercial batteries store megawatt-hours — enough to power thousands of homes.',
		powerMW: 0.5,
		config: {
			baseCost: 600,
			baseRevenue: 75,
			cycleDuration: 4,
			costMultiplier: 1.10,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Solar Roof',
		description: 'Integrated solar tiles. Invisible power generation.',
		tooltip: 'Solar tiles that look like regular roofing. More expensive but aesthetically invisible.',
		powerMW: 0.02,
		config: {
			baseCost: 5000,
			baseRevenue: 600,
			cycleDuration: 12,
			costMultiplier: 1.12,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Grid Battery Farm',
		description: 'Massive grid-connected storage. Stabilize entire cities.',
		tooltip: 'Grid-scale battery farms store gigawatt-hours. They can replace fossil fuel peaker plants.',
		powerMW: 5,
		config: {
			baseCost: 40000,
			baseRevenue: 5000,
			cycleDuration: 30,
			costMultiplier: 1.14,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Virtual Power Plant',
		description: 'Thousands of distributed batteries as one. The future.',
		tooltip: 'A network of thousands of home batteries coordinated by software to act as one giant power plant.',
		powerMW: 50,
		config: {
			baseCost: 350000,
			baseRevenue: 45000,
			cycleDuration: 60,
			costMultiplier: 1.16,
			revenueMultiplier: 1.0
		}
	}
];

export const TESLA_ENERGY_COLOR = '#FFCC44';
export const TESLA_ENERGY_ICON = '☀️';
export const TESLA_ENERGY_NAME = 'Energy';
