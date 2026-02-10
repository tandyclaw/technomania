/**
 * AI.ts — Artificial Intelligence division
 * From chatbots to AGI — research-hungry, power-hungry
 *
 * PROGRESSION DESIGN (balanced Feb 2026):
 * - Unlocks at $5,000 (~17 min) — fills the post-Manufacturing gap
 * - Heavy power consumer (data centers)
 * - Medium-fast cycles (software ships faster than hardware)
 * - Revenue scales aggressively at higher tiers
 * - Chatbot ROI (0.053/s per $) competitive with mid-tier energy items
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const AI_TIERS: { name: string; description: string; tooltip: string; flavor?: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Chatbot',
		description: 'Simple conversational AI. Handles FAQs and customer support.',
		tooltip: 'Rule-based chatbots are the gateway drug to AI. Low cost, surprisingly useful.',
		flavor: '"Have you tried turning it off and on again?" — Your chatbot, to every customer.',
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
		name: 'Language Model',
		description: 'Large language model. Billions of parameters, trillions of tokens.',
		tooltip: 'Training a frontier LLM costs tens of millions in compute. The results are worth it.',
		flavor: 'It wrote a sonnet, a contract, and a breakup text. All before lunch.',
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
		name: 'AI Assistant',
		description: 'Multimodal assistant that sees, hears, and reasons.',
		tooltip: 'An AI that can process text, images, audio, and video opens entirely new markets.',
		flavor: 'Sees your calendar, hears your sighs, knows you\'re not "fine."',
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
		name: 'Autonomous Agent',
		description: 'AI that takes actions in the real world. Tool use, planning, execution.',
		tooltip: 'Agents don\'t just answer questions — they complete tasks autonomously. This changes everything.',
		flavor: 'Booked your flight, cancelled your meeting, and ordered dinner. You didn\'t ask.',
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
		name: 'Neural Network Hub',
		description: 'Massive GPU cluster. Training runs that take months.',
		tooltip: 'At this scale, your data center consumes as much power as a small city.',
		flavor: '100,000 GPUs humming in harmony. Your electricity bill has its own accountant.',
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
