/**
 * AI.ts — Artificial Intelligence division
 * From chatbots to AGI — research-hungry, power-hungry
 *
 * PROGRESSION DESIGN:
 * - Unlocks at $50,000 (mid-game)
 * - Research-point consumer (RP cost baked into cash costs, negative RP generation)
 * - Heavy power consumer (data centers)
 * - Medium-fast cycles (software ships faster than hardware)
 * - Revenue scales aggressively at higher tiers
 */

import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export const AI_TIERS: { name: string; description: string; tooltip: string; powerMW?: number; config: ProductionConfig }[] = [
	{
		name: 'Chatbot',
		description: 'Simple conversational AI. Handles FAQs and customer support.',
		tooltip: 'Rule-based chatbots are the gateway drug to AI. Low cost, surprisingly useful.',
		powerMW: -0.05,
		config: {
			baseCost: 50000,
			baseRevenue: 8000,
			cycleDuration: 3,
			costMultiplier: 1.09,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Language Model',
		description: 'Large language model. Billions of parameters, trillions of tokens.',
		tooltip: 'Training a frontier LLM costs tens of millions in compute. The results are worth it.',
		powerMW: -0.5,
		config: {
			baseCost: 500000,
			baseRevenue: 80000,
			cycleDuration: 8,
			costMultiplier: 1.11,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'AI Assistant',
		description: 'Multimodal assistant that sees, hears, and reasons.',
		tooltip: 'An AI that can process text, images, audio, and video opens entirely new markets.',
		powerMW: -2,
		config: {
			baseCost: 5000000,
			baseRevenue: 800000,
			cycleDuration: 20,
			costMultiplier: 1.13,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Autonomous Agent',
		description: 'AI that takes actions in the real world. Tool use, planning, execution.',
		tooltip: 'Agents don\'t just answer questions — they complete tasks autonomously. This changes everything.',
		powerMW: -10,
		config: {
			baseCost: 50000000,
			baseRevenue: 8000000,
			cycleDuration: 50,
			costMultiplier: 1.14,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'Neural Network Hub',
		description: 'Massive GPU cluster. Training runs that take months.',
		tooltip: 'At this scale, your data center consumes as much power as a small city.',
		powerMW: -50,
		config: {
			baseCost: 500000000,
			baseRevenue: 80000000,
			cycleDuration: 120,
			costMultiplier: 1.16,
			revenueMultiplier: 1.0
		}
	},
	{
		name: 'AGI',
		description: 'Artificial General Intelligence. The singularity is here.',
		tooltip: 'An intelligence that can do anything a human can do — and more. Handle with care.',
		powerMW: -200,
		config: {
			baseCost: 5000000000,
			baseRevenue: 1000000000,
			cycleDuration: 300,
			costMultiplier: 1.20,
			revenueMultiplier: 1.0
		}
	}
];

export const AI_COLOR = '#AA44FF';
export const AI_ICON = '🤖';
export const AI_NAME = 'AI';
