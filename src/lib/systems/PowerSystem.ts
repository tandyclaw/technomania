/**
 * PowerSystem.ts — Power generation/consumption balance
 * The meta-game: every facility needs electricity
 */

export interface PowerSource {
	id: string;
	name: string;
	outputMW: number;
	capacityFactor: number; // 0-1, actual output vs nameplate
	type: 'solar' | 'wind' | 'gas' | 'nuclear' | 'battery' | 'geothermal';
}

export interface PowerConsumer {
	divisionId: string;
	facilityName: string;
	demandMW: number;
}

/**
 * Calculate net power (generation - consumption)
 * Negative = power shortage, facilities run at reduced capacity
 */
export function calculateNetPower(sources: PowerSource[], consumers: PowerConsumer[]): number {
	const totalGeneration = sources.reduce(
		(sum, s) => sum + s.outputMW * s.capacityFactor,
		0
	);
	const totalConsumption = consumers.reduce((sum, c) => sum + c.demandMW, 0);
	return totalGeneration - totalConsumption;
}

/**
 * Calculate efficiency multiplier based on power availability
 * If power surplus: 1.0 (full speed)
 * If power deficit: proportionally slower
 */
export function calculatePowerEfficiency(
	sources: PowerSource[],
	consumers: PowerConsumer[]
): number {
	const totalGeneration = sources.reduce(
		(sum, s) => sum + s.outputMW * s.capacityFactor,
		0
	);
	const totalConsumption = consumers.reduce((sum, c) => sum + c.demandMW, 0);

	if (totalConsumption === 0) return 1;
	if (totalGeneration >= totalConsumption) return 1;
	return totalGeneration / totalConsumption;
}
