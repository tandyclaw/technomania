<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { formatNumber } from '$lib/engine/BigNumber';

	let rp = $derived($gameState.researchPoints);
	let activeResearch = $derived($gameState.activeResearch);
	let unlockedCount = $derived($gameState.unlockedResearch.length);
</script>

<div class="space-y-5">
	<!-- Research header -->
	<div class="flex items-center gap-3">
		<div class="w-12 h-12 rounded-xl flex items-center justify-center text-3xl shrink-0 bg-neural-purple/15 border border-neural-purple/30">
			🔬
		</div>
		<div>
			<h1 class="text-xl font-bold text-neural-purple">Research Lab</h1>
			<p class="text-xs text-text-secondary">
				{formatNumber(rp, 0)} RP available · {unlockedCount} completed
			</p>
		</div>
	</div>

	<!-- Active research -->
	{#if activeResearch}
		<div class="bg-neural-purple/10 rounded-xl p-4 border border-neural-purple/20">
			<div class="flex items-center justify-between mb-2">
				<span class="text-sm font-semibold text-text-primary">Researching...</span>
				<span class="text-xs text-neural-purple font-mono">
					{Math.round(activeResearch.progress * 100)}%
				</span>
			</div>
			<div class="h-2 bg-bg-tertiary/50 rounded-full overflow-hidden">
				<div
					class="h-full bg-neural-purple rounded-full transition-all duration-300"
					style="width: {activeResearch.progress * 100}%"
				></div>
			</div>
		</div>
	{/if}

	<!-- Placeholder tech tree -->
	<div class="bg-bg-secondary/30 rounded-xl p-8 border border-white/5 text-center">
		<div class="text-4xl mb-3">🧪</div>
		<h2 class="text-base font-semibold text-text-primary mb-1">Tech Tree</h2>
		<p class="text-sm text-text-muted">Research nodes will appear here as you progress.</p>
	</div>
</div>
