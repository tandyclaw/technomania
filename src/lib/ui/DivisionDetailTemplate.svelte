<script lang="ts">
	import type { DivisionState } from '$lib/stores/gameState';
	import type { DivisionMeta } from '$lib/divisions';
	import TierCard from './TierCard.svelte';

	let {
		division,
		state,
		cash = 0,
		onBuyTier,
		onTapTier,
	}: {
		division: DivisionMeta;
		state: DivisionState;
		cash?: number;
		onBuyTier?: (tierIndex: number) => void;
		onTapTier?: (tierIndex: number) => number;
	} = $props();

	// Calculate overall division progress
	let unlockedTiers = $derived(state.tiers.filter(t => t.unlocked).length);
	let totalTiers = $derived(state.tiers.length);
	let progressPercent = $derived(Math.round((unlockedTiers / totalTiers) * 100));

	// Total owned units across all tiers
	let totalOwned = $derived(state.tiers.reduce((sum, t) => sum + t.count, 0));
</script>

<div class="division-detail space-y-4">
	<!-- Division header -->
	<div class="flex items-center gap-3">
		<div
			class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
			style="background-color: {division.color}12; border: 1px solid {division.color}25;"
		>
			{division.icon}
		</div>
		<div class="flex-1 min-w-0">
			<h1 class="text-xl font-bold truncate" style="color: {division.color};">
				{division.name}
			</h1>
			<p class="text-xs text-text-secondary mt-0.5">{division.description}</p>
			<!-- Progress bar -->
			<div class="flex items-center gap-2 mt-1.5">
				<div class="flex-1 h-1.5 bg-bg-tertiary/40 rounded-full overflow-hidden">
					<div
						class="h-full rounded-full transition-all duration-500 ease-out"
						style="width: {progressPercent}%; background-color: {division.color};"
					></div>
				</div>
				<span class="text-[10px] text-text-muted font-mono tabular-nums shrink-0">
					{unlockedTiers}/{totalTiers}
				</span>
			</div>
		</div>
	</div>

	<!-- Quick stats -->
	{#if state.unlocked}
		<div class="grid grid-cols-3 gap-2">
			<div class="bg-bg-secondary/40 rounded-lg p-2 text-center border border-white/[0.03]">
				<div class="text-[10px] text-text-muted uppercase tracking-wider">Tiers</div>
				<div class="text-sm font-bold text-text-primary tabular-nums">{unlockedTiers}/{totalTiers}</div>
			</div>
			<div class="bg-bg-secondary/40 rounded-lg p-2 text-center border border-white/[0.03]">
				<div class="text-[10px] text-text-muted uppercase tracking-wider">Owned</div>
				<div class="text-sm font-bold text-text-primary tabular-nums">{totalOwned}</div>
			</div>
			<div class="bg-bg-secondary/40 rounded-lg p-2 text-center border border-white/[0.03]">
				<div class="text-[10px] text-text-muted uppercase tracking-wider">Chief</div>
				<div class="text-sm font-bold tabular-nums" style="color: {state.chiefLevel > 0 ? division.color : 'var(--color-text-muted)'};">
					{state.chiefLevel > 0 ? `Lv.${state.chiefLevel}` : 'None'}
				</div>
			</div>
		</div>
	{/if}

	<!-- Tier list (scrollable area) -->
	{#if state.unlocked}
		<div class="tier-list space-y-2.5">
			<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider">
				Production Tiers
			</h2>
			{#each state.tiers as tier, i}
				<TierCard
					{tier}
					tierData={division.tiers[i]}
					tierIndex={i}
					chiefLevel={state.chiefLevel}
					color={division.color}
					{cash}
					onBuy={() => onBuyTier?.(i)}
					onTap={onTapTier ? () => onTapTier(i) : undefined}
				/>
			{/each}
		</div>

		<!-- Division chief card -->
		<div class="bg-bg-secondary/30 rounded-xl p-4 border border-white/5">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-sm font-semibold text-text-primary flex items-center gap-1.5">
						<span aria-hidden="true">👔</span>
						Division Chief
					</h3>
					<p class="text-xs text-text-muted mt-0.5">
						{#if state.chiefLevel > 0}
							Level {state.chiefLevel} · Automating production
						{:else}
							Hire a chief to automate production
						{/if}
					</p>
				</div>
				<button
					class="hire-button px-3.5 py-2 rounded-lg text-xs font-semibold
						   bg-neural-purple/15 text-neural-purple border border-neural-purple/20
						   transition-all duration-150 active:scale-95 touch-manipulation"
				>
					{state.chiefLevel > 0 ? 'Upgrade' : 'Hire'}
				</button>
			</div>
		</div>
	{:else}
		<!-- Division locked state -->
		<div class="bg-bg-secondary/30 rounded-xl p-8 border border-white/5 text-center">
			<div class="text-4xl mb-3">🔒</div>
			<h2 class="text-base font-semibold text-text-primary mb-1">Division Locked</h2>
			<p class="text-sm text-text-muted">Complete prerequisites to unlock this division.</p>
		</div>
	{/if}
</div>

<style>
	.hire-button {
		min-height: 40px;
	}
</style>
