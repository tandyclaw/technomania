<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { formatCurrency, formatNumber, formatPower } from '$lib/engine/BigNumber';

	let cash = $derived($gameState.cash);
	let rp = $derived($gameState.researchPoints);
	let powerGen = $derived($gameState.powerGenerated);
	let powerCon = $derived($gameState.powerConsumed);

	let powerRatio = $derived(powerGen > 0 ? Math.min(powerCon / powerGen, 1) : 0);
	let powerStatus = $derived(
		powerCon > powerGen ? 'deficit' : powerCon > powerGen * 0.8 ? 'warning' : 'ok'
	);
</script>

<header
	class="fixed top-0 left-0 right-0 z-50 bg-bg-primary/90 backdrop-blur-md border-b border-white/5"
	style="padding-top: env(safe-area-inset-top, 0px);"
>
	<div class="flex items-center justify-between px-3 h-12 max-w-2xl mx-auto">
		<!-- Cash -->
		<div class="flex items-center gap-1.5 min-w-0">
			<span class="text-base leading-none">💰</span>
			<div class="flex flex-col min-w-0">
				<span class="text-[10px] text-text-muted leading-none uppercase tracking-wider">Cash</span>
				<span class="text-sm font-bold text-text-primary tabular-nums truncate">
					{formatCurrency(cash)}
				</span>
			</div>
		</div>

		<!-- Research Points -->
		<div class="flex items-center gap-1.5 min-w-0">
			<span class="text-base leading-none">🔬</span>
			<div class="flex flex-col min-w-0">
				<span class="text-[10px] text-text-muted leading-none uppercase tracking-wider">Research</span>
				<span class="text-sm font-bold text-text-primary tabular-nums truncate">
					{formatNumber(rp, 0)}
				</span>
			</div>
		</div>

		<!-- Power -->
		<div class="flex items-center gap-1.5 min-w-0">
			<span class="text-base leading-none">⚡</span>
			<div class="flex flex-col min-w-0">
				<span class="text-[10px] text-text-muted leading-none uppercase tracking-wider">Power</span>
				<div class="flex items-center gap-1">
					<span
						class="text-sm font-bold tabular-nums truncate"
						class:text-text-primary={powerStatus === 'ok'}
						class:text-solar-gold={powerStatus === 'warning'}
						class:text-rocket-red={powerStatus === 'deficit'}
					>
						{powerCon.toFixed(0)}/{powerGen.toFixed(0)}
					</span>
					<span class="text-[10px] text-text-muted">MW</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Power usage bar -->
	<div class="h-[2px] bg-bg-tertiary/50">
		<div
			class="h-full transition-all duration-500 ease-out"
			class:bg-bio-green={powerStatus === 'ok'}
			class:bg-solar-gold={powerStatus === 'warning'}
			class:bg-rocket-red={powerStatus === 'deficit'}
			style="width: {Math.min(powerRatio * 100, 100)}%"
		></div>
	</div>
</header>
