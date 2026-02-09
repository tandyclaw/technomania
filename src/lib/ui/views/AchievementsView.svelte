<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { ACHIEVEMENTS, type AchievementCategory } from '$lib/systems/AchievementSystem';

	let unlockedIds = $derived(new Set($gameState.achievements));
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
</div>
