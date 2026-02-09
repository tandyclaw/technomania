/**
 * EVs.ts — Electric Vehicles division
 * Progression from sports car proof-of-concept to mass market dominance
 * Each facility CONSUMES power (negative powerMW = consumer)
 *
 * cycleDuration = how long one production cycle takes (in seconds)
 * Revenue is earned ONLY when the cycle completes (Adventure Capitalist style)
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const TESLA_TIERS: { name: string; description: string; tooltip: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Electric Sports Car',
		description: 'Prove EVs can be desirable. Change perception first.',
		tooltip: 'The first step is proving electric cars aren\'t boring golf carts. A high-performance sports car shows the world that EVs can be fast, sexy, and desirable. Build the brand before you scale.',
		powerMW: -0.002,
		config: { baseCost: 4, baseRevenue: 1, cycleDuration: 0.6, costMultiplier: 1.07, revenueMultiplier: 1.0 }
	},
	{
		name: 'Luxury Sedan',
		description: 'Premium EV with serious range. Build credibility.',
		tooltip: 'A luxury sedan with 300+ mile range proves EVs are practical, not just toys. Competing with Mercedes and BMW builds legitimacy. The profits from premium vehicles fund your mass-market play.',
		powerMW: -0.02,
		config: { baseCost: 60, baseRevenue: 8, cycleDuration: 4, costMultiplier: 1.15, revenueMultiplier: 1.0 }
	},
	{
		name: 'Electric SUV',
		description: 'Family-sized EV. Harder to build than sedans.',
		tooltip: 'SUVs are where the real money is — families need space. But larger vehicles mean bigger batteries, more weight, and new engineering challenges. Get this right and you unlock the mainstream.',
		powerMW: -0.2,
		config: { baseCost: 720, baseRevenue: 90, cycleDuration: 8, costMultiplier: 1.14, revenueMultiplier: 1.0 }
	},
	{
		name: 'Mass Market Sedan',
		description: 'Affordable EV for everyone. Production Hell awaits.',
		tooltip: 'This is the real test — an affordable car the masses can buy. Scaling production to hundreds of thousands is a nightmare. Factory floors become war zones. Sleep at the plant. Survive Production Hell.',
		powerMW: -1,
		config: { baseCost: 8640, baseRevenue: 1080, cycleDuration: 16, costMultiplier: 1.12, revenueMultiplier: 1.0 }
	},
	{
		name: 'Compact Crossover',
		description: 'Best-seller potential. Gigafactory at full speed.',
		tooltip: 'The crossover market is enormous. If you can build a compact, affordable crossover at scale, you can become the best-selling car company in the world. Requires multiple Gigafactories running 24/7.',
		powerMW: -5,
		config: { baseCost: 103680, baseRevenue: 12960, cycleDuration: 32, costMultiplier: 1.11, revenueMultiplier: 1.0 }
	},
	{
		name: 'Electric Truck',
		description: 'Trucks are America. Crack this market and you win.',
		tooltip: 'Pickup trucks are the best-selling vehicles in America. An electric truck that can actually haul and tow without compromise is the key to mainstream adoption. Use aerospace materials to make it bulletproof.',
		powerMW: -15,
		config: { baseCost: 1244160, baseRevenue: 155520, cycleDuration: 64, costMultiplier: 1.10, revenueMultiplier: 1.0 }
	}
];

export const TESLA_COLOR = '#4488FF';
export const TESLA_ICON = '🚗';
export const TESLA_NAME = 'EVs';
