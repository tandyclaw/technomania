<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';
	import { getPowerStatus, calculatePowerEfficiency } from '$lib/systems/PowerSystem';
	import AnimatedNumber from '$lib/ui/AnimatedNumber.svelte';

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

	// Pulsing deficit animation
	let deficitPulse = $derived(powerStatus === 'deficit');
</script>

<header
	class="fixed top-0 left-0 right-0 z-50 bg-bg-primary/90 backdrop-blur-md border-b border-white/5"
	style="padding-top: env(safe-area-inset-top, 0px);"
	aria-label="Player resources"
>
	<div class="flex items-center justify-between px-3 h-[3.25rem] max-w-2xl mx-auto gap-2">
		<!-- Cash -->
		<div class="flex items-center gap-1.5 min-w-0 flex-1" aria-label="Cash">
			<span class="text-base leading-none shrink-0" aria-hidden="true">💰</span>
			<div class="flex flex-col min-w-0">
				<span class="text-[10px] text-text-muted leading-none uppercase tracking-wider font-medium">Cash</span>
				<span class="text-sm font-bold text-text-primary tabular-nums truncate font-mono">
					<AnimatedNumber value={cash} formatter={cashFormatter} duration={350} />
				</span>
			</div>
		</div>

		<!-- Divider -->
		<div class="w-px h-6 bg-white/5 shrink-0"></div>

		<!-- Research Points -->
		<div class="flex items-center gap-1.5 min-w-0 flex-1 justify-center" aria-label="Research Points">
			<span class="text-base leading-none shrink-0" aria-hidden="true">🔬</span>
			<div class="flex flex-col min-w-0">
				<span class="text-[10px] text-text-muted leading-none uppercase tracking-wider font-medium">Research</span>
				<span class="text-sm font-bold text-neural-purple tabular-nums truncate font-mono">
					<AnimatedNumber value={rp} formatter={rpFormatter} duration={350} />
				</span>
			</div>
		</div>

		<!-- Divider -->
		<div class="w-px h-6 bg-white/5 shrink-0"></div>

		<!-- Power -->
		<div
			class="flex items-center gap-1.5 min-w-0 flex-1 justify-end"
			class:deficit-pulse={deficitPulse}
			aria-label="Power usage"
		>
			<span class="text-base leading-none shrink-0" aria-hidden="true">⚡</span>
			<div class="flex flex-col min-w-0">
				<span class="text-[10px] leading-none uppercase tracking-wider font-medium"
					class:text-text-muted={powerStatus === 'ok'}
					class:text-solar-gold={powerStatus === 'warning'}
					class:text-rocket-red={powerStatus === 'deficit'}
				>
					{powerStatus === 'deficit' ? '⚠ Power' : 'Power'}
				</span>
				<div class="flex items-center gap-1">
					<span
						class="text-sm font-bold tabular-nums truncate font-mono"
						class:text-bio-green={powerStatus === 'ok'}
						class:text-solar-gold={powerStatus === 'warning'}
						class:text-rocket-red={powerStatus === 'deficit'}
					>
						<AnimatedNumber value={powerCon} formatter={powerConFormatter} duration={350} />/<AnimatedNumber value={powerGen} formatter={powerGenFormatter} duration={350} />
					</span>
					<span class="text-[10px] text-text-muted">MW</span>
				</div>
			</div>
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
		<div class="deficit-banner flex items-center justify-center gap-2 px-3 py-1 bg-rocket-red/10 border-b border-rocket-red/20" data-testid="power-deficit-banner">
			<span class="text-[10px] font-semibold text-rocket-red uppercase tracking-wider">
				⚠ Power Deficit — Production at {Math.round(powerEff * 100)}%
			</span>
		</div>
	{/if}
</header>

<style>
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
</style>
