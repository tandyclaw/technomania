/**
 * Tesla.ts — Electric Vehicles division
 * Real Tesla vehicle progression for MVP: Roadster → Model Y
 * Each facility CONSUMES power (negative powerMW = consumer)
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const TESLA_TIERS: { name: string; description: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Roadster',
		description: 'The original. Prove EVs can be desirable. 2,500 built.',
		powerMW: -0.002, // 2 kW per unit
		config: { baseCost: 25, baseRevenue: 3, baseTime: 1500, costMultiplier: 1.15, revenueMultiplier: 1.1 }
	},
	{
		name: 'Model S',
		description: 'Luxury sedan that put Tesla on the map.',
		powerMW: -0.02, // 20 kW per unit
		config: { baseCost: 500, baseRevenue: 40, baseTime: 4000, costMultiplier: 1.14, revenueMultiplier: 1.12 }
	},
	{
		name: 'Model X',
		description: 'Crossover SUV with falcon wing doors.',
		powerMW: -0.2, // 200 kW per unit
		config: { baseCost: 8000, baseRevenue: 500, baseTime: 10000, costMultiplier: 1.13, revenueMultiplier: 1.15 }
	},
	{
		name: 'Model 3',
		description: 'The affordable EV for everyone. Production Hell awaits.',
		powerMW: -1, // 1 MW per unit
		config: { baseCost: 150000, baseRevenue: 8000, baseTime: 20000, costMultiplier: 1.12, revenueMultiplier: 1.18 }
	},
	{
		name: 'Model Y',
		description: 'The world\'s best-selling car. Gigafactory at full speed.',
		powerMW: -5, // 5 MW per unit
		config: { baseCost: 3000000, baseRevenue: 120000, baseTime: 25000, costMultiplier: 1.11, revenueMultiplier: 1.2 }
	}
];

export const TESLA_COLOR = '#4488FF';
export const TESLA_ICON = '🔋';
export const TESLA_NAME = 'Tesla';
