/**
 * Rockets.ts — Space Launch division
 * From small orbital rockets to Mars landers
 *
 * PROGRESSION DESIGN (verified Feb 2026):
 * - Unlocks at $500 (~1.5 min of Energy play)
 * - Slower cycles than Energy (launches are events, not taps)
 * - Higher revenue per cycle compensates for longer waits
 * - Power CONSUMER — need Energy infrastructure to support
 * - Rocket ROI (0.08) is competitive with Solar (0.089), good second buy
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const SPACEX_TIERS: { name: string; description: string; tooltip: string; flavor?: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Small Orbital Rocket',
		description: 'Your first orbital vehicle. Expect failures.',
		tooltip: 'Small orbital rockets are the proving ground for any space program. Most early attempts fail.',
		flavor: 'It\'s not a failure, it\'s a rapid unscheduled disassembly.',
		powerMW: -0.01,
		config: {
			baseCost: 30,
			baseRevenue: 6,
			cycleDuration: 2.5,      // Launches take time
			costMultiplier: 1.08,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Reusable Booster',
		description: 'Land and refly. This changes everything.',
		tooltip: 'Reusable rockets cut launch costs by 90%. A single booster can fly 20+ times.',
		flavor: 'Lands itself on a drone ship in the ocean. Your car can\'t even parallel park.',
		powerMW: -0.05,
		config: {
			baseCost: 250,
			baseRevenue: 50,
			cycleDuration: 6,
			costMultiplier: 1.10,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Crew Capsule',
		description: 'Carry humans to orbit. Life support is hard.',
		tooltip: 'Building a spacecraft that keeps humans alive in vacuum is incredibly difficult.',
		flavor: 'Touchscreen controls. The astronauts miss the buttons. They won\'t admit it.',
		powerMW: -0.2,
		config: {
			baseCost: 2000,
			baseRevenue: 400,
			cycleDuration: 15,
			costMultiplier: 1.12,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Heavy Lift Vehicle',
		description: 'Triple-core monster. Massive payloads.',
		tooltip: 'Heavy lift rockets can send large payloads beyond Earth orbit — to the Moon or Mars.',
		flavor: 'Three boosters landing simultaneously. Even the engineers cry every time.',
		powerMW: -1,
		config: {
			baseCost: 15000,
			baseRevenue: 3000,
			cycleDuration: 35,
			costMultiplier: 1.13,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Super Heavy Starship',
		description: 'Fully reusable. 100+ tons to orbit.',
		tooltip: 'A fully reusable super-heavy rocket changes everything. This is the Mars vehicle.',
		flavor: 'Caught by chopsticks on the launch tower. Yes, really. No, we\'re not joking.',
		powerMW: -5,
		config: {
			baseCost: 120000,
			baseRevenue: 25000,
			cycleDuration: 90,
			costMultiplier: 1.15,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Starship Lander',
		description: 'Land on Mars and relaunch. Fully reusable interplanetary transport.',
		tooltip: 'Landing on Mars is brutally hard. A successful lander is how you bootstrap a colony.',
		flavor: '100% reusable. 80% of the time. The other 20% makes great content.',
		powerMW: -20,
		config: {
			baseCost: 1000000,
			baseRevenue: 200000,
			cycleDuration: 180,      // 3 minutes — a real event
			costMultiplier: 1.17,
			revenueMultiplier: 1.0
		}
	}
];

export const SPACEX_COLOR = '#FF4444';
export const SPACEX_ICON = '🚀';
export const SPACEX_NAME = 'Rockets';
