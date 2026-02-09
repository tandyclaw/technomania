/**
 * SpaceX.ts — Rockets & Space division
 * Real SpaceX vehicle progression for MVP: Falcon 1 → Mars Lander
 * Each facility CONSUMES power (negative powerMW = consumer)
 *
 * cycleDuration = how long one production cycle takes (in seconds)
 * Revenue is earned ONLY when the cycle completes (Adventure Capitalist style)
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const SPACEX_TIERS: { name: string; description: string; tooltip: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Falcon 1',
		description: 'Your first orbital rocket. Three failures before success.',
		tooltip: 'Falcon 1: SpaceX\'s first orbital rocket. Only 5 were ever launched (2006-2009). The 4th flight was the first privately-funded liquid-fuel rocket to reach orbit.',
		powerMW: -0.001, // 1 kW per unit
		config: { baseCost: 4, baseRevenue: 1, cycleDuration: 0.6, costMultiplier: 1.07, revenueMultiplier: 1.0 }
	},
	{
		name: 'Falcon 9',
		description: 'The workhorse. Reusable first stage changes everything.',
		tooltip: 'Falcon 9: SpaceX\'s reusable orbital rocket. First successful booster landing in Dec 2015. A single booster has flown 20+ times. Revolutionized launch costs from ~$150M to ~$67M per flight.',
		powerMW: -0.01, // 10 kW per unit
		config: { baseCost: 60, baseRevenue: 8, cycleDuration: 3, costMultiplier: 1.15, revenueMultiplier: 1.0 }
	},
	{
		name: 'Dragon',
		description: 'First commercial spacecraft to dock with the ISS.',
		tooltip: 'Dragon: First privately-developed spacecraft to reach the ISS (May 2012). Crew Dragon replaced the Space Shuttle for astronaut transport in 2020, ending US reliance on Russian Soyuz.',
		powerMW: -0.1, // 100 kW per unit
		config: { baseCost: 720, baseRevenue: 90, cycleDuration: 6, costMultiplier: 1.14, revenueMultiplier: 1.0 }
	},
	{
		name: 'Falcon Heavy',
		description: 'Triple-core heavy lifter. Launched a Tesla Roadster into space.',
		tooltip: 'Falcon Heavy: World\'s most powerful operational rocket at debut (Feb 2018). Uses three Falcon 9 cores strapped together. Its maiden flight famously carried Elon\'s personal Tesla Roadster into a Mars-crossing orbit.',
		powerMW: -0.5, // 500 kW per unit
		config: { baseCost: 8640, baseRevenue: 1080, cycleDuration: 12, costMultiplier: 1.12, revenueMultiplier: 1.0 }
	},
	{
		name: 'Starship',
		description: 'Largest rocket ever built. Fully reusable. The Mars vehicle.',
		tooltip: 'Starship: The largest and most powerful rocket ever built — 121m tall, 5,000 tonnes thrust. Designed for full reusability and Mars colonization. Super Heavy booster was first caught by "chopstick" arms in Oct 2024.',
		powerMW: -2, // 2 MW per unit
		config: { baseCost: 103680, baseRevenue: 12960, cycleDuration: 36, costMultiplier: 1.11, revenueMultiplier: 1.0 }
	},
	{
		name: 'Mars Lander',
		description: 'Starship configured for Mars landing. The holy grail.',
		tooltip: 'Mars Lander: A Starship variant designed for Mars surface operations. Would carry ~100 tonnes of cargo to Mars, enabling a self-sustaining colony. Elon\'s stated goal: humans on Mars by the late 2020s.',
		powerMW: -10, // 10 MW per unit
		config: { baseCost: 1244160, baseRevenue: 155520, cycleDuration: 96, costMultiplier: 1.10, revenueMultiplier: 1.0 }
	}
];

export const SPACEX_COLOR = '#FF4444';
export const SPACEX_ICON = '🚀';
export const SPACEX_NAME = 'SpaceX';
