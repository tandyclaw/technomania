/**
 * PrestigeSystem.ts — IPO calculations and permanent bonuses
 * "The IPO" resets progress but grants permanent multipliers
 */

/**
 * Calculate Founder's Vision points earned from IPO
 * Based on total company value (logarithmic scaling)
 */
export function calculateVisionPoints(totalValueEarned: number): number {
	if (totalValueEarned <= 0) return 0;
	// Logarithmic scaling: ~1 point per order of magnitude
	return Math.floor(Math.log10(totalValueEarned) * 10);
}

/**
 * Calculate the global multiplier from Founder's Vision
 * Each point gives +2% to all revenue
 */
export function calculatePrestigeMultiplier(foundersVision: number): number {
	return 1 + foundersVision * 0.02;
}

/**
 * Determine which prestige tier the player is in
 */
export function getPrestigeTier(prestigeCount: number): {
	tier: number;
	name: string;
	unlock: string;
} {
	const tiers = [
		{ tier: 0, name: 'Startup', unlock: 'Base game' },
		{ tier: 1, name: 'Series A', unlock: 'All divisions from start + Board of Directors' },
		{ tier: 2, name: 'Series B', unlock: 'Vertical Integration (automated supply chains)' },
		{ tier: 3, name: 'Series C', unlock: 'Government Contracts (timed missions)' },
		{ tier: 4, name: 'IPO', unlock: 'Mars Colony expansion' },
		{ tier: 5, name: 'Blue Chip', unlock: 'Advanced multipliers + cosmetics' }
	];

	const tierIndex = Math.min(prestigeCount, tiers.length - 1);
	return tiers[tierIndex];
}

/**
 * Check if player should be prompted for prestige
 * (when growth rate has significantly flattened)
 */
export function shouldPromptPrestige(
	currentRevenue: number,
	peakRevenue: number,
	totalValueEarned: number
): boolean {
	// Prompt when current revenue is less than 10% of peak
	// AND they'd earn meaningful vision points
	const revenueStagnant = currentRevenue < peakRevenue * 0.1;
	const worthPrestiging = calculateVisionPoints(totalValueEarned) > 0;
	return revenueStagnant && worthPrestiging;
}
