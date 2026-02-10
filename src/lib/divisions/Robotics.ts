/**
 * Robotics.ts — Robotics division
 * From assembly bots to general purpose robots — slow cycles, heavy manufacturing
 *
 * PROGRESSION DESIGN (balanced Feb 2026):
 * - Unlocks at $40,000 (~32 min) — final early-game unlock
 * - Slower cycles (manufacturing is physical)
 * - Higher revenue to compensate
 * - Power consumer (factories need electricity)
 * - Cost multiplier: 1.09-1.12 range
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const ROBOTICS_TIERS: { name: string; description: string; tooltip: string; flavor?: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Assembly Bot',
		description: 'Simple robotic arm for factory lines. Every factory needs these.',
		tooltip: 'Industrial robots have been around since the 1960s. The key is making them cheap and reliable enough for every factory.',
		flavor: 'Doesn\'t need coffee breaks. Or coffee. Or breaks.',
		powerMW: -0.05,
		config: {
			baseCost: 40000,
			baseRevenue: 6000,
			cycleDuration: 12,
			costMultiplier: 1.09,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Warehouse Drone',
		description: 'Autonomous warehouse logistics. Pick, pack, ship.',
		tooltip: 'Warehouse robots move goods 3x faster than humans and work 24/7. The logistics revolution starts here.',
		flavor: 'Knows where everything is. Judges you for your impulse purchases.',
		powerMW: -0.5,
		config: {
			baseCost: 400000,
			baseRevenue: 56000,
			cycleDuration: 28,
			costMultiplier: 1.10,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Humanoid Prototype',
		description: 'Bipedal robot. Walking is harder than it looks.',
		tooltip: 'Bipedal locomotion requires solving balance, terrain adaptation, and energy efficiency simultaneously. Decades of research for each step.',
		flavor: 'Falls down 47 times a day. Gets up 48. Boston Dynamics energy.',
		powerMW: -5,
		config: {
			baseCost: 2500000,
			baseRevenue: 350000,
			cycleDuration: 70,
			costMultiplier: 1.11,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Home Robot',
		description: 'Consumer robot assistant. Cook, clean, fetch.',
		tooltip: 'The home robot market is worth trillions — if you can make one that doesn\'t break the dishes or scare the cat.',
		flavor: 'Rosie from the Jetsons, minus the attitude. Okay, maybe a little attitude.',
		powerMW: -20,
		config: {
			baseCost: 40000000,
			baseRevenue: 5000000,
			cycleDuration: 160,
			costMultiplier: 1.11,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Construction Mech',
		description: 'Heavy-duty autonomous construction. Build cities.',
		tooltip: 'A 20-ton autonomous construction mech can do the work of 50 humans. Building skyscrapers in weeks instead of years.',
		flavor: 'Pacific Rim was a documentary. We just haven\'t met the kaiju yet.',
		powerMW: -80,
		config: {
			baseCost: 400000000,
			baseRevenue: 50000000,
			cycleDuration: 360,
			costMultiplier: 1.12,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'General Purpose Robot',
		description: 'Does anything a human can. The end of manual labor.',
		tooltip: 'A robot that can learn any physical task. Cook, build, repair, rescue. The most transformative technology since fire.',
		flavor: 'Can do anything you can do, but better. Try not to think about it.',
		powerMW: -150,
		config: {
			baseCost: 4000000000,
			baseRevenue: 600000000,
			cycleDuration: 800,
			costMultiplier: 1.12,
			revenueMultiplier: 1.0
		}
	}
];

export const ROBOTICS_COLOR = '#FF6644';
export const ROBOTICS_ICON = '🦾';
export const ROBOTICS_NAME = 'Robotics';
