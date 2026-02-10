/**
 * DivisionUnlockSystem.ts — Controls when divisions become available
 * 
 * PROGRESSION DESIGN (tested via simulation, Feb 2026):
 * - Energy: Always unlocked (foundation)
 * - Rockets: $500 (~3 min) — first milestone, feels exciting
 * - Manufacturing: $2,500 (~9 min) — money engine kicks in
 * - AI: $5,000 (~17 min) — breaks the mid-game dead zone
 * - Tunnels: $12,000 (~24 min) — slow-cycle money engine
 * - Robotics: $40,000 (~32 min) — late-mid unlock, new item types
 * 
 * Goal: new division every 5-10 minutes. AdCap-style pacing.
 * Cycle durations doubled from original Feb 2026 values.
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
		description: 'Scale production. Build anything.',
		flavorText: 'The world runs on cars. Make them electric.',
	},
	ai: {
		cost: 5000,
		description: 'Build artificial intelligence.',
		flavorText: 'From chatbots to AGI. Data centers need power.',
	},
	tunnels: {
		cost: 12000,
		description: 'Bore tunnels under cities.',
		flavorText: 'Move people and freight underground. Slow but lucrative.',
	},
	robotics: {
		cost: 40000,
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
