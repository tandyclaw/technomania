<script lang="ts">
	import type { BottleneckState } from '$lib/stores/gameState';
	import type { BottleneckDef } from '$lib/systems/BottleneckSystem';
	import { formatCurrency } from '$lib/engine/BigNumber';
	import Tooltip from './Tooltip.svelte';

	let {
		bottleneck,
		def,
		cash = 0,
		researchPoints = 0,
		color = '#FF4444',
		onResolve,
		onResolveRP,
		onStartWait,
	}: {
		bottleneck: BottleneckState;
		def: BottleneckDef;
		cash?: number;
		researchPoints?: number;
		color?: string;
		onResolve?: () => void;
		onResolveRP?: () => void;
		onStartWait?: () => void;
	} = $props();

	let canAffordCash = $derived(def.resolveCost > 0 && cash >= def.resolveCost);
	let canAffordRP = $derived((def.researchCost ?? 0) > 0 && researchPoints >= (def.researchCost ?? 0));
	let hasWaitOption = $derived((def.waitDurationMs ?? 0) > 0);
	let isWaiting = $derived((bottleneck.waitStartedAt ?? 0) > 0);
	let severityPercent = $derived(Math.round(bottleneck.severity * 100));
	let isProductionHell = $derived(def.isProductionHell ?? false);

	// Wait countdown state
	let waitRemainingMs = $state(0);
	let waitProgress = $state(0);

	// Update the wait countdown every 500ms via reactive effect
	$effect(() => {
		if (!isWaiting || !def.waitDurationMs) {
			waitRemainingMs = 0;
			waitProgress = 0;
			return;
		}

		const timer = setInterval(() => {
			const elapsed = Date.now() - (bottleneck.waitStartedAt ?? 0);
			const remaining = Math.max(0, def.waitDurationMs! - elapsed);
			waitRemainingMs = remaining;
			waitProgress = Math.min(1, elapsed / def.waitDurationMs!);
		}, 500);

		// Initial update
		const elapsed = Date.now() - (bottleneck.waitStartedAt ?? 0);
		waitRemainingMs = Math.max(0, def.waitDurationMs! - elapsed);
		waitProgress = Math.min(1, elapsed / def.waitDurationMs!);

		return () => clearInterval(timer);
	});

	function formatTime(ms: number): string {
		if (ms <= 0) return '0:00';
		const totalSeconds = Math.ceil(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	function formatWaitDuration(ms: number): string {
		const totalSeconds = Math.ceil(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		if (minutes < 1) return `${totalSeconds}s`;
		return `${minutes}m`;
	}

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
					<h4 class="text-sm font-bold truncate flex items-center gap-1.5" style="color: {isProductionHell ? '#FF6600' : '#FF4444'};">
						{def.name}
						{#if def.tooltip}
							<Tooltip text={def.tooltip} color={isProductionHell ? '#FF6600' : '#FF4444'} />
						{/if}
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

		<!-- Resolution Options -->
		<div class="mt-3 space-y-1.5">
			<div class="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">
				Resolution Options
			</div>

			<!-- Option 1: Cash (instant) -->
			{#if def.resolveCost > 0}
				<button
					onclick={onResolve}
					class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold
						   transition-all duration-150 active:scale-[0.97] touch-manipulation"
					style="background-color: {canAffordCash ? '#44FF8815' : 'var(--color-bg-tertiary)'};
						   color: {canAffordCash ? '#44FF88' : 'var(--color-text-muted)'};
						   border: 1px solid {canAffordCash ? '#44FF8825' : 'transparent'};"
					disabled={!canAffordCash}
				>
					<span class="flex items-center gap-1.5">
						<span class="text-sm">💰</span>
						<span>Invest Cash</span>
						<span class="text-[9px] px-1 py-0.5 rounded bg-white/5 font-normal opacity-70">INSTANT</span>
					</span>
					<span class="font-mono tabular-nums opacity-80">
						{formatCurrency(def.resolveCost)}
					</span>
				</button>
			{/if}

			<!-- Option 2: Research Points -->
			{#if (def.researchCost ?? 0) > 0}
				<button
					onclick={onResolveRP}
					class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold
						   transition-all duration-150 active:scale-[0.97] touch-manipulation"
					style="background-color: {canAffordRP ? '#9944FF15' : 'var(--color-bg-tertiary)'};
						   color: {canAffordRP ? '#9944FF' : 'var(--color-text-muted)'};
						   border: 1px solid {canAffordRP ? '#9944FF25' : 'transparent'};"
					disabled={!canAffordRP}
				>
					<span class="flex items-center gap-1.5">
						<span class="text-sm">🔬</span>
						<span>R&D Fix</span>
						<span class="text-[9px] px-1 py-0.5 rounded bg-white/5 font-normal opacity-70">INSTANT</span>
					</span>
					<span class="font-mono tabular-nums opacity-80">
						{def.researchCost} RP
					</span>
				</button>
			{/if}

			<!-- Option 3: Wait it out -->
			{#if hasWaitOption}
				{#if isWaiting}
					<!-- Countdown in progress -->
					<div
						class="w-full px-3 py-2 rounded-lg text-xs border relative overflow-hidden"
						style="background-color: #FFCC4410; border-color: #FFCC4425; color: #FFCC44;"
					>
						<!-- Progress fill behind text -->
						<div
							class="absolute inset-0 transition-all duration-500 ease-linear"
							style="width: {waitProgress * 100}%; background-color: #FFCC4408;"
						></div>
						<div class="relative flex items-center justify-between">
							<span class="flex items-center gap-1.5 font-semibold">
								<span class="text-sm wait-spin">⏳</span>
								<span>Waiting it out...</span>
							</span>
							<span class="font-mono tabular-nums font-bold">
								{formatTime(waitRemainingMs)}
							</span>
						</div>
						<!-- Progress bar -->
						<div class="relative mt-1.5 h-1 rounded-full overflow-hidden" style="background-color: #FFCC4415;">
							<div
								class="h-full rounded-full transition-all duration-500 ease-linear"
								style="width: {waitProgress * 100}%; background-color: #FFCC44;"
							></div>
						</div>
					</div>
				{:else}
					<!-- Start wait button -->
					<button
						onclick={onStartWait}
						class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold
							   transition-all duration-150 active:scale-[0.97] touch-manipulation"
						style="background-color: #FFCC4410; color: #FFCC44; border: 1px solid #FFCC4420;"
					>
						<span class="flex items-center gap-1.5">
							<span class="text-sm">⏳</span>
							<span>Wait It Out</span>
							<span class="text-[9px] px-1 py-0.5 rounded bg-white/5 font-normal opacity-70">FREE</span>
						</span>
						<span class="font-mono tabular-nums opacity-80">
							{formatWaitDuration(def.waitDurationMs!)}
						</span>
					</button>
				{/if}
			{/if}

			<!-- No resolution possible (e.g., power deficit) -->
			{#if def.resolveCost <= 0 && (def.researchCost ?? 0) <= 0 && !hasWaitOption}
				<div class="px-3 py-2 text-[10px] text-text-muted rounded-lg bg-bg-tertiary/30">
					💡 Build more Tesla Energy to resolve
				</div>
			{/if}
		</div>
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

	.wait-spin {
		animation: waitSpin 3s linear infinite;
	}

	@keyframes waitSpin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
