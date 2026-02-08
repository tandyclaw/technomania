/**
 * ProductionSystem.ts — Core production calculations
 * Adventure Capitalist-style timed production cycles.
 *
 * cycleDuration = seconds for one full production cycle
 * Tap starts a cycle → progress bar fills → cash awarded on completion
 */

export interface ProductionConfig {
	baseCost: number;
	baseRevenue: number;
	/** Duration of one production cycle in SECONDS (Adventure Capitalist style) */
	cycleDuration: number;
	costMultiplier: number; // cost increase per purchase
	revenueMultiplier: number; // revenue increase per level
}

/**
 * Calculate cost of next purchase for a tier
 */
export function calculateCost(config: ProductionConfig, count: number): number {
	return config.baseCost * Math.pow(config.costMultiplier, count);
}

/**
 * Calculate revenue per production cycle for a tier
 * Revenue = baseRevenue * count * revenueMultiplier^level
 */
export function calculateRevenue(config: ProductionConfig, count: number, level: number): number {
	return config.baseRevenue * count * Math.pow(config.revenueMultiplier, level);
}

/**
 * Get cycle duration in milliseconds, with chief speed bonus applied
 * chiefLevel 0 = manual (base duration), 1-6 = increasingly fast
 */
export function getCycleDurationMs(config: ProductionConfig, chiefLevel: number): number {
	const baseMs = config.cycleDuration * 1000;
	if (chiefLevel === 0) return baseMs;
	const speedMultipliers = [1, 2, 5, 10, 50, 100];
	const speedMultiplier = speedMultipliers[chiefLevel - 1] ?? 1;
	return baseMs / speedMultiplier;
}

/**
 * @deprecated Use getCycleDurationMs instead. Kept for backward compat during migration.
 */
export function calculateProductionTime(config: ProductionConfig, chiefLevel: number): number {
	return getCycleDurationMs(config, chiefLevel);
}

/**
 * Calculate total cost to buy N units starting from currentCount
 */
export function calculateBulkCost(config: ProductionConfig, currentCount: number, quantity: number): number {
	let total = 0;
	for (let i = 0; i < quantity; i++) {
		total += calculateCost(config, currentCount + i);
	}
	return total;
}

/**
 * Calculate maximum units purchasable with a given budget
 */
export function calculateMaxBuyable(config: ProductionConfig, currentCount: number, budget: number): number {
	let count = 0;
	let totalCost = 0;
	while (true) {
		const nextCost = calculateCost(config, currentCount + count);
		if (totalCost + nextCost > budget) break;
		totalCost += nextCost;
		count++;
		if (count >= 10000) break;
	}
	return count;
}
