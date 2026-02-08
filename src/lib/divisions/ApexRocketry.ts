/**
 * ApexRocketry.ts — Rockets & Space division
 * Tiers 1-6 for MVP: Hobby Rocket → Heavy Lifter
 * Each facility CONSUMES power (negative powerMW = consumer)
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const APEX_TIERS: { name: string; description: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Hobby Rocket',
		description: 'Model rocketry - small but it flies!',
		powerMW: -0.001, // 1 kW per unit
		config: { baseCost: 10, baseRevenue: 1, baseTime: 1000, costMultiplier: 1.15, revenueMultiplier: 1.1 }
	},
	{
		name: 'Sounding Rocket',
		description: 'Suborbital test vehicles for science payloads',
		powerMW: -0.01, // 10 kW per unit
		config: { baseCost: 100, baseRevenue: 12, baseTime: 3000, costMultiplier: 1.14, revenueMultiplier: 1.12 }
	},
	{
		name: 'Small-Sat Launcher',
		description: 'Electron-class rocket for small satellite deployment',
		powerMW: -0.1, // 100 kW per unit
		config: { baseCost: 1500, baseRevenue: 150, baseTime: 8000, costMultiplier: 1.13, revenueMultiplier: 1.15 }
	},
	{
		name: 'Medium Lifter',
		description: 'Falcon 9-class workhorse rocket',
		powerMW: -0.5, // 500 kW per unit
		config: { baseCost: 25000, baseRevenue: 2000, baseTime: 15000, costMultiplier: 1.12, revenueMultiplier: 1.18 }
	},
	{
		name: 'Reusable Booster',
		description: 'Land the booster, reuse it, save millions',
		powerMW: -2, // 2 MW per unit
		config: { baseCost: 500000, baseRevenue: 30000, baseTime: 30000, costMultiplier: 1.11, revenueMultiplier: 1.2 }
	},
	{
		name: 'Heavy Lifter',
		description: 'Triple-core heavy launch vehicle',
		powerMW: -10, // 10 MW per unit
		config: { baseCost: 10000000, baseRevenue: 500000, baseTime: 60000, costMultiplier: 1.10, revenueMultiplier: 1.25 }
	}
];

export const APEX_COLOR = '#FF4444';
export const APEX_ICON = '🚀';
export const APEX_NAME = 'Apex Rocketry';
