/**
 * BottleneckSystem.ts — Dynamic bottleneck detection and resolution
 * The game's most innovative feature: real engineering problems as gameplay
 */

export interface Bottleneck {
	id: string;
	name: string;
	description: string;
	division: string;
	category: 'engineering' | 'power' | 'supply_chain' | 'regulatory' | 'human_capital';
	triggerCondition: {
		metric: string;
		threshold: number;
	};
	severity: number; // 0-1, how much it slows production
	resolutionPaths: ResolutionPath[];
}

export interface ResolutionPath {
	type: 'research' | 'money' | 'synergy' | 'time';
	description: string;
	cost?: number; // Cash or RP depending on type
	timeMs?: number; // How long to wait
	synergyDivision?: string; // Which division helps
	effectiveness: number; // 0-1, how much severity is reduced
}

/**
 * Check if any bottlenecks should activate based on current game state
 */
export function checkBottlenecks(
	division: string,
	metrics: Record<string, number>,
	bottleneckDefinitions: Bottleneck[]
): Bottleneck[] {
	return bottleneckDefinitions.filter((b) => {
		if (b.division !== division) return false;
		const currentValue = metrics[b.triggerCondition.metric] ?? 0;
		return currentValue >= b.triggerCondition.threshold;
	});
}
