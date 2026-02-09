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
	import { ngPlusCostMultiplier } from '$lib/stores/ngPlus';
	import { getActiveBottlenecks, resolveBottleneck, resolveBottleneckWithRP, startBottleneckWait, getBottleneckDef, type BottleneckDef } from '$lib/systems/BottleneckSystem';
	import { buyQuantity } from '$lib/stores/buyQuantity';

	import { gameState } from '$lib/stores/gameState';
	import { formatCurrency } from '$lib/engine/BigNumber';
	import { calculateRevenue, getCycleDurationMs } from '$lib/systems/ProductionSystem';
	import MilestonePanel from './MilestonePanel.svelte';

	// Division income calculation for stats summary
	function getDivIncomePerSec(): number {
		let total = 0;
		for (let i = 0; i < state.tiers.length; i++) {
			const t = state.tiers[i];
			if (!t.unlocked || t.count === 0) continue;
			const td = division.tiers[i];
			if (!td) continue;
			const rev = calculateRevenue(td.config, t.count, t.level);
			const dur = getCycleDurationMs(td.config, state.chiefLevel);
			total += (rev / dur) * 1000;
		}
		return total;
	}
	import WorkerPanel from './WorkerPanel.svelte';
	import { getDivisionStars, canPrestigeDivision, getDivisionPrestigeRequirements, prestigeDivision } from '$lib/systems/DivisionPrestigeSystem';
	import { getWorkersForDivision } from '$lib/systems/WorkerSystem';

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

	// Division stars and prestige
	let divisionStars = $derived(getDivisionStars($gameState, division.id));
	let canPrestige = $derived(canPrestigeDivision($gameState, division.id));
	let workers = $derived(getWorkersForDivision($gameState, division.id));
	let workerBonus = $derived(workers * 2);
	let showPrestigeConfirm = $state(false);

	function handlePrestigeDivision() {
		prestigeDivision(division.id);
		showPrestigeConfirm = false;
	}

	// Calculate overall division progress
	let unlockedTiers = $derived(state.tiers.filter(t => t.unlocked).length);
	let totalTiers = $derived(state.tiers.length);
	let progressPercent = $derived(Math.round((unlockedTiers / totalTiers) * 100));

	// Total owned units across all tiers
	let totalOwned = $derived(state.tiers.reduce((sum, t) => sum + t.count, 0));

	// Count of tiers that are idle (ready to tap) and not automated
	let readyToCollectCount = $derived(
		state.tiers.filter((t, i) => t.unlocked && t.count > 0 && !t.producing && state.chiefLevel === 0).length
	);

	function handleCollectAll() {
		state.tiers.forEach((t, i) => {
			if (t.unlocked && t.count > 0 && !t.producing && state.chiefLevel === 0) {
				onTapTier?.(i);
			}
		});
	}

	let showStatsSummary = $state(false);
	let divIncomePerSec = $derived(getDivIncomePerSec());

	// Check if previous tier is owned (has count > 0) for unlock gating
	function isPreviousTierOwned(tierIndex: number): boolean {
		if (tierIndex === 0) return true; // First tier always available
		const prevTier = state.tiers[tierIndex - 1];
		return prevTier ? prevTier.count > 0 : false;
	}
</script>

