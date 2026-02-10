<script lang="ts">
	import { DIVISION_CHIEFS, CHIEF_LEVELS, getNextChiefCost, getChiefLevelData, getNextChiefLevelData } from '$lib/systems/ChiefSystem';
	import { ngPlusCostMultiplier } from '$lib/stores/ngPlus';
	import { formatCurrency } from '$lib/engine/BigNumber';

	let {
		divisionId,
		chiefLevel = 0,
		color,
		cash = 0,
		onHire,
	}: {
		divisionId: string;
		chiefLevel: number;
		color: string;
		cash: number;
		onHire?: () => void;
	} = $props();

	let chief = $derived(DIVISION_CHIEFS[divisionId]);
	let currentLevelData = $derived(getChiefLevelData(chiefLevel));
	let nextLevelData = $derived(getNextChiefLevelData(chiefLevel));
	let baseNextCost = $derived(getNextChiefCost(chiefLevel, divisionId));
	let nextCost = $derived(baseNextCost !== null ? baseNextCost * $ngPlusCostMultiplier : null);
	let canAfford = $derived(nextCost !== null && cash >= nextCost);
	let isMaxLevel = $derived(chiefLevel >= CHIEF_LEVELS.length);
	let isHired = $derived(chiefLevel > 0);

	function handleHire() {
		if (!canAfford || !onHire) return;
		onHire();
	}
</script>

{#if chief}
	<div class="rounded-xl border overflow-hidden transition-all duration-300
		{isHired ? '' : 'border-white/5 bg-bg-secondary/30'}"
		style={isHired ? `background-color: ${color}08; border-color: ${color}20;` : ''}
		data-tutorial-id="chief-card"
	>
		<div class="px-2.5 py-1.5">
			<!-- Single compact row: portrait + info + button -->
			<div class="flex items-center gap-2">
				<!-- Portrait -->
				<div
					class="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
					style="background-color: {isHired ? color + '20' : 'var(--color-bg-tertiary)'};"
				>
					{isHired ? chief.portrait : '👤'}
				</div>

				<!-- Info -->
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-1">
						<span class="text-xs font-bold truncate"
							style="color: {isHired ? color : 'var(--color-text-primary)'};"
						>
							{chief.name}
						</span>
						{#if isHired && currentLevelData}
							<span class="text-[9px] font-bold px-1 py-px rounded-full shrink-0"
								style="background-color: {color}20; color: {color};"
							>
								Lv.{chiefLevel} · {currentLevelData.speedMultiplier}x
							</span>
						{/if}
					</div>
					<p class="text-[10px] text-text-muted truncate">
						{isHired ? chief.title : 'Hire to automate production'}
					</p>
				</div>

				<!-- Action button or max label -->
				{#if isMaxLevel}
					<span class="shrink-0 text-[9px] font-bold px-2 py-1 rounded-lg"
						style="background-color: {color}15; color: {color};"
					>
						MAX ✨
					</span>
				{:else}
					<button
						onclick={handleHire}
						class="shrink-0 flex flex-col items-center px-2.5 py-1 rounded-lg text-xs font-bold
							   transition-all duration-200 active:scale-[0.97] touch-manipulation"
						style="background-color: {canAfford ? color + '20' : 'var(--color-bg-tertiary)'};
							   color: {canAfford ? color : 'var(--color-text-muted)'};
							   border: 1.5px solid {canAfford ? color + '35' : 'transparent'};"
						disabled={!canAfford}
					>
						<span class="text-[10px]">{!isHired ? 'Hire' : `→ Lv.${chiefLevel + 1}`}</span>
						<span class="font-mono tabular-nums text-[10px] opacity-80">
							{nextCost !== null ? formatCurrency(nextCost) : '—'}
						</span>
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
