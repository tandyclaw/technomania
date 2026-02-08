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
		onTap?: () => number;
	} = $props();

	let cost = $derived(calculateCost(tierData.config, tier.count));
	let revenue = $derived(calculateRevenue(tierData.config, tier.count, tier.level));
	let prodTimeMs = $derived(calculateProductionTime(tierData.config, chiefLevel));
	let revenuePerSec = $derived(tier.count > 0 ? (revenue / prodTimeMs) * 1000 : 0);
	let canAfford = $derived(cash >= cost);

	let costDisplay = $derived(formatCurrency(cost));
	let revenueDisplay = $derived(formatCurrency(revenuePerSec, 1));
	let revenuePerCycle = $derived(formatCurrency(revenue));

	// Tap feedback state
	let tapRipple = $state(false);
	let earnPopups = $state<{ id: number; amount: string; x: number; y: number }[]>([]);
	let popupCounter = $state(0);

	function handleTap(event: MouseEvent | TouchEvent) {
		if (!tier.unlocked || tier.count === 0 || !onTap) return;

		const earned = onTap();
		if (earned <= 0) return;

		// Trigger ripple
		tapRipple = true;
		setTimeout(() => { tapRipple = false; }, 400);

		// Create earn popup at tap position
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		let clientX: number, clientY: number;
		if ('touches' in event && event.touches.length > 0) {
			clientX = event.touches[0].clientX;
			clientY = event.touches[0].clientY;
		} else if ('clientX' in event) {
			clientX = event.clientX;
			clientY = event.clientY;
		} else {
			clientX = rect.left + rect.width / 2;
			clientY = rect.top + rect.height / 2;
		}

		const x = clientX - rect.left;
		const y = clientY - rect.top;
		const id = ++popupCounter;

		earnPopups = [...earnPopups, { id, amount: `+${formatCurrency(earned)}`, x, y }];

		// Remove popup after animation
		setTimeout(() => {
			earnPopups = earnPopups.filter(p => p.id !== id);
		}, 1000);
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
>
	<!-- Tap ripple overlay -->
	{#if tapRipple}
		<div class="tap-ripple absolute inset-0 pointer-events-none z-10" style="background-color: {color};"></div>
	{/if}

	<!-- Earn popups -->
	{#each earnPopups as popup (popup.id)}
		<div
			class="earn-popup absolute pointer-events-none z-20 font-bold text-sm font-mono whitespace-nowrap"
			style="left: {popup.x}px; top: {popup.y}px; color: {color};"
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
				<div class="flex items-center gap-3 mt-2">
					{#if tier.count > 0}
						<!-- Revenue per cycle -->
						<div class="flex items-center gap-1">
							<span class="text-[10px] text-text-muted uppercase tracking-wider">Earn</span>
							<span class="text-xs font-semibold tabular-nums" style="color: {color};">
								{revenuePerCycle}
							</span>
						</div>

						<!-- Production rate (if automated) -->
						{#if chiefLevel > 0}
							<div class="flex items-center gap-1">
								<span class="text-[10px] text-text-muted uppercase tracking-wider">Rate</span>
								<span class="text-xs font-semibold tabular-nums" style="color: {color};">
									{revenueDisplay}/s
								</span>
							</div>
						{:else}
							<div class="flex items-center gap-1">
								<span class="text-[10px] text-text-muted uppercase tracking-wider">Tap</span>
								<span class="text-xs font-semibold text-text-secondary">to produce</span>
							</div>
						{/if}

						{#if tierData.powerMW}
							<div class="flex items-center gap-1">
								<span class="text-[10px]" aria-hidden="true">⚡</span>
								<span class="text-xs font-semibold text-solar-gold tabular-nums">
									{formatNumber(tierData.powerMW * tier.count, 1)} MW
								</span>
							</div>
						{/if}
					{/if}
				</div>

				<!-- Buy button -->
				<div class="mt-2.5">
					<button
						onclick={handleBuy}
						class="buy-button w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold
							   transition-all duration-150 active:scale-[0.97] touch-manipulation"
						style="background-color: {canAfford ? color + '15' : 'var(--color-bg-tertiary)'};
							   color: {canAfford ? color : 'var(--color-text-muted)'};
							   border: 1px solid {canAfford ? color + '25' : 'transparent'};"
						disabled={!canAfford}
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
	{#if tier.producing && tier.unlocked && tier.count > 0}
		<div class="h-1.5 bg-bg-tertiary/30">
			<div
				class="h-full transition-all duration-200 ease-linear"
				style="width: {Math.min(tier.progress * 100, 100)}%; background-color: {color};"
			></div>
		</div>
	{/if}
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

	.earn-popup {
		animation: floatUp 1s ease-out forwards;
		transform: translate(-50%, -100%);
	}

	@keyframes floatUp {
		0% {
			opacity: 1;
			transform: translate(-50%, -100%) translateY(0);
		}
		70% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -100%) translateY(-40px);
		}
	}

	.tier-card {
		-webkit-tap-highlight-color: transparent;
	}
</style>
