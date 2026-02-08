/**
 * SynergySystem.ts — Cross-division bonus calculations
 * Synergies are discovered by developing multiple divisions simultaneously
 *
 * REBRAND: Real company synergies as Elon describes them
 */

export interface Synergy {
	id: string;
	sourceDivision: string;
	targetDivision: string;
	name: string;
	description: string;
	effect: {
		type: 'cost_reduction' | 'speed_boost' | 'revenue_boost' | 'unlock';
		value: number;
	};
	requirement: {
		sourceTier: number; // Minimum tier in source division
		targetTier: number; // Minimum tier in target division
	};
}

/**
 * Check which synergies are active based on division progress
 */
export function getActiveSynergies(
	divisionTiers: Record<string, number>,
	allSynergies: Synergy[]
): Synergy[] {
	return allSynergies.filter((s) => {
		const sourceTier = divisionTiers[s.sourceDivision] ?? 0;
		const targetTier = divisionTiers[s.targetDivision] ?? 0;
		return sourceTier >= s.requirement.sourceTier && targetTier >= s.requirement.targetTier;
	});
}

// MVP synergy definitions — real company interconnections
export const MVP_SYNERGIES: Synergy[] = [
	{
		id: 'teslaenergy_spacex_power',
		sourceDivision: 'teslaenergy',
		targetDivision: 'spacex',
		name: 'Powered Launch Complex',
		description: 'Tesla Energy supplies clean electricity to SpaceX launch facilities at Starbase.',
		effect: { type: 'cost_reduction', value: 0.15 },
		requirement: { sourceTier: 2, targetTier: 3 }
	},
	{
		id: 'tesla_teslaenergy_batteries',
		sourceDivision: 'tesla',
		targetDivision: 'teslaenergy',
		name: 'Shared Battery Supply Chain',
		description: 'Tesla and Tesla Energy share battery cell manufacturing at the Gigafactory.',
		effect: { type: 'speed_boost', value: 0.2 },
		requirement: { sourceTier: 3, targetTier: 3 }
	},
	{
		id: 'teslaenergy_tesla_charging',
		sourceDivision: 'teslaenergy',
		targetDivision: 'tesla',
		name: 'Supercharger Network',
		description: 'Tesla Energy solar + Megapack powers the Tesla Supercharger network.',
		effect: { type: 'revenue_boost', value: 0.1 },
		requirement: { sourceTier: 4, targetTier: 4 }
	}
];
