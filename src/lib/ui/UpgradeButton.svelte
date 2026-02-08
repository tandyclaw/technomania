<script lang="ts">
	import { formatCurrency } from '$lib/engine/BigNumber';
	import { calculateCost } from '$lib/systems/ProductionSystem';
	import type { ProductionConfig } from '$lib/systems/ProductionSystem';

	export type QuantityMode = 1 | 10 | 100 | 'max';

	let {
		label = 'Buy',
		cost,
		canAfford = false,
		color = '#4488FF',
		quantity = 1 as QuantityMode,
		showQuantitySelector = false,
		disabled = false,
		onBuy,
		onQuantityChange,
	}: {
		label?: string;
		cost: number;
		canAfford?: boolean;
		color?: string;
		quantity?: QuantityMode;
		showQuantitySelector?: boolean;
		disabled?: boolean;
		onBuy?: () => void;
		onQuantityChange?: (qty: QuantityMode) => void;
	} = $props();

	let pressing = $state(false);
	let justBought = $state(false);

	const quantityOptions: QuantityMode[] = [1, 10, 100, 'max'];

	let costDisplay = $derived(formatCurrency(cost));
	let quantityLabel = $derived(quantity === 'max' ? 'MAX' : `×${quantity}`);

	let isEnabled = $derived(canAfford && !disabled);

	function handleClick() {
		if (!isEnabled) return;
		onBuy?.();

		// Trigger bought feedback animation
		justBought = true;
		setTimeout(() => { justBought = false; }, 300);
	}

	function handlePointerDown() {
		if (isEnabled) pressing = true;
	}

	function handlePointerUp() {
		pressing = false;
	}

	function selectQuantity(qty: QuantityMode) {
		onQuantityChange?.(qty);
	}
</script>

<div class="upgrade-button-wrapper">
	{#if showQuantitySelector}
		<div class="flex items-center gap-1 mb-1.5">
			{#each quantityOptions as opt}
				{@const isActive = quantity === opt}
				<button
					onclick={() => selectQuantity(opt)}
					class="qty-chip flex-1 text-[10px] font-bold py-1 px-1.5 rounded-md
						   transition-all duration-150 touch-manipulation
						   {isActive
							? 'text-white'
							: 'bg-bg-tertiary/40 text-text-muted hover:text-text-secondary'}"
					style={isActive ? `background-color: ${color}30; color: ${color};` : ''}
				>
					{opt === 'max' ? 'MAX' : `×${opt}`}
				</button>
			{/each}
		</div>
	{/if}

	<button
		onclick={handleClick}
		onpointerdown={handlePointerDown}
		onpointerup={handlePointerUp}
		onpointerleave={handlePointerUp}
		{disabled}
		class="upgrade-btn w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg
			   font-semibold text-sm transition-all duration-150 touch-manipulation select-none
			   {isEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}
			   {pressing ? 'scale-[0.96]' : ''}
			   {justBought ? 'bought-flash' : ''}"
		style="
			background-color: {isEnabled ? color + '15' : 'var(--color-bg-tertiary)'};
			color: {isEnabled ? color : 'var(--color-text-muted)'};
			border: 1px solid {isEnabled ? color + '30' : 'transparent'};
			{isEnabled ? `box-shadow: 0 0 12px ${color}15, inset 0 1px 0 ${color}10;` : ''}
		"
		aria-label="{label} for {costDisplay}"
	>
		<span class="flex items-center gap-1.5">
			<span>{label}</span>
			{#if showQuantitySelector}
				<span class="text-xs opacity-60">{quantityLabel}</span>
			{/if}
		</span>
		<span class="font-mono tabular-nums text-xs opacity-80">
			{costDisplay}
		</span>
	</button>
</div>

<style>
	.upgrade-btn {
		min-height: 44px;
		-webkit-tap-highlight-color: transparent;
	}

	.qty-chip {
		min-height: 28px;
		-webkit-tap-highlight-color: transparent;
	}

	/* Green glow when affordable — pulsing subtle effect */
	.upgrade-btn:not([disabled]):not(.opacity-40) {
		animation: affordableGlow 2s ease-in-out infinite;
	}

	@keyframes affordableGlow {
		0%, 100% { filter: brightness(1); }
		50% { filter: brightness(1.08); }
	}

	/* Quick flash on successful purchase */
	.bought-flash {
		animation: buyFlash 0.3s ease-out !important;
	}

	@keyframes buyFlash {
		0% { filter: brightness(1.5); transform: scale(0.96); }
		100% { filter: brightness(1); transform: scale(1); }
	}
</style>
