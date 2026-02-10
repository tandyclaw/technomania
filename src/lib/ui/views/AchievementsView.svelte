<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { ACHIEVEMENTS, getRarityColor, type AchievementCategory, type AchievementDef } from '$lib/systems/AchievementSystem';
	import { formatCurrency } from '$lib/engine/BigNumber';
	import ShareCard from '$lib/ui/ShareCard.svelte';

	let showShareCard = $state(false);
	let selectedAchievement = $state<AchievementDef | null>(null);

	let gs = $derived($gameState);
	let unlockedIds = $derived(new Set(gs.achievements));
	let timestamps = $derived(gs.achievementTimestamps ?? {});
	let hallOfFame = $derived(gs.hallOfFame ?? { fastestColonyTimes: [], highestIncomePerSec: 0, mostColoniesLaunched: 0, totalCashAllTime: 0 });
	let streak = $derived(gs.dailyRewardStreak ?? 0);
	let unlockedCount = $derived(unlockedIds.size);
	let totalCount = ACHIEVEMENTS.length;

	// Recently unlocked (last 5, sorted newest first)
	let recentlyUnlocked = $derived(
		ACHIEVEMENTS
			.filter(a => unlockedIds.has(a.id) && timestamps[a.id])
			.sort((a, b) => (timestamps[b.id] ?? 0) - (timestamps[a.id] ?? 0))
			.slice(0, 5)
	);

	const categories: { key: AchievementCategory; label: string; icon: string }[] = [
		{ key: 'income', label: 'Income', icon: '💰' },
		{ key: 'divisions', label: 'Divisions', icon: '🏢' },
		{ key: 'production', label: 'Production', icon: '🏭' },
		{ key: 'prestige', label: 'Colonies', icon: '🪐' },
		{ key: 'special', label: 'Special', icon: '⭐' },
	];

	function formatDate(ts: number): string {
		return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	let achievementsByCategory = $derived(
		categories.map(cat => ({
			...cat,
			achievements: ACHIEVEMENTS.filter(a => a.category === cat.key),
		}))
	);

	function handleAchievementClick(ach: AchievementDef) {
		if (ach.hidden && !unlockedIds.has(ach.id)) return;
		selectedAchievement = ach;
	}
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
	<div class="w-full h-2 rounded-full bg-bg-tertiary overflow-hidden" role="progressbar" aria-valuenow={unlockedCount} aria-valuemin={0} aria-valuemax={totalCount} aria-label="Achievement progress: {unlockedCount} of {totalCount}">
		<div
			class="h-full rounded-full transition-all duration-500"
			style="width: {(unlockedCount / totalCount) * 100}%; background: linear-gradient(90deg, #FFCC44, #FF8844);"
		></div>
	</div>

	<!-- Recently Unlocked -->
	{#if recentlyUnlocked.length > 0}
		<div>
			<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
				🎉 Recently Unlocked
			</h2>
			<div class="flex gap-2 overflow-x-auto pb-1">
				{#each recentlyUnlocked as ach}
					<button
						onclick={() => handleAchievementClick(ach)}
						class="flex-shrink-0 rounded-xl border border-solar-gold/30 bg-solar-gold/10 p-2.5 flex items-center gap-2 min-w-[140px] touch-manipulation"
					>
						<span class="text-2xl">{ach.icon}</span>
						<div class="text-left">
							<div class="text-[11px] font-bold text-text-primary truncate">{ach.name}</div>
							<div class="text-[9px] font-medium" style="color: {getRarityColor(ach.rarity)}">{ach.rarity}</div>
						</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	{#each achievementsByCategory as cat}
		<div>
			<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
				{cat.icon} {cat.label}
			</h2>
			<div class="grid grid-cols-2 gap-2">
				{#each cat.achievements as ach}
					{@const isUnlocked = unlockedIds.has(ach.id)}
					{@const isHidden = ach.hidden && !isUnlocked}
					<button
						onclick={() => handleAchievementClick(ach)}
						class="rounded-xl border p-3 transition-all duration-200 text-left touch-manipulation
							{isUnlocked
								? 'bg-bg-secondary/60 border-solar-gold/20'
								: isHidden
									? 'bg-bg-secondary/10 border-white/3 opacity-30'
									: 'bg-bg-secondary/20 border-white/5 opacity-50'}"
					>
						<div class="flex items-start gap-2">
							<span class="text-2xl leading-none {isUnlocked ? '' : 'grayscale'}">
								{#if isHidden}
									<span class="blur-sm select-none">❓</span>
								{:else}
									{isUnlocked ? ach.icon : '🔒'}
								{/if}
							</span>
							<div class="flex-1 min-w-0">
								<h3 class="text-xs font-bold truncate {isUnlocked ? 'text-text-primary' : 'text-text-muted'}">
									{isHidden ? '???' : ach.name}
								</h3>
								{#if isHidden}
									<p class="text-[10px] text-text-muted mt-0.5 italic">Secret achievement</p>
								{:else}
									<p class="text-[10px] text-text-muted mt-0.5 line-clamp-2">
										{ach.description}
									</p>
								{/if}
								<div class="flex items-center gap-1.5 mt-1">
									{#if isUnlocked}
										<p class="text-[9px] text-solar-gold font-medium">✓ Unlocked</p>
									{/if}
									{#if !isHidden}
										<span class="text-[9px] font-semibold" style="color: {getRarityColor(ach.rarity)}">
											{ach.rarity}
										</span>
									{/if}
								</div>
							</div>
						</div>
					</button>
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

		<!-- Share button -->
		<button
			onclick={() => showShareCard = true}
			class="w-full mt-3 py-2.5 px-4 rounded-xl bg-white/5 text-text-secondary font-medium text-xs
				   transition-all active:scale-95 touch-manipulation hover:bg-white/10 border border-white/5"
		>
			📤 Share Your Stats
		</button>
	</div>
</div>

<!-- Achievement Detail Popup -->
{#if selectedAchievement}
	{@const ach = selectedAchievement}
	{@const isUnlocked = unlockedIds.has(ach.id)}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
		onclick={() => selectedAchievement = null}
		onkeydown={(e) => { if (e.key === 'Escape') selectedAchievement = null; }}
		role="dialog"
		aria-modal="true"
		aria-label="{ach.name} achievement details"
		tabindex="-1"
	>
		<div
			class="bg-bg-primary border border-white/10 rounded-2xl p-5 max-w-xs w-full shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="flex items-center gap-3 mb-3">
				<span class="text-4xl">{isUnlocked ? ach.icon : '🔒'}</span>
				<div>
					<h3 class="text-base font-bold text-text-primary">{ach.name}</h3>
					<span class="text-xs font-semibold" style="color: {getRarityColor(ach.rarity)}">{ach.rarity}</span>
				</div>
			</div>
			<p class="text-sm text-text-secondary mb-3">{ach.description}</p>
			{#if isUnlocked && timestamps[ach.id]}
				<p class="text-xs text-solar-gold">✓ Unlocked {formatDate(timestamps[ach.id])}</p>
			{:else if isUnlocked}
				<p class="text-xs text-solar-gold">✓ Unlocked</p>
			{:else}
				<p class="text-xs text-text-muted">🔒 Not yet unlocked</p>
			{/if}
			{#if ach.hidden}
				<p class="text-[10px] text-purple-400 mt-1">🔮 Secret Achievement</p>
			{/if}
			<button
				onclick={() => selectedAchievement = null}
				class="w-full mt-4 py-2 rounded-lg bg-white/5 text-text-secondary text-xs font-medium hover:bg-white/10 transition-colors touch-manipulation"
			>
				Close
			</button>
		</div>
	</div>
{/if}

{#if showShareCard}
	<ShareCard milestone="custom" headline="Check out my Moonshot stats!" onClose={() => showShareCard = false} />
{/if}
