/**
 * PrestigeSystem.ts — "Launch New Colony" mechanic
 *
 * Instead of "IPO", the prestige mechanic is thematically about
 * establishing a new colony (Moon, Mars, beyond). You take your
 * expertise and technology with you, but start fresh on infrastructure.
 *
 * Each reset grants "Colony Tech" points that permanently boost
 * all future colonies. The more you build before resetting, the
 * more Colony Tech you earn.
 */

/**
 * Calculate Colony Tech points earned from a colony launch
 * Based on total lifetime earnings (logarithmic so it never stops being useful)
 */
export function calculateColonyTech(totalValueEarned: number): number {
	if (totalValueEarned <= 0) return 0;
	// Every 10x earnings = roughly 10 more Colony Tech
	// $1M = ~60 CT, $1B = ~90 CT, $1T = ~120 CT
	return Math.floor(Math.log10(totalValueEarned) * 10);
}

/**
 * Calculate the global multiplier from Colony Tech
 * Each point gives +3% to all production speed
 */
export function calculatePrestigeMultiplier(colonyTech: number): number {
	return 1 + colonyTech * 0.03;
}

/**
 * Colony milestones — each prestige unlocks new features
 */
export function getColonyMilestone(prestigeCount: number): {
	colony: number;
	name: string;
	destination: string;
	unlock: string;
} {
	const milestones = [
		{
			colony: 0,
			name: 'Earth',
			destination: 'Home',
			unlock: 'Starting colony — build your empire'
		},
		{
			colony: 1,
			name: 'Luna',
			destination: 'Moon Base',
			unlock: 'All divisions unlocked from start'
		},
		{
			colony: 2,
			name: 'Mars Alpha',
			destination: 'Mars',
			unlock: 'Automated managers start at 50% discount'
		},
		{
			colony: 3,
			name: 'Mars City',
			destination: 'Mars Expansion',
			unlock: 'Start with 1 free tier in each division'
		},
		{
			colony: 4,
			name: 'Titan Outpost',
			destination: 'Saturn\'s Moon',
			unlock: 'Double offline earnings'
		},
		{
			colony: 5,
			name: 'Interstellar',
			destination: 'Beyond the Solar System',
			unlock: '+50% to all Colony Tech bonuses'
		}
	];

	const idx = Math.min(prestigeCount, milestones.length - 1);
	return milestones[idx];
}

/**
 * Check if player should be nudged toward prestige
 * When progression has significantly slowed down
 */
export function shouldSuggestNewColony(
	currentRevenuePerSecond: number,
	peakRevenuePerSecond: number,
	totalValueEarned: number,
	currentColonyTech: number
): boolean {
	// Don't suggest if they'd earn less than 10 new CT
	const potentialCT = calculateColonyTech(totalValueEarned);
	const newCT = potentialCT - currentColonyTech;
	if (newCT < 10) return false;

	// Suggest when revenue has dropped to 5% of peak
	// (means they've hit a wall)
	if (peakRevenuePerSecond > 0 && currentRevenuePerSecond < peakRevenuePerSecond * 0.05) {
		return true;
	}

	return false;
}

/**
 * Format Colony Tech bonus for display
 */
export function formatColonyTechBonus(colonyTech: number): string {
	const multiplier = calculatePrestigeMultiplier(colonyTech);
	const percent = Math.round((multiplier - 1) * 100);
	return `+${percent}% production speed`;
}
