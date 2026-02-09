<script lang="ts">
	import type { BottleneckState } from '$lib/stores/gameState';
	import type { BottleneckDef } from '$lib/systems/BottleneckSystem';
	import { formatCurrency } from '$lib/engine/BigNumber';

	let {
		bottleneck,
		def,
		cash = 0,
		color = '#FF4444',
		onResolve,
	}: {
		bottleneck: BottleneckState;
		def: BottleneckDef;
		cash?: number;
		color?: string;
		onResolve?: () => void;
	} = $props();

	let canAfford = $derived(def.resolveCost > 0 && cash >= def.resolveCost);
	let severityPercent = $derived(Math.round(bottleneck.severity * 100));
	let isProductionHell = $derived(def.isProductionHell ?? false);

	// Pick a random production hell flavor line (stable per render)
	let hellFlavorLine = $derived(
		def.productionHellFlavor && def.productionHellFlavor.length > 0
			? def.productionHellFlavor[Math.floor(Date.now() / 10000) % def.productionHellFlavor.length]
			: null
	);

	const categoryIcons: Record<string, string> = {
		engineering: '🔧',
		power: '⚡',
		supply_chain: '📦',
		regulatory: '📋',
		scaling: '🏭',
	};

	let categoryIcon = $derived(isProductionHell ? '🔥' : (categoryIcons[def.category] ?? '⚠️'));
</script>

<div
	class="relative rounded-xl border overflow-hidden"
	class:bottleneck-card={!isProductionHell}
	class:production-hell-card={isProductionHell}
	style="background-color: {isProductionHell ? '#FF220018' : '#FF444410'}; border-color: {isProductionHell ? '#FF444050' : '#FF444030'};"
>
	<!-- Severity indicator bar -->
	<div
		class="absolute top-0 left-0 transition-all duration-300"
		style="width: {severityPercent}%; background-color: {isProductionHell ? '#FF6600' : '#FF4444'}; height: {isProductionHell ? '3px' : '4px'};"
	></div>

	<div class="p-3.5">
		<div class="flex items-start gap-2.5">
			<!-- Icon -->
			<div
				class="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
				class:hell-icon-pulse={isProductionHell}
				style="background-color: {isProductionHell ? '#FF440020' : 'rgba(255, 68, 68, 0.1)'};"
			>
				{categoryIcon}
			</div>

			<!-- Content -->
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2">
					<h4 class="text-sm font-bold truncate" style="color: {isProductionHell ? '#FF6600' : '#FF4444'};">
						{def.name}
					</h4>
					<span class="text-[10px] font-mono font-bold shrink-0" style="color: {isProductionHell ? '#FF660090' : '#FF444070'};">
						-{severityPercent}% speed
					</span>
				</div>
				<p class="text-[11px] text-text-secondary mt-0.5 leading-snug">
					{def.description}
				</p>
				{#if def.flavorText}
					<p class="text-[10px] text-text-muted mt-1 italic">
						"{def.flavorText}"
					</p>
				{/if}
				{#if isProductionHell && hellFlavorLine}
					<p class="text-[10px] mt-1.5 italic font-medium" style="color: #FF660090;">
						⚡ {hellFlavorLine}
					</p>
				{/if}
			</div>
		</div>

		<!-- Resolve button -->
		{#if def.resolveCost > 0}
			<button
				onclick={onResolve}
				class="mt-2.5 w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold
					   transition-all duration-150 active:scale-[0.97] touch-manipulation"
				style="background-color: {canAfford ? '#44FF8820' : 'var(--color-bg-tertiary)'};
					   color: {canAfford ? '#44FF88' : 'var(--color-text-muted)'};
					   border: 1px solid {canAfford ? '#44FF8830' : 'transparent'};"
				disabled={!canAfford}
			>
				<span>🔧 Resolve</span>
				<span class="font-mono tabular-nums opacity-80">
					{formatCurrency(def.resolveCost)}
				</span>
			</button>
		{:else}
			<div class="mt-2 text-[10px] text-text-muted">
				💡 Build more Tesla Energy to resolve
			</div>
		{/if}
	</div>
</div>

<style>
	.bottleneck-card {
		animation: bottleneckPulse 3s ease-in-out infinite;
	}

	@keyframes bottleneckPulse {
		0%, 100% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); }
		50% { box-shadow: 0 0 8px 0 rgba(255, 68, 68, 0.15); }
	}

	.production-hell-card {
		animation: productionHellPulse 1.5s ease-in-out infinite;
	}

	@keyframes productionHellPulse {
		0%, 100% { box-shadow: 0 0 0 0 rgba(255, 102, 0, 0); }
		50% { box-shadow: 0 0 16px 2px rgba(255, 102, 0, 0.25); }
	}

	.hell-icon-pulse {
		animation: hellIconGlow 1s ease-in-out infinite alternate;
	}

	@keyframes hellIconGlow {
		0% { transform: scale(1); }
		100% { transform: scale(1.1); }
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
