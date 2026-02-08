/**
 * SynergySystem.ts — Cross-division bonus calculations
 * Synergies are discovered by developing multiple divisions simultaneously
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

// MVP synergy definitions
export const MVP_SYNERGIES: Synergy[] = [
	{
		id: 'helios_apex_power',
		sourceDivision: 'helios',
		targetDivision: 'apex',
		name: 'Powered Launch Complex',
		description: 'Helios Power supplies cheap electricity to Apex Rocketry launch facilities.',
		effect: { type: 'cost_reduction', value: 0.15 },
		requirement: { sourceTier: 2, targetTier: 3 }
	},
	{
		id: 'volt_helios_batteries',
		sourceDivision: 'volt',
		targetDivision: 'helios',
		name: 'Shared Battery Supply Chain',
		description: 'Volt Motors and Helios Power share battery cell manufacturing.',
		effect: { type: 'speed_boost', value: 0.2 },
		requirement: { sourceTier: 3, targetTier: 3 }
	},
	{
		id: 'helios_volt_charging',
		sourceDivision: 'helios',
		targetDivision: 'volt',
		name: 'Integrated Charging Network',
		description: 'Helios solar + storage powers the Volt Motors charging network.',
		effect: { type: 'revenue_boost', value: 0.1 },
		requirement: { sourceTier: 4, targetTier: 4 }
	}
];
