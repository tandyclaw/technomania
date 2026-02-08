/**
 * ResearchSystem.ts — Tech tree state and unlocks
 * Web-structured research with cross-division nodes
 */

export interface ResearchNode {
	id: string;
	name: string;
	description: string;
	cost: number; // Research Points
	timeMs: number; // Time to research
	category: 'materials' | 'manufacturing' | 'software' | 'energy' | 'biotech' | 'aerospace' | 'infrastructure';
	prerequisites: string[]; // IDs of required research
	effects: ResearchEffect[];
	division?: string; // If division-specific, otherwise cross-division
}

export interface ResearchEffect {
	type: 'production_speed' | 'revenue_multiplier' | 'cost_reduction' | 'unlock_tier' | 'power_output' | 'synergy';
	target: string; // Division or system affected
	value: number; // Multiplier or flat bonus
	description: string;
}

/**
 * Check if a research node can be started
 */
export function canResearch(
	node: ResearchNode,
	unlockedResearch: string[],
	availableRP: number
): boolean {
	const prereqsMet = node.prerequisites.every((id) => unlockedResearch.includes(id));
	const canAfford = availableRP >= node.cost;
	const notAlreadyDone = !unlockedResearch.includes(node.id);
	return prereqsMet && canAfford && notAlreadyDone;
}
