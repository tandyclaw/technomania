/**
 * VoltMotors.ts — Electric Vehicles division
 * Tiers 1-5 for MVP: Garage EV → Mass Market SUV
 * Each facility CONSUMES power (negative powerMW = consumer)
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const VOLT_TIERS: { name: string; description: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Garage EV',
		description: 'DIY electric conversion in your garage',
		powerMW: -0.002, // 2 kW per unit
		config: { baseCost: 25, baseRevenue: 3, baseTime: 1500, costMultiplier: 1.15, revenueMultiplier: 1.1 }
	},
	{
		name: 'Sports EV',
		description: 'A sleek electric sports car - limited production',
		powerMW: -0.02, // 20 kW per unit
		config: { baseCost: 500, baseRevenue: 40, baseTime: 4000, costMultiplier: 1.14, revenueMultiplier: 1.12 }
	},
	{
		name: 'Luxury Sedan',
		description: 'Premium electric sedan for the discerning buyer',
		powerMW: -0.2, // 200 kW per unit
		config: { baseCost: 8000, baseRevenue: 500, baseTime: 10000, costMultiplier: 1.13, revenueMultiplier: 1.15 }
	},
	{
		name: 'Mass Market Sedan',
		description: 'The affordable EV for everyone. Production hell awaits.',
		powerMW: -1, // 1 MW per unit
		config: { baseCost: 150000, baseRevenue: 8000, baseTime: 20000, costMultiplier: 1.12, revenueMultiplier: 1.18 }
	},
	{
		name: 'Mass Market SUV',
		description: 'The people want SUVs. Give them electric ones.',
		powerMW: -5, // 5 MW per unit
		config: { baseCost: 3000000, baseRevenue: 120000, baseTime: 25000, costMultiplier: 1.11, revenueMultiplier: 1.2 }
	}
];

export const VOLT_COLOR = '#4488FF';
export const VOLT_ICON = '🔋';
export const VOLT_NAME = 'Volt Motors';
