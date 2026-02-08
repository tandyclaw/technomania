/**
 * ProductionSystem.ts — Core production calculations
 * Handles tap-to-produce, automated production, and revenue generation
 */

export interface ProductionConfig {
	baseCost: number;
	baseRevenue: number;
	baseTime: number; // ms to produce one unit
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
 */
export function calculateRevenue(config: ProductionConfig, count: number, level: number): number {
	return config.baseRevenue * count * Math.pow(config.revenueMultiplier, level);
}

/**
 * Calculate production time with automation bonuses
 * chiefLevel 0 = manual (no auto), 1-6 = increasingly fast
 */
export function calculateProductionTime(config: ProductionConfig, chiefLevel: number): number {
	if (chiefLevel === 0) return config.baseTime; // manual only
	const speedMultiplier = [1, 1, 2, 5, 10, 50][chiefLevel - 1] ?? 1;
	return config.baseTime / speedMultiplier;
}

/**
 * Calculate total cost to buy N units starting from currentCount
 * Uses geometric series: sum = baseCost * mult^start * (mult^N - 1) / (mult - 1)
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
		// Safety cap at 10000 to prevent infinite loops
		if (count >= 10000) break;
	}
	return count;
}
