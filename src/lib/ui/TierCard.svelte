<script lang="ts">
	import type { TierState } from '$lib/stores/gameState';
	import type { TierData } from '$lib/divisions';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';
	import { calculateCost, calculateRevenue, getCycleDurationMs, calculateBulkCost, calculateMaxBuyable } from '$lib/systems/ProductionSystem';
	import { buyQuantity, type BuyQuantity } from '$lib/stores/buyQuantity';
	import SmoothProgressBar from './SmoothProgressBar.svelte';

	let {
		tier,
		tierData,
		tierIndex,
		chiefLevel = 0,
		color,
		cash = 0,
		onBuy,
		onTap,
	}: {
		tier: TierState;
		tierData: TierData;
		tierIndex: number;
		chiefLevel?: number;
		color: string;
		cash?: number;
		onBuy?: () => void;
		onTap?: () => boolean;
	} = $props();

	// Buy quantity from global toggle
	let qty = $derived($buyQuantity);

	// Effective quantity for display — for 'max', compute how many we can afford
	let effectiveQty = $derived.by(() => {
		if (qty === 'max') {
			return calculateMaxBuyable(tierData.config, tier.count, cash);
		}
		return qty;
	});

	// Cost calculation based on quantity
	let cost = $derived.by(() => {
		if (effectiveQty <= 0) return calculateCost(tierData.config, tier.count);
		if (effectiveQty === 1) return calculateCost(tierData.config, tier.count);
		return calculateBulkCost(tierData.config, tier.count, effectiveQty);
	});

	let revenue = $derived(calculateRevenue(tierData.config, tier.count, tier.level));
	let cycleDurationMs = $derived(getCycleDurationMs(tierData.config, chiefLevel));
	let revenuePerSec = $derived(tier.count > 0 ? (revenue / cycleDurationMs) * 1000 : 0);
	let canAfford = $derived(cash >= cost && effectiveQty > 0);

	let costDisplay = $derived(formatCurrency(cost));
	let revenueDisplay = $derived(formatCurrency(revenuePerSec, 1));
	let revenuePerCycle = $derived(formatCurrency(revenue));

	// Buy button label
	let buyLabel = $derived.by(() => {
		if (tier.count === 0 && effectiveQty <= 1) return 'Build';
		if (qty === 'max') return effectiveQty > 0 ? `Buy ×${effectiveQty}` : 'Buy';
		if (qty === 1) return tier.count === 0 ? 'Build' : 'Buy';
		return `Buy ×${effectiveQty}`;
	});

	// Format cycle duration for display
	let cycleDurationDisplay = $derived(formatCycleDuration(cycleDurationMs));

	function formatCycleDuration(ms: number): string {
		if (ms < 1000) return `${Math.round(ms)}ms`;
		if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
		const mins = Math.floor(ms / 60000);
		const secs = Math.floor((ms % 60000) / 1000);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	// Time remaining display
	let timeRemainingMs = $derived(
		tier.producing ? Math.max(0, (1 - tier.progress) * cycleDurationMs) : 0
	);
	let timeDisplay = $derived(formatTimeRemaining(timeRemainingMs));

	function formatTimeRemaining(ms: number): string {
		if (ms <= 0) return '0.0s';
		if (ms < 1000) return `0.${Math.ceil(ms / 100)}s`;
		if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
		const mins = Math.floor(ms / 60000);
		const secs = Math.floor((ms % 60000) / 1000);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	// Tap feedback state
	let tapRipple = $state(false);

	// Payout popup state
	let payoutPopups = $state<{ id: number; amount: string; x: number; y: number }[]>([]);
	let popupCounter = $state(0);

	// Track previous producing state to detect completion
	let prevProducing = $state(false);
	let prevProgress = $state(0);

	// Listen for production completion (progress went from high to low/stopped)
	$effect(() => {
		const justCompleted = prevProducing && !tier.producing && prevProgress > 0.5;
		const cycleCompleted = tier.producing && tier.progress < prevProgress && prevProgress > 0.8;

		if ((justCompleted || cycleCompleted) && revenue > 0) {
			// Show payout popup at center of card
			const id = ++popupCounter;
			payoutPopups = [...payoutPopups, { id, amount: `+${formatCurrency(revenue)}`, x: 50, y: 30 }];
			setTimeout(() => {
				payoutPopups = payoutPopups.filter(p => p.id !== id);
			}, 1200);
		}

		prevProducing = tier.producing;
		prevProgress = tier.progress;
	});

	function handleTap(event: MouseEvent | TouchEvent) {
		if (!tier.unlocked || tier.count === 0 || !onTap) return;

		// If already producing, tap does nothing (AdCap style)
		if (tier.producing) return;

		const started = onTap();
		if (!started) return;

		// Trigger ripple
		tapRipple = true;
		setTimeout(() => { tapRipple = false; }, 400);
	}

	function handleBuy(event: MouseEvent) {
		event.stopPropagation();
		onBuy?.();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="tier-card relative rounded-xl border transition-all duration-200 overflow-hidden select-none
		{tier.unlocked
			? tier.count > 0
				? 'bg-bg-secondary/60 border-white/5 hover:border-white/10 cursor-pointer'
				: 'bg-bg-secondary/60 border-white/5'
			: 'bg-bg-secondary/20 border-white/[0.02] opacity-40'}"
	onclick={handleTap}
	data-tutorial-id="tier-card-{tierIndex}"
>
	<!-- Tap ripple overlay -->
	{#if tapRipple}
		<div class="tap-ripple absolute inset-0 pointer-events-none z-10" style="background-color: {color};"></div>
	{/if}

	<!-- Payout popups -->
	{#each payoutPopups as popup (popup.id)}
		<div
			class="payout-popup absolute pointer-events-none z-20 font-bold text-sm font-mono whitespace-nowrap"
			style="left: {popup.x}%; top: {popup.y}%; color: {color};"
		>
			{popup.amount}
		</div>
	{/each}

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
				<div class="flex items-center gap-3 mt-2 flex-wrap">
					{#if tier.count > 0}
						<!-- Revenue per cycle -->
						<div class="flex items-center gap-1">
							<span class="text-[10px] text-text-muted uppercase tracking-wider">Earn</span>
							<span class="text-xs font-semibold tabular-nums" style="color: {color};">
								{revenuePerCycle}
							</span>
						</div>

						<!-- Cycle duration -->
						<div class="flex items-center gap-1">
							<span class="text-[10px] text-text-muted uppercase tracking-wider">Cycle</span>
							<span class="text-xs font-semibold tabular-nums text-text-secondary">
								{cycleDurationDisplay}
							</span>
						</div>

						<!-- Revenue per second (if automated or fast enough) -->
						{#if chiefLevel > 0}
							<div class="flex items-center gap-1">
								<span class="text-[10px] text-text-muted uppercase tracking-wider">Rate</span>
								<span class="text-xs font-semibold tabular-nums" style="color: {color};">
									{revenueDisplay}/s
								</span>
							</div>
						{:else if !tier.producing}
							<div class="flex items-center gap-1">
								<span class="text-[10px] text-text-muted uppercase tracking-wider">Tap</span>
								<span class="text-xs font-semibold text-text-secondary">to produce</span>
							</div>
						{/if}

						{#if tierData.powerMW}
							{@const totalPower = tierData.powerMW * tier.count}
							<div class="flex items-center gap-1">
								<span class="text-[10px]" aria-hidden="true">⚡</span>
								<span class="text-xs font-semibold tabular-nums"
									class:text-solar-gold={totalPower > 0}
									class:text-rocket-red={totalPower < 0}
								>
									{totalPower > 0 ? '+' : ''}{formatNumber(Math.abs(totalPower), 2)} MW
								</span>
							</div>
						{/if}
					{/if}
				</div>

				<!-- Production progress bar (always visible when count > 0) -->
				{#if tier.count > 0}
					<div class="mt-2">
						{#if tier.producing}
							<div class="flex items-center justify-between mb-1">
								<span class="text-[10px] text-text-muted uppercase tracking-wider font-medium">
									Producing...
								</span>
								<span
									class="text-[10px] font-mono tabular-nums font-semibold"
									style="color: {color};"
								>
									{timeDisplay}
								</span>
							</div>
						{/if}
						<div
							class="w-full rounded-full overflow-hidden"
							style="height: 8px; background-color: var(--color-bg-tertiary);"
							role="progressbar"
							aria-valuenow={Math.round(tier.progress * 100)}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-label="Production progress"
						>
							<SmoothProgressBar
								producing={tier.producing}
								progress={tier.progress}
								{cycleDurationMs}
								{color}
							/>
						</div>
					</div>
				{/if}

				<!-- Buy button -->
				<div class="mt-2.5">
					<button
						onclick={handleBuy}
						data-tutorial-id="tier-buy-{tierIndex}"
						class="buy-button w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold
							   transition-all duration-150 active:scale-[0.97] touch-manipulation"
						style="background-color: {canAfford ? color + '15' : 'var(--color-bg-tertiary)'};
							   color: {canAfford ? color : 'var(--color-text-muted)'};
							   border: 1px solid {canAfford ? color + '25' : 'transparent'};"
						disabled={!canAfford}
					>
						<span>
							{buyLabel}
						</span>
						<span class="font-mono tabular-nums opacity-80">
							{costDisplay}
						</span>
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.buy-button {
		min-height: 40px;
	}

	.buy-button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.tap-ripple {
		animation: rippleFade 0.4s ease-out forwards;
	}

	@keyframes rippleFade {
		0% { opacity: 0.15; }
		100% { opacity: 0; }
	}

	.payout-popup {
		animation: payoutFloat 1.2s ease-out forwards;
		transform: translate(-50%, -100%);
	}

	@keyframes payoutFloat {
		0% {
			opacity: 1;
			transform: translate(-50%, -100%) translateY(0) scale(1);
		}
		20% {
			transform: translate(-50%, -100%) translateY(-5px) scale(1.2);
		}
		70% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -100%) translateY(-45px) scale(0.9);
		}
	}

	.tier-card {
		-webkit-tap-highlight-color: transparent;
	}
</style>
