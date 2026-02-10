<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { activeTab } from '$lib/stores/navigation';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';
	import { getPowerStatus, calculatePowerEfficiency } from '$lib/systems/PowerSystem';
	import AnimatedNumber from '$lib/ui/AnimatedNumber.svelte';
	// NotificationCenter moved to bottom tab bar
	import BuffIndicator from '$lib/ui/BuffIndicator.svelte';

	let cash = $derived($gameState.cash);
	let rp = $derived($gameState.researchPoints);
	let powerGen = $derived($gameState.powerGenerated);
	let powerCon = $derived($gameState.powerConsumed);

	let powerRatio = $derived(powerGen > 0 ? Math.min(powerCon / powerGen, 1) : 0);
	let powerStatus = $derived(getPowerStatus(powerGen, powerCon));
	let powerEff = $derived(calculatePowerEfficiency(powerGen, powerCon));

	// Formatters for AnimatedNumber
	const cashFormatter = (n: number) => formatCurrency(n);
	const rpFormatter = (n: number) => formatNumber(n, 0);
	const powerConFormatter = (n: number) => formatNumber(n, 1);
	const powerGenFormatter = (n: number) => formatNumber(n, 1);
	// Compact mode: when either number > 9999, just show +/- net
	let compactPower = $derived(powerGen > 9999 || powerCon > 9999);
	let powerNet = $derived(powerGen - powerCon);

	// Pulsing deficit animation
	let deficitPulse = $derived(powerStatus === 'deficit');

	// Power tooltip state
	let showPowerTooltip = $state(false);

	function navigateTo(tab: string) {
		activeTab.set(tab);
	}

	function togglePowerTooltip() {
		showPowerTooltip = !showPowerTooltip;
	}

	function closePowerTooltip() {
		showPowerTooltip = false;
	}
</script>

<svelte:window onclick={closePowerTooltip} />

<header
	class="fixed top-0 left-0 right-0 z-50 bg-bg-primary/90 backdrop-blur-md border-b border-white/5"
	style="padding-top: env(safe-area-inset-top, 0px);"
	aria-label="Player resources"
