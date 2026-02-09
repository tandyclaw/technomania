/**
 * Robotics.ts — Robotics division
 * From assembly bots to general purpose robots — slow cycles, heavy manufacturing
 *
 * PROGRESSION DESIGN (balanced Feb 2026):
 * - Unlocks at $75,000 (~18 min) — final early-game unlock
 * - Slower cycles (manufacturing is physical)
 * - Higher revenue to compensate
 * - Power consumer (factories need electricity)
 * - Cost multiplier: 1.09-1.12 range
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const ROBOTICS_TIERS: { name: string; description: string; tooltip: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Assembly Bot',
		description: 'Simple robotic arm for factory lines. Every factory needs these.',
		tooltip: 'Industrial robots have been around since the 1960s. The key is making them cheap and reliable enough for every factory.',
		powerMW: -0.05,
		config: {
			baseCost: 75000,
			baseRevenue: 11250,
			cycleDuration: 6,
			costMultiplier: 1.09,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Warehouse Drone',
		description: 'Autonomous warehouse logistics. Pick, pack, ship.',
		tooltip: 'Warehouse robots move goods 3x faster than humans and work 24/7. The logistics revolution starts here.',
		powerMW: -0.5,
		config: {
			baseCost: 750000,
			baseRevenue: 105000,
			cycleDuration: 14,
			costMultiplier: 1.10,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Humanoid Prototype',
		description: 'Bipedal robot. Walking is harder than it looks.',
		tooltip: 'Bipedal locomotion requires solving balance, terrain adaptation, and energy efficiency simultaneously. Decades of research for each step.',
		powerMW: -5,
		config: {
			baseCost: 7500000,
			baseRevenue: 937500,
			cycleDuration: 35,
			costMultiplier: 1.11,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Home Robot',
		description: 'Consumer robot assistant. Cook, clean, fetch.',
		tooltip: 'The home robot market is worth trillions — if you can make one that doesn\'t break the dishes or scare the cat.',
		powerMW: -20,
		config: {
			baseCost: 75000000,
			baseRevenue: 9375000,
			cycleDuration: 80,
			costMultiplier: 1.11,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Construction Mech',
		description: 'Heavy-duty autonomous construction. Build cities.',
		tooltip: 'A 20-ton autonomous construction mech can do the work of 50 humans. Building skyscrapers in weeks instead of years.',
		powerMW: -80,
		config: {
			baseCost: 750000000,
			baseRevenue: 93750000,
			cycleDuration: 180,
			costMultiplier: 1.12,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'General Purpose Robot',
		description: 'Does anything a human can. The end of manual labor.',
		tooltip: 'A robot that can learn any physical task. Cook, build, repair, rescue. The most transformative technology since fire.',
		powerMW: -150,
		config: {
			baseCost: 7500000000,
			baseRevenue: 1125000000,
			cycleDuration: 400,
			costMultiplier: 1.12,
			revenueMultiplier: 1.0
		}
	}
];

export const ROBOTICS_COLOR = '#FF6644';
export const ROBOTICS_ICON = '🦾';
export const ROBOTICS_NAME = 'Robotics';
