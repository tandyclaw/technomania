<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { ALL_MILESTONES, isMilestoneUnlocked, countUnlockedMilestones } from '$lib/systems/MilestoneSystem';
	import { DIVISIONS } from '$lib/divisions';

	let { divisionId }: { divisionId: string } = $props();

	let gs = $derived($gameState);
	let divMeta = $derived(DIVISIONS[divisionId]);
	let counts = $derived(countUnlockedMilestones(divisionId, gs));

	let divMilestones = $derived(
		ALL_MILESTONES
			.filter(m => m.divisionId === divisionId)
			.map(m => {
				const div = gs.divisions[divisionId as keyof typeof gs.divisions];
				const tier = div?.tiers[m.tierIndex];
				const current = tier?.count ?? 0;
				return {
					...m,
					unlocked: isMilestoneUnlocked(m, gs),
					current,
					progress: Math.min(1, current / m.threshold),
				};
			})
	);

	// Group by tier
	let groupedByTier = $derived.by(() => {
		const groups: Map<number, typeof divMilestones> = new Map();
		for (const m of divMilestones) {
			if (!groups.has(m.tierIndex)) groups.set(m.tierIndex, []);
			groups.get(m.tierIndex)!.push(m);
		}
		return groups;
	});
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-bold text-text-primary flex items-center gap-1.5">
			🏅 Milestones
		</h3>
		<span class="text-xs text-text-muted font-mono">
			{counts.unlocked}/{counts.total}
		</span>
	</div>

	{#each [...groupedByTier.entries()] as [tierIdx, milestones]}
		{@const tierName = divMeta?.tiers[tierIdx]?.name ?? `Tier ${tierIdx + 1}`}
		<div class="bg-bg-secondary/40 rounded-lg p-3 border border-white/[0.03]">
			<div class="text-xs font-semibold text-text-secondary mb-2">{tierName}</div>
			<div class="flex gap-2 flex-wrap">
				{#each milestones as m}
					<div
						class="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold
							   {m.unlocked ? 'bg-solar-gold/15 text-solar-gold' : 'bg-bg-tertiary/50 text-text-muted'}"
						title={m.label}
					>
						{#if m.unlocked}
							<span>✅</span>
						{:else}
							<span class="opacity-50">🔒</span>
						{/if}
						<span>{m.threshold}</span>
						<span class="opacity-60">{m.rewardType === 'speed' ? '⚡' : '💰'}{m.multiplier}x</span>
						{#if !m.unlocked}
							<span class="text-text-muted/50">({m.current}/{m.threshold})</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
