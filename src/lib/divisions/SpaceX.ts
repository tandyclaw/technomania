/**
 * Rockets.ts — Space Launch division
 * Progression from small orbital rockets to Mars landers
 * Each facility CONSUMES power (negative powerMW = consumer)
 *
 * cycleDuration = how long one production cycle takes (in seconds)
 * Revenue is earned ONLY when the cycle completes (Adventure Capitalist style)
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const SPACEX_TIERS: { name: string; description: string; tooltip: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Small Orbital Rocket',
		description: 'Your first orbital vehicle. Expect failures before success.',
		tooltip: 'Small orbital rockets are the proving ground for any space program. Most early attempts fail — it took multiple tries before the first private company reached orbit. Each failure teaches you something.',
		powerMW: -0.001,
		config: { baseCost: 4, baseRevenue: 1, cycleDuration: 0.6, costMultiplier: 1.07, revenueMultiplier: 1.0 }
	},
	{
		name: 'Reusable Booster',
		description: 'Land and refly. This changes everything.',
		tooltip: 'Reusable rockets cut launch costs by 90%. Instead of throwing away a $50M booster, you land it and fly again. A single booster can fly 20+ times. This is what makes space economically viable.',
		powerMW: -0.01,
		config: { baseCost: 60, baseRevenue: 8, cycleDuration: 3, costMultiplier: 1.15, revenueMultiplier: 1.0 }
	},
	{
		name: 'Crew Capsule',
		description: 'Carry humans to orbit. Life support is hard.',
		tooltip: 'Building a spacecraft that keeps humans alive in the vacuum of space is incredibly difficult. Redundant systems, abort capabilities, re-entry heat shields — every detail matters when lives are at stake.',
		powerMW: -0.1,
		config: { baseCost: 720, baseRevenue: 90, cycleDuration: 6, costMultiplier: 1.14, revenueMultiplier: 1.0 }
	},
	{
		name: 'Heavy Lift Vehicle',
		description: 'Triple-core monster. Massive payloads to deep space.',
		tooltip: 'Heavy lift rockets can send large payloads beyond Earth orbit — to the Moon, asteroids, or Mars. Three cores firing together produce incredible thrust, but synchronizing them is an engineering nightmare.',
		powerMW: -0.5,
		config: { baseCost: 8640, baseRevenue: 1080, cycleDuration: 12, costMultiplier: 1.12, revenueMultiplier: 1.0 }
	},
	{
		name: 'Super Heavy Starship',
		description: 'Fully reusable. 100+ tons to orbit. The Mars vehicle.',
		tooltip: 'A fully reusable super-heavy rocket changes everything. 100+ tons to orbit means you can launch entire space stations, or enough supplies to start a Mars colony. This is the vehicle that makes humanity multiplanetary.',
		powerMW: -2,
		config: { baseCost: 103680, baseRevenue: 12960, cycleDuration: 36, costMultiplier: 1.11, revenueMultiplier: 1.0 }
	},
	{
		name: 'Mars Lander',
		description: 'Touch down on the red planet. The holy grail.',
		tooltip: 'Landing on Mars is brutally hard — thin atmosphere means parachutes barely work, but enough air that you need heat shields. A successful Mars lander carrying 100 tons of cargo is how you bootstrap a colony.',
		powerMW: -10,
		config: { baseCost: 1244160, baseRevenue: 155520, cycleDuration: 96, costMultiplier: 1.10, revenueMultiplier: 1.0 }
	}
];

export const SPACEX_COLOR = '#FF4444';
export const SPACEX_ICON = '🚀';
export const SPACEX_NAME = 'Rockets';
