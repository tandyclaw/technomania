/**
 * Tesla.ts — Electric Vehicles division
 * Real Tesla vehicle progression: Roadster → Cybertruck
 * Each facility CONSUMES power (negative powerMW = consumer)
 *
 * cycleDuration = how long one production cycle takes (in seconds)
 * Revenue is earned ONLY when the cycle completes (Adventure Capitalist style)
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const TESLA_TIERS: { name: string; description: string; tooltip: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Roadster',
		description: 'The original. Prove EVs can be desirable. 2,500 built.',
		tooltip: 'Tesla Roadster (2008): First highway-legal production EV to use lithium-ion cells. Built on a Lotus Elise chassis. Only 2,450 were made. Proved electric cars could be fast and desirable, not just golf carts.',
		powerMW: -0.002, // 2 kW per unit
		config: { baseCost: 4, baseRevenue: 1, cycleDuration: 0.6, costMultiplier: 1.07, revenueMultiplier: 1.0 }
	},
	{
		name: 'Model S',
		description: 'Luxury sedan that put Tesla on the map.',
		tooltip: 'Model S (2012): The car that proved Tesla was real. Achieved a 5-star safety rating in every category. The Plaid variant hits 0-60 in 1.99 seconds — faster than most supercars. Over 400 mile range.',
		powerMW: -0.02, // 20 kW per unit
		config: { baseCost: 60, baseRevenue: 8, cycleDuration: 4, costMultiplier: 1.15, revenueMultiplier: 1.0 }
	},
	{
		name: 'Model X',
		description: 'Crossover SUV with falcon wing doors.',
		tooltip: 'Model X (2015): Full-size SUV with iconic falcon-wing doors that use ultrasonic sensors to avoid obstacles. Nearly 5,000 lbs yet does 0-60 in 2.5s. The doors were an engineering nightmare that delayed production by 2 years.',
		powerMW: -0.2, // 200 kW per unit
		config: { baseCost: 720, baseRevenue: 90, cycleDuration: 8, costMultiplier: 1.14, revenueMultiplier: 1.0 }
	},
	{
		name: 'Model 3',
		description: 'The affordable EV for everyone. Production Hell awaits.',
		tooltip: 'Model 3 (2017): Tesla\'s mass-market car. Hit "Production Hell" — Elon slept on the factory floor for months. Over 500,000 reservations on day one. Became the best-selling EV globally and proved EVs could go mainstream.',
		powerMW: -1, // 1 MW per unit
		config: { baseCost: 8640, baseRevenue: 1080, cycleDuration: 16, costMultiplier: 1.12, revenueMultiplier: 1.0 }
	},
	{
		name: 'Model Y',
		description: 'The world\'s best-selling car. Gigafactory at full speed.',
		tooltip: 'Model Y (2020): Became the world\'s best-selling car of any kind in 2023. Uses a revolutionary single-piece mega-casting for the rear underbody, replacing 70+ parts with one. Built across 4 Gigafactories globally.',
		powerMW: -5, // 5 MW per unit
		config: { baseCost: 103680, baseRevenue: 12960, cycleDuration: 32, costMultiplier: 1.11, revenueMultiplier: 1.0 }
	},
	{
		name: 'Cybertruck',
		description: 'Bulletproof stainless steel. The truck that broke the internet.',
		tooltip: 'Cybertruck (2023): Made from ultra-hard 30X cold-rolled stainless steel — the same alloy SpaceX uses for Starship. The infamous "armor glass" demo shattered live on stage. Polarizing design that broke the internet.',
		powerMW: -15, // 15 MW per unit
		config: { baseCost: 1244160, baseRevenue: 155520, cycleDuration: 64, costMultiplier: 1.10, revenueMultiplier: 1.0 }
	}
];

export const TESLA_COLOR = '#4488FF';
export const TESLA_ICON = '🔋';
export const TESLA_NAME = 'Tesla';
