/**
 * SpaceX.ts — Rockets & Space division
 * Real SpaceX vehicle progression for MVP: Falcon 1 → Mars Lander
 * Each facility CONSUMES power (negative powerMW = consumer)
 *
 * cycleDuration = how long one production cycle takes (in seconds)
 * Revenue is earned ONLY when the cycle completes (Adventure Capitalist style)
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const SPACEX_TIERS: { name: string; description: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Falcon 1',
		description: 'Your first orbital rocket. Three failures before success.',
		powerMW: -0.001, // 1 kW per unit
		config: { baseCost: 10, baseRevenue: 1, cycleDuration: 1, costMultiplier: 1.15, revenueMultiplier: 1.1 }
	},
	{
		name: 'Falcon 9',
		description: 'The workhorse. Reusable first stage changes everything.',
		powerMW: -0.01, // 10 kW per unit
		config: { baseCost: 100, baseRevenue: 12, cycleDuration: 3, costMultiplier: 1.14, revenueMultiplier: 1.12 }
	},
	{
		name: 'Dragon',
		description: 'First commercial spacecraft to dock with the ISS.',
		powerMW: -0.1, // 100 kW per unit
		config: { baseCost: 1500, baseRevenue: 150, cycleDuration: 6, costMultiplier: 1.13, revenueMultiplier: 1.15 }
	},
	{
		name: 'Falcon Heavy',
		description: 'Triple-core heavy lifter. Launched a Tesla Roadster into space.',
		powerMW: -0.5, // 500 kW per unit
		config: { baseCost: 25000, baseRevenue: 2000, cycleDuration: 12, costMultiplier: 1.12, revenueMultiplier: 1.18 }
	},
	{
		name: 'Starship',
		description: 'Largest rocket ever built. Fully reusable. The Mars vehicle.',
		powerMW: -2, // 2 MW per unit
		config: { baseCost: 500000, baseRevenue: 30000, cycleDuration: 36, costMultiplier: 1.11, revenueMultiplier: 1.2 }
	},
	{
		name: 'Mars Lander',
		description: 'Starship configured for Mars landing. The holy grail.',
		powerMW: -10, // 10 MW per unit
		config: { baseCost: 10000000, baseRevenue: 500000, cycleDuration: 96, costMultiplier: 1.10, revenueMultiplier: 1.25 }
	}
];

export const SPACEX_COLOR = '#FF4444';
export const SPACEX_ICON = '🚀';
export const SPACEX_NAME = 'SpaceX';
