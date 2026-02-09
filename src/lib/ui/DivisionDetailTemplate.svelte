<script lang="ts">
	import type { DivisionState } from '$lib/stores/gameState';
	import type { DivisionMeta } from '$lib/divisions';
	import TierCard from './TierCard.svelte';
	import TierUnlockCard from './TierUnlockCard.svelte';
	import ChiefCard from './ChiefCard.svelte';
	import BottleneckCard from './BottleneckCard.svelte';
	import BuyQuantityToggle from './BuyQuantityToggle.svelte';
	import LaunchCadencePanel from './LaunchCadencePanel.svelte';
	import ProductionRatePanel from './ProductionRatePanel.svelte';
	import { getUnlockCost } from '$lib/engine/ProductionEngine';
	import { getActiveBottlenecks, resolveBottleneck, resolveBottleneckWithRP, startBottleneckWait, getBottleneckDef, type BottleneckDef } from '$lib/systems/BottleneckSystem';
	import { buyQuantity } from '$lib/stores/buyQuantity';

	import { gameState } from '$lib/stores/gameState';

	let {
		division,
		state,
		cash = 0,
		onBuyTier,
		onTapTier,
		onHireChief,
		onUnlockTier,
	}: {
		division: DivisionMeta;
		state: DivisionState;
		cash?: number;
		onBuyTier?: (tierIndex: number) => void;
		onTapTier?: (tierIndex: number) => boolean;
		onHireChief?: () => void;
		onUnlockTier?: (tierIndex: number) => void;
	} = $props();

	// Active bottlenecks for this division
	let activeBottlenecks = $derived(getActiveBottlenecks(division.id, $gameState));
	let researchPoints = $derived($gameState.researchPoints);

	function handleResolveBottleneck(bottleneckId: string) {
		resolveBottleneck(division.id, bottleneckId);
	}

	function handleResolveBottleneckRP(bottleneckId: string) {
		resolveBottleneckWithRP(division.id, bottleneckId);
	}

	function handleStartWait(bottleneckId: string) {
		startBottleneckWait(division.id, bottleneckId);
	}

	// Calculate overall division progress
	let unlockedTiers = $derived(state.tiers.filter(t => t.unlocked).length);
	let totalTiers = $derived(state.tiers.length);
	let progressPercent = $derived(Math.round((unlockedTiers / totalTiers) * 100));

	// Total owned units across all tiers
	let totalOwned = $derived(state.tiers.reduce((sum, t) => sum + t.count, 0));

	// Check if previous tier is owned (has count > 0) for unlock gating
	function isPreviousTierOwned(tierIndex: number): boolean {
		if (tierIndex === 0) return true; // First tier always available
		const prevTier = state.tiers[tierIndex - 1];
		return prevTier ? prevTier.count > 0 : false;
	}
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

	<!-- Division-specific flavor panels (T024, T028) -->
	{#if state.unlocked && division.id === 'spacex'}
		<LaunchCadencePanel color={division.color} />
	{/if}
	{#if state.unlocked && division.id === 'tesla'}
		<ProductionRatePanel color={division.color} />
	{/if}

	<!-- Chief card (THE key hire mechanic) -->
	{#if state.unlocked}
		<ChiefCard
			divisionId={division.id}
			chiefLevel={state.chiefLevel}
			color={division.color}
			{cash}
			onHire={onHireChief}
		/>
	{/if}

	<!-- Active bottlenecks -->
	{#if state.unlocked && activeBottlenecks.length > 0}
		<div class="space-y-2">
			<h2 class="text-xs font-semibold text-rocket-red uppercase tracking-wider flex items-center gap-1.5">
				<span>⚠️</span> Active Bottlenecks
			</h2>
			{#each activeBottlenecks as { state: bState, def } (bState.id)}
				<BottleneckCard
					bottleneck={bState}
					{def}
					{cash}
					{researchPoints}
					color={division.color}
					onResolve={() => handleResolveBottleneck(bState.id)}
					onResolveRP={() => handleResolveBottleneckRP(bState.id)}
					onStartWait={() => handleStartWait(bState.id)}
				/>
			{/each}
		</div>
	{/if}

	<!-- Tier list (scrollable area) -->
	{#if state.unlocked}
		<div class="tier-list space-y-2.5">
			<div class="flex items-center justify-between">
				<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider">
					Production Tiers
				</h2>
				<BuyQuantityToggle color={division.color} />
			</div>
			{#each state.tiers as tier, i}
				{#if tier.unlocked}
					<TierCard
						{tier}
						tierData={division.tiers[i]}
						tierIndex={i}
						chiefLevel={state.chiefLevel}
						color={division.color}
						{cash}
						onBuy={() => onBuyTier?.(i)}
						onTap={onTapTier ? (() => onTapTier(i)) : undefined}
					/>
				{:else}
					<TierUnlockCard
						tierData={division.tiers[i]}
						tierIndex={i}
						unlockCost={getUnlockCost(division.id, i)}
						color={division.color}
						{cash}
						onUnlock={() => onUnlockTier?.(i)}
						isPreviousTierOwned={isPreviousTierOwned(i)}
					/>
				{/if}
			{/each}
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