>
	<div class="flex items-center justify-between px-3 h-[3.25rem] max-w-2xl mx-auto gap-2">
		<!-- Cash — taps to Treasury -->
		<button
			class="resource-btn flex items-center gap-1.5 min-w-0 flex-1"
			aria-label="Cash — tap to open Treasury"
			onclick={() => navigateTo('treasury')}
		>
			<span class="text-base leading-none shrink-0" aria-hidden="true">💰</span>
			<div class="flex flex-col min-w-0 text-left">
				<span class="text-[10px] text-text-muted leading-none uppercase tracking-wider font-medium">Cash</span>
				<span class="text-resource-number font-bold text-text-primary tabular-nums truncate font-mono">
					<AnimatedNumber value={cash} formatter={cashFormatter} duration={350} />
				</span>
			</div>
		</button>

		<!-- Divider -->
		<div class="w-px h-6 bg-white/5 shrink-0"></div>

		<!-- Research Points — taps to Research -->
		<button
			class="resource-btn flex items-center gap-1.5 min-w-0 flex-1 justify-center"
			aria-label="Research Points — tap to open Research"
			onclick={() => navigateTo('research')}
		>
			<span class="text-base leading-none shrink-0" aria-hidden="true">🔬</span>
			<div class="flex flex-col min-w-0 text-left">
				<span class="text-[10px] text-text-muted leading-none uppercase tracking-wider font-medium">Research</span>
				<span class="text-resource-number font-bold text-neural-purple tabular-nums truncate font-mono">
					<AnimatedNumber value={rp} formatter={rpFormatter} duration={350} />
				</span>
			</div>
		</button>

		<!-- Divider -->
		<div class="w-px h-6 bg-white/5 shrink-0"></div>

		<!-- Power — taps to show tooltip -->
		<div class="relative flex-1 flex justify-end">
			<button
				class="resource-btn flex items-center gap-1.5 min-w-0 w-full justify-end"
				class:deficit-pulse={deficitPulse}
				aria-label="Power usage — tap for details"
				onclick={(e) => { e.stopPropagation(); togglePowerTooltip(); }}
			>
				<span class="text-base leading-none shrink-0" aria-hidden="true">⚡</span>
				<div class="flex flex-col min-w-0 text-left">
					<span class="text-[10px] leading-none uppercase tracking-wider font-medium"
						class:text-text-muted={powerStatus === 'ok'}
						class:text-solar-gold={powerStatus === 'warning'}
						class:text-rocket-red={powerStatus === 'deficit'}
					>
						{powerStatus === 'deficit' ? '⚠ Power' : 'Power'}
					</span>
					<div class="flex items-center gap-1">
						<span
							class="text-resource-number font-bold tabular-nums truncate font-mono"
							class:text-bio-green={powerStatus === 'ok'}
							class:text-solar-gold={powerStatus === 'warning'}
							class:text-rocket-red={powerStatus === 'deficit'}
						>
							{#if compactPower}
							{powerNet >= 0 ? '+' : ''}<AnimatedNumber value={powerNet} formatter={powerConFormatter} duration={350} />
						{:else}
							<AnimatedNumber value={powerCon} formatter={powerConFormatter} duration={350} />/<AnimatedNumber value={powerGen} formatter={powerGenFormatter} duration={350} />
						{/if}
						</span>
						<span class="text-[10px] text-text-muted">MW</span>
					</div>
				</div>
			</button>

			<!-- Power tooltip popover -->
			{#if showPowerTooltip}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="power-tooltip absolute top-full right-0 mt-2 w-64 bg-bg-secondary border border-white/10 rounded-xl shadow-xl p-3 z-[60]"
					onclick={(e) => e.stopPropagation()}
				>
					<h3 class="text-xs font-semibold text-text-primary uppercase tracking-wider mb-2">⚡ Power Overview</h3>

					<div class="space-y-1.5 text-xs">
						<div class="flex justify-between">
							<span class="text-text-muted">Generated</span>
							<span class="font-mono font-semibold text-bio-green">{formatNumber(powerGen, 1)} MW</span>
						</div>
						<div class="flex justify-between">
							<span class="text-text-muted">Consumed</span>
							<span class="font-mono font-semibold"
								class:text-bio-green={powerStatus === 'ok'}
								class:text-solar-gold={powerStatus === 'warning'}
								class:text-rocket-red={powerStatus === 'deficit'}
							>{formatNumber(powerCon, 1)} MW</span>
						</div>
						<div class="flex justify-between border-t border-white/5 pt-1.5">
							<span class="text-text-muted">Efficiency</span>
							<span class="font-mono font-semibold"
								class:text-bio-green={powerEff >= 1}
								class:text-solar-gold={powerEff < 1 && powerEff >= 0.5}
								class:text-rocket-red={powerEff < 0.5}
							>{Math.round(powerEff * 100)}%</span>
						</div>
					</div>

					<div class="mt-2.5 pt-2 border-t border-white/5 space-y-1">
						<p class="text-[10px] text-text-muted leading-tight">
							<span class="text-bio-green font-semibold">Energy</span> generates power.
						</p>
						<p class="text-[10px] text-text-muted leading-tight">
							<span class="text-text-secondary font-semibold">Rockets, Manufacturing, AI, Tunnels, Robotics</span> consume power.
						</p>
						{#if powerStatus === 'deficit'}
							<p class="text-[10px] text-rocket-red leading-tight font-medium mt-1">
								⚠ Deficit! All non-energy production reduced to {Math.round(powerEff * 100)}% speed. Build more energy capacity!
							</p>
						{:else if powerStatus === 'warning'}
							<p class="text-[10px] text-solar-gold leading-tight font-medium mt-1">
								Nearing capacity — consider expanding energy production.
							</p>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Power usage indicator bar -->
	<div class="h-[2px] bg-bg-tertiary/30">
		<div
			class="h-full transition-all duration-500 ease-out"
			class:bg-bio-green={powerStatus === 'ok'}
			class:bg-solar-gold={powerStatus === 'warning'}
			class:bg-rocket-red={powerStatus === 'deficit'}
			style="width: {powerGen === 0 && powerCon === 0 ? 0 : Math.min(powerRatio * 100, 100)}%"
			role="progressbar"
			aria-valuenow={powerCon}
			aria-valuemin={0}
			aria-valuemax={powerGen}
			aria-label="Power usage"
		></div>
	</div>

	<!-- Power deficit banner -->
	{#if powerStatus === 'deficit'}
		<div class="deficit-banner flex items-center justify-center gap-2 px-3 py-1 bg-rocket-red/10 border-b border-rocket-red/20" data-testid="power-deficit-banner" role="alert">
			<span class="text-[10px] font-semibold text-rocket-red uppercase tracking-wider">
				⚠ Power Deficit — Production at {Math.round(powerEff * 100)}%
			</span>
		</div>
	{/if}

	<!-- Active buff indicators -->
	<BuffIndicator />
</header>

<style>
	.resource-btn {
		min-height: 44px;
		padding: 4px 6px;
		border-radius: 8px;
		border: none;
		background: transparent;
		cursor: pointer;
		transition: background-color 0.15s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.resource-btn:active {
		background-color: rgba(255, 255, 255, 0.08);
	}

	@media (hover: hover) {
		.resource-btn:hover {
			background-color: rgba(255, 255, 255, 0.05);
		}
	}

	.deficit-pulse {
		animation: pulse-red 2s ease-in-out infinite;
	}

	@keyframes pulse-red {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	.deficit-banner {
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.power-tooltip {
		animation: fadeIn 0.15s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
