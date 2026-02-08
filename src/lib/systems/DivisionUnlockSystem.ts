/**
 * DivisionUnlockSystem.ts — Controls when divisions become available
 * 
 * Tesla Energy: Always unlocked (the foundation)
 * SpaceX: Unlocks after earning $500 total (or via purchase for $250)
 * Tesla: Unlocks after earning $2,500 total (or via purchase for $1,000)
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
		flavorText: '"Sustainable energy is the single biggest thing we need to solve."',
	},
	spacex: {
		cost: 250,
		description: 'Pour your savings into rockets. What could go wrong?',
		flavorText: '"I thought the chances of SpaceX succeeding were about 10%."',
	},
	tesla: {
		cost: 2000,
		description: 'Invest in electric vehicles before anyone else believes in them.',
		flavorText: '"The overarching purpose of Tesla is to accelerate sustainable energy."',
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
