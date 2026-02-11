<script lang="ts">
	import { buyQuantity, type BuyQuantity } from '$lib/stores/buyQuantity';

	let { color = '#4488FF' }: { color?: string } = $props();

	const options: BuyQuantity[] = [1, 10, 100, 'max'];

	function getLabel(qty: BuyQuantity): string {
		return qty === 'max' ? 'MAX' : `×${qty}`;
	}

	function select(qty: BuyQuantity) {
		buyQuantity.set(qty);
	}
</script>

<div class="flex items-center gap-1">
	<span class="text-[10px] text-text-muted uppercase tracking-wider font-semibold mr-1">Upgrade</span>
	{#each options as opt}
		{@const isActive = $buyQuantity === opt}
		<button
			onclick={() => select(opt)}
			class="qty-btn text-[11px] font-bold py-1 px-2.5 rounded-lg
				   transition-all duration-150 touch-manipulation select-none"
			style={isActive
				? `background-color: ${color}25; color: ${color}; border: 1px solid ${color}35;`
				: 'background-color: var(--color-bg-tertiary); color: var(--color-text-muted); border: 1px solid transparent;'}
			aria-label="Upgrade quantity: {getLabel(opt)}"
			aria-pressed={isActive}
		>
			{getLabel(opt)}
		</button>
	{/each}
</div>

<style>
	.qty-btn {
		min-width: 38px;
		min-height: 30px;
		-webkit-tap-highlight-color: transparent;
	}

	.qty-btn:active {
		transform: scale(0.95);
	}
</style>
