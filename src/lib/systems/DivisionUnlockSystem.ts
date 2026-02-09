/**
 * DivisionUnlockSystem.ts — Controls when divisions become available
 * 
 * Energy: Always unlocked (the foundation — you need power for everything)
 * Rockets: Unlocks for $1,000 (start your space program)
 * EVs: Unlocks for $10,000 (build your car company)
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
		cost: 1000,
		description: 'Start your rocket program. Failure is an option — and expected.',
		flavorText: 'Getting to orbit is hard. Getting to Mars is harder. Let\'s begin.',
	},
	tesla: {
		cost: 10000,
		description: 'Build electric vehicles. End the age of oil.',
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
