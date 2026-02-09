/**
 * EVs.ts — Electric Vehicles division
 * From sports car proof-of-concept to mass market dominance
 *
 * PROGRESSION DESIGN:
 * - Unlocks at $2,500 (reachable ~5-7 min)
 * - Medium cycle times (manufacturing is factory work)
 * - This becomes the MONEY ENGINE at scale
 * - Highest revenue potential but steep late-game costs
 * - Power CONSUMER — factories need massive energy
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const TESLA_TIERS: { name: string; description: string; tooltip: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Electric Sports Car',
		description: 'Prove EVs can be desirable. Change perception.',
		tooltip: 'The first step is proving electric cars aren\'t boring golf carts. Build the brand.',
		powerMW: -0.02,
		config: {
			baseCost: 125,
			baseRevenue: 20,
			cycleDuration: 3,
			costMultiplier: 1.08,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Luxury Sedan',
		description: 'Premium EV with serious range. Build credibility.',
		tooltip: 'A luxury sedan with 300+ mile range proves EVs are practical, not just toys.',
		powerMW: -0.1,
		config: {
			baseCost: 800,
			baseRevenue: 150,
			cycleDuration: 8,
			costMultiplier: 1.10,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Electric SUV',
		description: 'Family-sized EV. Harder to build than sedans.',
		tooltip: 'SUVs are where the real money is. Larger vehicles mean new engineering challenges.',
		powerMW: -0.5,
		config: {
			baseCost: 6000,
			baseRevenue: 1200,
			cycleDuration: 18,
			costMultiplier: 1.12,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Mass Market Sedan',
		description: 'Affordable EV for everyone. Production Hell awaits.',
		tooltip: 'This is the real test. Scaling to hundreds of thousands is a nightmare.',
		powerMW: -2,
		config: {
			baseCost: 50000,
			baseRevenue: 10000,
			cycleDuration: 40,
			costMultiplier: 1.13,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Compact Crossover',
		description: 'Best-seller potential. Gigafactory at full speed.',
		tooltip: 'Build this at scale and you can become the best-selling car company in the world.',
		powerMW: -10,
		config: {
			baseCost: 400000,
			baseRevenue: 80000,
			cycleDuration: 100,
			costMultiplier: 1.15,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Electric Truck',
		description: 'Trucks are America. Crack this market and you win.',
		tooltip: 'Pickup trucks are the best-selling vehicles. An electric truck that can haul and tow is the key.',
		powerMW: -30,
		config: {
			baseCost: 3000000,
			baseRevenue: 600000,
			cycleDuration: 200,      // Long cycles = you NEED automation
			costMultiplier: 1.18,
			revenueMultiplier: 1.0
		}
	}
];

export const TESLA_COLOR = '#4488FF';
export const TESLA_ICON = '🚗';
export const TESLA_NAME = 'EVs';
