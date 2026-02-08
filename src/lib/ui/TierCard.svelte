<script lang="ts">
	import type { TierState } from '$lib/stores/gameState';
	import type { TierData } from '$lib/divisions';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';
	import { calculateCost, calculateRevenue, calculateProductionTime } from '$lib/systems/ProductionSystem';

	let {
		tier,
		tierData,
		tierIndex,
		chiefLevel = 0,
		color,
		onBuy,
	}: {
		tier: TierState;
		tierData: TierData;
		tierIndex: number;
		chiefLevel?: number;
		color: string;
		onBuy?: () => void;
	} = $props();

	let cost = $derived(calculateCost(tierData.config, tier.count));
	let revenue = $derived(calculateRevenue(tierData.config, tier.count, tier.level));
	let prodTimeMs = $derived(calculateProductionTime(tierData.config, chiefLevel));
	let revenuePerSec = $derived(tier.count > 0 ? (revenue / prodTimeMs) * 1000 : 0);

	let costDisplay = $derived(formatCurrency(cost));
	let revenueDisplay = $derived(formatCurrency(revenuePerSec, 1));
</script>

<div
	class="tier-card relative rounded-xl border transition-all duration-200 overflow-hidden
		{tier.unlocked
			? 'bg-bg-secondary/60 border-white/5 hover:border-white/10'
			: 'bg-bg-secondary/20 border-white/[0.02] opacity-40'}"
>
	<div class="p-3.5 flex items-start gap-3">
		<!-- Tier badge -->
		<div class="shrink-0 flex flex-col items-center gap-1">
			<div
				class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
				style="background-color: {tier.unlocked ? color + '15' : 'transparent'};
					   color: {tier.unlocked ? color : 'var(--color-text-muted)'};"
			>
				T{tierIndex + 1}
			</div>
			{#if tier.unlocked && tier.count > 0}
				<span
					class="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
					style="background-color: {color}15; color: {color};"
				>
					×{tier.count}
				</span>
			{/if}
		</div>

		<!-- Info section -->
		<div class="flex-1 min-w-0">
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0">
					<h3 class="text-sm font-semibold text-text-primary truncate">
						{tierData.name}
					</h3>
					{#if tier.unlocked}
						<p class="text-xs text-text-muted mt-0.5 line-clamp-1">
							{tierData.description}
						</p>
					{:else}
						<p class="text-xs text-text-muted mt-0.5">
							🔒 Unlock previous tier to access
						</p>
					{/if}
				</div>
			</div>

			{#if tier.unlocked}
				<!-- Stats row -->
				<div class="flex items-center gap-3 mt-2">
					<!-- Production rate -->
					<div class="flex items-center gap-1">
						<span class="text-[10px] text-text-muted uppercase tracking-wider">Rate</span>
						<span class="text-xs font-semibold tabular-nums" style="color: {color};">
							{tier.count > 0 ? revenueDisplay + '/s' : '—'}
						</span>
					</div>

					<!-- Level -->
					<div class="flex items-center gap-1">
						<span class="text-[10px] text-text-muted uppercase tracking-wider">Lvl</span>
						<span class="text-xs font-semibold text-text-primary tabular-nums">
							{tier.level}
						</span>
					</div>

					{#if tierData.powerMW && tier.count > 0}
						<!-- Power output (for Helios) -->
						<div class="flex items-center gap-1">
							<span class="text-[10px]" aria-hidden="true">⚡</span>
							<span class="text-xs font-semibold text-solar-gold tabular-nums">
								{formatNumber(tierData.powerMW * tier.count, 1)} MW
							</span>
						</div>
					{/if}
				</div>

				<!-- Buy / Upgrade button -->
				<div class="mt-2.5">
					<button
						onclick={() => onBuy?.()}
						class="buy-button w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold
							   transition-all duration-150 active:scale-[0.97] touch-manipulation"
						style="background-color: {color}15; color: {color}; border: 1px solid {color}25;"
					>
						<span>
							{tier.count === 0 ? 'Build' : 'Buy'}
						</span>
						<span class="font-mono tabular-nums opacity-80">
							{costDisplay}
						</span>
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Production progress bar -->
	{#if tier.producing && tier.unlocked}
		<div class="h-1 bg-bg-tertiary/30">
			<div
				class="h-full transition-all duration-100 ease-linear"
				style="width: {tier.progress * 100}%; background-color: {color};"
			></div>
		</div>
	{/if}
</div>

<style>
	/* Ensure touch-friendly tap target for the buy button */
	.buy-button {
		min-height: 40px;
	}
</style>
