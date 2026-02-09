<script lang="ts">
	import type { TierData } from '$lib/divisions';
	import { formatCurrency } from '$lib/engine/BigNumber';
	import Tooltip from './Tooltip.svelte';

	let {
		tierData,
		tierIndex,
		unlockCost,
		color,
		cash = 0,
		onUnlock,
		isPreviousTierOwned = false,
	}: {
		tierData: TierData;
		tierIndex: number;
		unlockCost: number;
		color: string;
		cash: number;
		onUnlock?: () => void;
		isPreviousTierOwned: boolean;
	} = $props();

	let canAfford = $derived(cash >= unlockCost && isPreviousTierOwned);
	let showFanfare = $state(false);

	function handleUnlock() {
		if (!canAfford || !onUnlock) return;
		onUnlock();
		showFanfare = true;
		setTimeout(() => { showFanfare = false; }, 1500);
	}
</script>

<div class="tier-unlock-card relative rounded-xl border border-white/[0.04] bg-bg-secondary/20 overflow-hidden transition-all duration-300"
	class:ring-1={canAfford}
	style={canAfford ? `--tw-ring-color: ${color}30;` : ''}
>
	<!-- Unlock fanfare -->
	{#if showFanfare}
		<div class="absolute inset-0 pointer-events-none z-10 unlock-flash" style="background-color: {color};"></div>
	{/if}

	<div class="p-3.5 flex items-start gap-3 opacity-60" class:opacity-80={canAfford}>
		<!-- Tier badge (locked) -->
		<div class="shrink-0 flex flex-col items-center gap-1">
			<div
				class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold bg-bg-tertiary/30"
				style="color: var(--color-text-muted);"
			>
				<span class="text-base">🔒</span>
			</div>
			<span class="text-[10px] text-text-muted font-mono">T{tierIndex + 1}</span>
		</div>

		<!-- Info section -->
		<div class="flex-1 min-w-0">
			<h3 class="text-sm font-semibold text-text-secondary truncate flex items-center gap-1.5">
				{tierData.name}
				{#if tierData.tooltip}
					<Tooltip text={tierData.tooltip} {color} />
				{/if}
			</h3>
			<p class="text-xs text-text-muted mt-0.5 line-clamp-1">
				{tierData.description}
			</p>

			<!-- Unlock button -->
			<div class="mt-2.5">
				{#if !isPreviousTierOwned}
					<div class="w-full flex items-center justify-center px-3 py-2 rounded-lg text-xs text-text-muted bg-bg-tertiary/30">
						<span>Own previous tier first</span>
					</div>
				{:else}
					<button
						onclick={handleUnlock}
						class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold
							   transition-all duration-200 active:scale-[0.97] touch-manipulation"
						style="background-color: {canAfford ? color + '15' : 'var(--color-bg-tertiary)'};
							   color: {canAfford ? color : 'var(--color-text-muted)'};
							   border: 1px solid {canAfford ? color + '25' : 'transparent'};"
						disabled={!canAfford}
					>
						<span class="flex items-center gap-1.5">
							<span>🔓</span>
							<span>Unlock</span>
						</span>
						<span class="font-mono tabular-nums opacity-80">
							{formatCurrency(unlockCost)}
						</span>
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.unlock-flash {
		animation: unlockFlash 1.5s ease-out forwards;
	}

	@keyframes unlockFlash {
		0% { opacity: 0.3; }
		20% { opacity: 0.1; }
		100% { opacity: 0; }
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
