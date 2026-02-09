/**
 * DivisionUnlockSystem.ts — Controls when divisions become available
 * 
 * PROGRESSION DESIGN:
 * - Energy: Always unlocked (foundation — you NEED power for other divisions)
 * - Rockets: $500 (quickly reachable, ~2-3 min of play)
 * - EVs: $2,500 (reached ~5-7 min, when you're starting to feel the rhythm)
 * 
 * Energy should feel "free" and fast. Unlocking Rockets is the first milestone.
 * EVs come later as the money engine.
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
	spacex: {
		cost: 500,
		description: 'Start your rocket program.',
		flavorText: 'Getting to orbit is hard. Getting to Mars is harder.',
	},
	tesla: {
		cost: 2500,
		description: 'Build electric vehicles at scale.',
		flavorText: 'The world runs on cars. Make them electric.',
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
