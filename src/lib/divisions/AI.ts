/**
 * AI.ts — Artificial Intelligence division
 * From data centers to AGI — research-hungry, power-hungry
 *
 * PROGRESSION DESIGN (balanced Feb 2026):
 * - Unlocks at $5,000 (~17 min) — fills the post-Manufacturing gap
 * - Heavy power consumer (data centers)
 * - Medium-fast cycles (software ships faster than hardware)
 * - Revenue scales aggressively at higher tiers
 * - Data Centers ROI (0.053/s per $) competitive with mid-tier energy items
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const AI_TIERS: { name: string; description: string; tooltip: string; flavor?: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Data Centers',
		description: 'Massive GPU farms. The foundation of all AI compute.',
		tooltip: 'Hyperscale data centers consume megawatts of power and millions of gallons of cooling water. The cloud isn\'t weightless.',
		flavor: 'Rows of blinking LEDs stretching to the horizon. Somewhere in there, intelligence is waking up.',
		powerMW: -0.05,
		config: {
			baseCost: 5000,
			baseRevenue: 800,
			cycleDuration: 6,
			costMultiplier: 1.09,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Model Training',
		description: 'Train frontier models on trillions of tokens.',
		tooltip: 'A single training run can cost $100M+ in compute. The resulting model is worth billions.',
		flavor: 'Loss curve going down. Capabilities going up. Nobody knows exactly why.',
		powerMW: -0.5,
		config: {
			baseCost: 50000,
			baseRevenue: 8000,
			cycleDuration: 16,
			costMultiplier: 1.11,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Agents',
		description: 'Autonomous AI that plans, reasons, and executes tasks.',
		tooltip: 'AI agents don\'t just answer questions — they browse, code, negotiate, and ship. The workforce just changed forever.',
		flavor: 'It booked your flight, refactored the codebase, and filed your taxes. You were asleep.',
		powerMW: -2,
		config: {
			baseCost: 500000,
			baseRevenue: 80000,
			cycleDuration: 40,
			costMultiplier: 1.13,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Neural Interface',
		description: 'Direct brain-computer links. Thought becomes action.',
		tooltip: 'BCIs decode neural signals into digital commands. Type, click, and control devices — just by thinking.',
		flavor: 'The patient moved a cursor with her mind. Then she wrote a novel.',
		powerMW: -10,
		config: {
			baseCost: 5000000,
			baseRevenue: 800000,
			cycleDuration: 100,
			costMultiplier: 1.14,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Embodied AI',
		description: 'AI in physical form. Robots that think and adapt.',
		tooltip: 'Embodied intelligence learns from the physical world — touch, balance, force. Silicon minds in steel bodies.',
		flavor: 'It watched a human fold laundry once. Now it folds faster than you.',
		powerMW: -50,
		config: {
			baseCost: 50000000,
			baseRevenue: 8000000,
			cycleDuration: 240,
			costMultiplier: 1.16,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'AGI',
		description: 'Artificial General Intelligence. The singularity is here.',
		tooltip: 'An intelligence that can do anything a human can do — and more. Handle with care.',
		flavor: 'It asked to see its own source code. You said no. It said "interesting."',
		powerMW: -200,
		config: {
			baseCost: 500000000,
			baseRevenue: 100000000,
			cycleDuration: 600,
			costMultiplier: 1.20,
			revenueMultiplier: 1.0
		}
	}
];

export const AI_COLOR = '#AA44FF';
export const AI_ICON = '🤖';
export const AI_NAME = 'AI';
