<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { ACHIEVEMENTS, type AchievementCategory } from '$lib/systems/AchievementSystem';
	import { formatCurrency } from '$lib/engine/BigNumber';

	let gs = $derived($gameState);
	let unlockedIds = $derived(new Set(gs.achievements));
	let hallOfFame = $derived(gs.hallOfFame ?? { fastestColonyTimes: [], highestIncomePerSec: 0, mostColoniesLaunched: 0, totalCashAllTime: 0 });
	let streak = $derived(gs.dailyRewardStreak ?? 0);
	let unlockedCount = $derived(unlockedIds.size);
	let totalCount = ACHIEVEMENTS.length;

	const categories: { key: AchievementCategory; label: string; icon: string }[] = [
		{ key: 'income', label: 'Income', icon: '💰' },
		{ key: 'divisions', label: 'Divisions', icon: '🏢' },
		{ key: 'production', label: 'Production', icon: '🏭' },
		{ key: 'prestige', label: 'Colonies', icon: '🪐' },
		{ key: 'special', label: 'Special', icon: '⭐' },
	];

	function formatDate(ts: number): string {
		return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	}

	// We don't store timestamps per-achievement in current state (just ids),
	// so we show "Unlocked" without date for now
	let achievementsByCategory = $derived(
		categories.map(cat => ({
			...cat,
			achievements: ACHIEVEMENTS.filter(a => a.category === cat.key),
		}))
	);
</script>

<div class="space-y-5">
	<div>
		<h1 class="text-xl font-bold text-text-primary">Achievements</h1>
		<p class="text-sm text-text-secondary mt-0.5">
			<span class="text-solar-gold font-semibold">{unlockedCount}</span> / {totalCount} unlocked
		</p>
	</div>

	<!-- Daily Streak -->
	{#if streak > 0}
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-solar-gold/15 flex items-center gap-3">
			<div class="text-2xl">🔥</div>
			<div>
				<div class="text-sm font-bold text-solar-gold">{streak}-Day Streak</div>
				<div class="text-xs text-text-muted">Keep logging in daily!</div>
			</div>
		</div>
	{/if}

	<!-- Progress bar -->
	<div class="w-full h-2 rounded-full bg-bg-tertiary overflow-hidden">
		<div
			class="h-full rounded-full transition-all duration-500"
			style="width: {(unlockedCount / totalCount) * 100}%; background: linear-gradient(90deg, #FFCC44, #FF8844);"
		></div>
	</div>

	{#each achievementsByCategory as cat}
		<div>
			<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
				{cat.icon} {cat.label}
			</h2>
			<div class="grid grid-cols-2 gap-2">
				{#each cat.achievements as ach}
					{@const isUnlocked = unlockedIds.has(ach.id)}
					<div
						class="rounded-xl border p-3 transition-all duration-200
							{isUnlocked
								? 'bg-bg-secondary/60 border-solar-gold/20'
								: 'bg-bg-secondary/20 border-white/5 opacity-50'}"
					>
						<div class="flex items-start gap-2">
							<span class="text-2xl leading-none {isUnlocked ? '' : 'grayscale'}">
								{isUnlocked ? ach.icon : '🔒'}
							</span>
							<div class="flex-1 min-w-0">
								<h3 class="text-xs font-bold truncate {isUnlocked ? 'text-text-primary' : 'text-text-muted'}">
									{isUnlocked ? ach.name : '???'}
								</h3>
								<p class="text-[10px] text-text-muted mt-0.5 line-clamp-2">
									{ach.description}
								</p>
								{#if isUnlocked}
									<p class="text-[9px] text-solar-gold mt-1 font-medium">✓ Unlocked</p>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}

	<!-- Hall of Fame -->
	<div class="mt-2">
		<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
			🏆 Hall of Fame
		</h2>
		<div class="bg-bg-secondary/60 rounded-xl border border-white/[0.03] divide-y divide-white/5">
			<div class="p-3 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span class="text-lg">🚀</span>
					<div>
						<div class="text-xs font-semibold text-text-primary">Colonies Launched</div>
						<div class="text-[10px] text-text-muted">Total across all playthroughs</div>
					</div>
				</div>
				<span class="text-sm font-bold text-electric-blue tabular-nums">{hallOfFame.mostColoniesLaunched}</span>
			</div>
			<div class="p-3 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span class="text-lg">💰</span>
					<div>
						<div class="text-xs font-semibold text-text-primary">Total Cash Earned</div>
						<div class="text-[10px] text-text-muted">Across all colonies</div>
					</div>
				</div>
				<span class="text-sm font-bold text-bio-green tabular-nums">{formatCurrency(hallOfFame.totalCashAllTime)}</span>
			</div>
			<div class="p-3 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span class="text-lg">⚡</span>
					<div>
						<div class="text-xs font-semibold text-text-primary">Highest Income/s</div>
						<div class="text-[10px] text-text-muted">Personal best</div>
					</div>
				</div>
				<span class="text-sm font-bold text-solar-gold tabular-nums">{formatCurrency(hallOfFame.highestIncomePerSec)}/s</span>
			</div>
			{#if hallOfFame.fastestColonyTimes.length > 0}
				<div class="p-3">
					<div class="flex items-center gap-2 mb-2">
						<span class="text-lg">⏱️</span>
						<div class="text-xs font-semibold text-text-primary">Fastest Colony Times</div>
					</div>
					<div class="space-y-1.5">
						{#each hallOfFame.fastestColonyTimes.sort((a, b) => a.planetIndex - b.planetIndex) as record}
							<div class="flex items-center justify-between text-xs">
								<span class="text-text-secondary">{record.planetName}</span>
								<span class="font-mono text-text-primary tabular-nums">
									{Math.floor(record.timeMs / 3600000)}h {Math.floor((record.timeMs % 3600000) / 60000)}m
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
