<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { getDivision } from '$lib/divisions';
	import { purchaseTier, tapProduce } from '$lib/engine/ProductionEngine';
	import DivisionDetailTemplate from '$lib/ui/DivisionDetailTemplate.svelte';

	let { divisionId }: { divisionId: string } = $props();

	let division = $derived(getDivision(divisionId));
	let divState = $derived($gameState.divisions[divisionId as keyof typeof $gameState.divisions]);
	let cash = $derived($gameState.cash);

	function handleBuyTier(tierIndex: number) {
		purchaseTier(divisionId, tierIndex);
	}

	function handleTapTier(tierIndex: number): number {
		return tapProduce(divisionId, tierIndex);
	}
</script>

{#if division && divState}
	<DivisionDetailTemplate
		{division}
		state={divState}
		{cash}
		onBuyTier={handleBuyTier}
		onTapTier={handleTapTier}
	/>
{:else}
	<!-- Unknown division -->
	<div class="bg-bg-secondary/30 rounded-xl p-8 border border-white/5 text-center">
		<div class="text-4xl mb-3">❓</div>
		<h2 class="text-base font-semibold text-text-primary mb-1">Division Not Found</h2>
		<p class="text-sm text-text-muted">This division doesn't exist yet.</p>
	</div>
{/if}
