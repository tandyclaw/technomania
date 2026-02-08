/**
 * TeslaEnergy.ts — Energy & Solar division
 * Real Tesla Energy / SolarCity product progression
 * THE FOUNDATION: powers everything else
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const TESLA_ENERGY_TIERS: { name: string; description: string; powerMW: number; config: ProductionConfig }[] = [
	{
		name: 'Solar Panels',
		description: 'Residential rooftop solar. Everyone starts somewhere.',
		powerMW: 0.005, // 5 kW
		config: { baseCost: 15, baseRevenue: 2, baseTime: 1200, costMultiplier: 1.15, revenueMultiplier: 1.1 }
	},
	{
		name: 'Powerwall',
		description: 'Home battery. Store solar energy for nighttime use.',
		powerMW: 0.01, // 10 kW storage
		config: { baseCost: 200, baseRevenue: 20, baseTime: 3500, costMultiplier: 1.14, revenueMultiplier: 1.12 }
	},
	{
		name: 'SolarCity Commercial',
		description: 'Business-scale solar installations across the country.',
		powerMW: 0.5,
		config: { baseCost: 3000, baseRevenue: 250, baseTime: 8000, costMultiplier: 1.13, revenueMultiplier: 1.15 }
	},
	{
		name: 'Solar Roof',
		description: 'Integrated solar shingles. Sleek, invisible power.',
		powerMW: 0.02,
		config: { baseCost: 50000, baseRevenue: 3000, baseTime: 12000, costMultiplier: 1.12, revenueMultiplier: 1.18 }
	},
	{
		name: 'Gigafactory',
		description: 'Massive battery cell factory. LFP cells at scale.',
		powerMW: 5,
		config: { baseCost: 1000000, baseRevenue: 50000, baseTime: 25000, costMultiplier: 1.11, revenueMultiplier: 1.2 }
	},
	{
		name: 'Megapack',
		description: 'Grid-scale battery storage. Power the world.',
		powerMW: 50,
		config: { baseCost: 20000000, baseRevenue: 800000, baseTime: 45000, costMultiplier: 1.10, revenueMultiplier: 1.25 }
	}
];

export const TESLA_ENERGY_COLOR = '#FFCC44';
export const TESLA_ENERGY_ICON = '☀️';
export const TESLA_ENERGY_NAME = 'Tesla Energy';