<div class="division-detail space-y-4">
	<!-- Division header (tap to toggle stats) -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="flex items-center gap-3 cursor-pointer active:opacity-80 touch-manipulation" onclick={() => showStatsSummary = !showStatsSummary}
		<div
			class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
			style="background-color: {division.color}12; border: 1px solid {division.color}25;"
		>
			{division.icon}
		</div>
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2">
				<h1 class="text-xl font-bold truncate" style="color: {division.color};">
					{division.name}
				</h1>
				{#if divisionStars > 0}
					<span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-solar-gold/20 text-solar-gold border border-solar-gold/30">
						⭐ {divisionStars}
					</span>
				{/if}
			</div>
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

	<!-- Pull-down stats summary (tap header to toggle) -->
	{#if state.unlocked && showStatsSummary}
		<div class="bg-bg-secondary/60 rounded-xl border border-white/5 p-3 space-y-2 animate-slide-down">
			<div class="flex items-center justify-between">
				<span class="text-xs text-text-muted uppercase tracking-wider font-medium">Division Stats</span>
				<button onclick={() => showStatsSummary = false} class="text-[10px] text-text-muted">▲ Close</button>
			</div>
			<div class="grid grid-cols-2 gap-2 text-xs">
				<div class="bg-bg-tertiary/30 rounded-lg p-2">
					<div class="text-text-muted">Income/s</div>
					<div class="font-bold font-mono tabular-nums" style="color: {division.color};">{formatCurrency(divIncomePerSec, 2)}/s</div>
				</div>
				<div class="bg-bg-tertiary/30 rounded-lg p-2">
					<div class="text-text-muted">Total Owned</div>
					<div class="font-bold text-text-primary">{totalOwned} units</div>
				</div>
				<div class="bg-bg-tertiary/30 rounded-lg p-2">
					<div class="text-text-muted">Tiers Unlocked</div>
					<div class="font-bold text-text-primary">{unlockedTiers}/{totalTiers}</div>
				</div>
				<div class="bg-bg-tertiary/30 rounded-lg p-2">
					<div class="text-text-muted">Automation</div>
					<div class="font-bold" style="color: {state.chiefLevel > 0 ? division.color : 'var(--color-text-muted)'};">
						{state.chiefLevel > 0 ? `Chief Lv.${state.chiefLevel}` : 'Manual'}
					</div>
				</div>
			</div>
		</div>
	{/if}

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

	<!-- Star & Worker bonuses -->
	{#if state.unlocked && (divisionStars > 0 || workers > 0)}
		<div class="flex gap-2">
			{#if divisionStars > 0}
				<div class="flex-1 bg-solar-gold/10 rounded-lg p-2 text-center border border-solar-gold/20">
					<div class="text-[10px] text-solar-gold uppercase tracking-wider">Star Bonus</div>
					<div class="text-sm font-bold text-solar-gold tabular-nums">+{divisionStars * 10}% rev · +{divisionStars * 5}% spd</div>
				</div>
			{/if}
			{#if workers > 0}
				<div class="flex-1 bg-electric-blue/10 rounded-lg p-2 text-center border border-electric-blue/20">
					<div class="text-[10px] text-electric-blue uppercase tracking-wider">Workers</div>
					<div class="text-sm font-bold text-electric-blue tabular-nums">👷 {workers} · +{workerBonus}%</div>
				</div>
			{/if}
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

	<!-- Milestones panel -->
	{#if state.unlocked}
		<MilestonePanel divisionId={division.id} />
	{/if}

	<!-- Division Prestige -->
	{#if state.unlocked}
		<div class="bg-bg-secondary/40 rounded-xl border border-white/5 p-4">
			<div class="flex items-center justify-between mb-2">
				<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
					<span>⭐</span> Division Prestige
				</h2>
				{#if divisionStars > 0}
					<span class="text-xs font-mono tabular-nums text-solar-gold">{divisionStars} star{divisionStars !== 1 ? 's' : ''}</span>
				{/if}
			</div>
			<p class="text-[11px] text-text-muted mb-3">
				Reset this division to earn a star. Each star: +10% revenue, +5% speed (permanent).
			</p>
			{#if showPrestigeConfirm}
				<div class="bg-rocket-red/10 border border-rocket-red/30 rounded-lg p-3 space-y-2">
					<p class="text-xs text-rocket-red font-semibold">⚠️ This will reset all tiers and counts in {division.name}!</p>
					<div class="flex gap-2">
						<button
							onclick={handlePrestigeDivision}
							class="flex-1 py-2 px-3 rounded-lg bg-solar-gold/20 text-solar-gold text-xs font-bold
								   transition-all active:scale-95 touch-manipulation border border-solar-gold/30"
						>
							⭐ Confirm Reset
						</button>
						<button
							onclick={() => showPrestigeConfirm = false}
							class="flex-1 py-2 px-3 rounded-lg bg-bg-tertiary text-text-muted text-xs font-semibold
								   transition-all active:scale-95 touch-manipulation"
						>
							Cancel
						</button>
					</div>
				</div>
			{:else}
				<button
					onclick={() => showPrestigeConfirm = true}
					disabled={!canPrestige}
					class="w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all active:scale-95 touch-manipulation
						   disabled:opacity-40 disabled:cursor-not-allowed"
					style="background-color: {canPrestige ? 'rgba(255, 204, 68, 0.15)' : 'var(--color-bg-tertiary)'};
						   color: {canPrestige ? '#FFCC44' : 'var(--color-text-muted)'};
						   border: 1px solid {canPrestige ? 'rgba(255, 204, 68, 0.3)' : 'transparent'};"
				>
					⭐ Reset Division for Star
				</button>
			{/if}
		</div>
	{/if}

	<!-- Workers -->
	{#if state.unlocked}
		<WorkerPanel />
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
				<div class="flex items-center gap-2">
					{#if readyToCollectCount >= 2}
						<button
							onclick={handleCollectAll}
							class="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150
								   active:scale-95 touch-manipulation animate-pulse"
							style="background-color: {division.color}20; color: {division.color}; border: 1px solid {division.color}30;"
						>
							▶ Collect All
						</button>
					{/if}
					<BuyQuantityToggle color={division.color} />
				</div>
			</div>
			{#each state.tiers as tier, i}
				{#if tier.unlocked}
					<TierCard
						{tier}
						tierData={division.tiers[i]}
						tierIndex={i}
						divisionId={division.id}
						chiefLevel={state.chiefLevel}
						color={division.color}
						{cash}
						gameState={$gameState}
						onBuy={() => onBuyTier?.(i)}
						onTap={onTapTier ? (() => onTapTier(i)) : undefined}
					/>
				{:else}
					<TierUnlockCard
						tierData={division.tiers[i]}
						tierIndex={i}
						unlockCost={getUnlockCost(division.id, i) * $ngPlusCostMultiplier}
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
