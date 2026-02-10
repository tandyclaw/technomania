/**
 * DivisionUnlockSystem.ts — Controls when divisions become available
 * 
 * PROGRESSION DESIGN (tested via simulation, Feb 2026):
 * - Energy: Always unlocked (foundation)
 * - Manufacturing: $1,000 (~5 min) — first expansion
 * - Rockets: $10,000 (~15 min) — real investment
 * - AI: $100,000 (~45 min) — mid-game gate
 * - Robotics: $1,000,000 (~80 min) — major commitment
 * 
 * Goal: each division is a real achievement. Steeper curve like AdCap.
 */

export interface DivisionUnlockRequirement {
	cost: number;
	description: string;
	flavorText: string;
}

export const DIVISION_UNLOCK_REQUIREMENTS: Record<string, DivisionUnlockRequirement> = {
	teslaenergy: {
		cost: 0,
		description: 'The foundation of everything.',
		flavorText: 'Sustainable energy is the first step. Power your dreams.',
	},
	tesla: {
		cost: 1_000,
		description: 'Scale production. Build anything.',
		flavorText: 'The world runs on cars. Make them electric.',
	},
	spacex: {
		cost: 10_000,
		description: 'Start your rocket program.',
		flavorText: 'Getting to orbit is hard. Getting to Mars is harder.',
	},
	ai: {
		cost: 100_000,
		description: 'Build artificial intelligence.',
		flavorText: 'From data centers to AGI. Compute needs power.',
	},
	robotics: {
		cost: 1_000_000,
		description: 'Build robots that automate everything.',
		flavorText: 'From assembly bots to general purpose robots. The end of manual labor.',
	},
};

/**
 * Get the unlock cost for a division
 */
export function getDivisionUnlockCost(divisionId: string): number {
	return DIVISION_UNLOCK_REQUIREMENTS[divisionId]?.cost ?? Infinity;
}

/**
 * Get the unlock requirement for a division
 */
export function getDivisionUnlockRequirement(divisionId: string): DivisionUnlockRequirement | null {
	return DIVISION_UNLOCK_REQUIREMENTS[divisionId] ?? null;
}
