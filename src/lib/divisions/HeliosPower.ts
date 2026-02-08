/**
 * HeliosPower.ts — Energy & Solar division
 * Tiers 1-6 for MVP: Rooftop Solar → Grid Storage Unit
 * THE FOUNDATION: powers everything else
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const HELIOS_TIERS: { name: string; description: string; powerMW: number; config: ProductionConfig }[] = [
	{
		name: 'Rooftop Solar',
		description: 'Residential solar panels - everyone starts somewhere',
		powerMW: 0.005, // 5 kW
		config: { baseCost: 15, baseRevenue: 2, baseTime: 1200, costMultiplier: 1.15, revenueMultiplier: 1.1 }
	},
	{
		name: 'Home Battery',
		description: 'Store solar energy for nighttime use',
		powerMW: 0.01, // 10 kW storage
		config: { baseCost: 200, baseRevenue: 20, baseTime: 3500, costMultiplier: 1.14, revenueMultiplier: 1.12 }
	},
	{
		name: 'Commercial Solar',
		description: 'Business-scale solar installations',
		powerMW: 0.5,
		config: { baseCost: 3000, baseRevenue: 250, baseTime: 8000, costMultiplier: 1.13, revenueMultiplier: 1.15 }
	},
	{
		name: 'Solar Shingle',
		description: 'Integrated solar roof tiles - sleek and efficient',
		powerMW: 0.02,
		config: { baseCost: 50000, baseRevenue: 3000, baseTime: 12000, costMultiplier: 1.12, revenueMultiplier: 1.18 }
	},
	{
		name: 'Battery Factory',
		description: 'Megafactory for LFP battery cell production',
		powerMW: 5,
		config: { baseCost: 1000000, baseRevenue: 50000, baseTime: 25000, costMultiplier: 1.11, revenueMultiplier: 1.2 }
	},
	{
		name: 'Grid Storage Unit',
		description: 'Megapack-scale grid battery storage',
		powerMW: 50,
		config: { baseCost: 20000000, baseRevenue: 800000, baseTime: 45000, costMultiplier: 1.10, revenueMultiplier: 1.25 }
	}
];

export const HELIOS_COLOR = '#FFCC44';
export const HELIOS_ICON = '☀️';
export const HELIOS_NAME = 'Helios Power';
