/**
 * DailyRewardSystem.ts — Daily login rewards with streak tracking
 */

export interface DailyRewardTier {
	day: number;
	cash: number;
	label: string;
	bonus?: string;
}

export const DAILY_REWARDS: DailyRewardTier[] = [
	{ day: 1, cash: 1_000, label: '$1K' },
	{ day: 2, cash: 5_000, label: '$5K' },
	{ day: 3, cash: 25_000, label: '$25K' },
	{ day: 4, cash: 100_000, label: '$100K' },
	{ day: 5, cash: 250_000, label: '$250K' },
	{ day: 6, cash: 500_000, label: '$500K' },
	{ day: 7, cash: 1_000_000, label: '$1M', bonus: '🌟 Weekly Bonus!' },
];

/**
 * Get the start of a calendar day (midnight) in local time
 */
function dayStart(ts: number): number {
	const d = new Date(ts);
	d.setHours(0, 0, 0, 0);
	return d.getTime();
}

/**
 * Check if a daily reward is available and compute streak info.
 */
export function checkDailyReward(
	lastClaimDate: number,
	currentStreak: number,
	now: number = Date.now()
): { available: boolean; newStreak: number; reward: DailyRewardTier } {
	const todayStart = dayStart(now);
	const lastStart = lastClaimDate > 0 ? dayStart(lastClaimDate) : 0;
	const oneDayMs = 24 * 60 * 60 * 1000;

	// Already claimed today
	if (lastStart === todayStart) {
		const rewardIdx = Math.min(currentStreak - 1, DAILY_REWARDS.length - 1);
		return { available: false, newStreak: currentStreak, reward: DAILY_REWARDS[Math.max(0, rewardIdx)] };
	}

	// Check if streak continues (claimed yesterday) or resets
	let newStreak: number;
	if (lastStart === todayStart - oneDayMs && currentStreak > 0) {
		// Consecutive day
		newStreak = currentStreak + 1;
		if (newStreak > 7) newStreak = 1; // Reset cycle after day 7
	} else {
		// Missed a day or first time
		newStreak = 1;
	}

	const rewardIdx = Math.min(newStreak - 1, DAILY_REWARDS.length - 1);
	return { available: true, newStreak, reward: DAILY_REWARDS[rewardIdx] };
}
