<script lang="ts">
	import { gameState, getNgPlusCostMultiplier } from '$lib/stores/gameState';
	import { getDivision } from '$lib/divisions';
	import { purchaseTier, purchaseTierBulk, tapProduce, hireChief, unlockTier, unlockDivision } from '$lib/engine/ProductionEngine';
	import { getDivisionUnlockRequirement } from '$lib/systems/DivisionUnlockSystem';
	import { formatCurrency } from '$lib/engine/BigNumber';
	import { buyQuantity, type BuyQuantity } from '$lib/stores/buyQuantity';
	import DivisionDetailTemplate from '$lib/ui/DivisionDetailTemplate.svelte';
	import { getPlanetCostMultiplier } from '$lib/systems/PrestigeSystem';

	let { divisionId }: { divisionId: string } = $props();

	let division = $derived(getDivision(divisionId));
	let divState = $derived($gameState.divisions[divisionId as keyof typeof $gameState.divisions]);
	let cash = $derived($gameState.cash);
	let ngMult = $derived(getNgPlusCostMultiplier($gameState.ngPlusLevel) * getPlanetCostMultiplier($gameState.prestigeCount));
	let unlockReq = $derived(getDivisionUnlockRequirement(divisionId));
	let divUnlockCost = $derived(unlockReq ? unlockReq.cost * ngMult : 0);
	let canAffordDivision = $derived(unlockReq ? cash >= divUnlockCost : false);

	// Division unlock celebration state
	let showUnlockCelebration = $state(false);

	function handleBuyTier(tierIndex: number) {
		const qty = $buyQuantity;
		console.log('[DEBUG] handleBuyTier', { tierIndex, qty, divisionId });
		if (qty === 1) {
			purchaseTier(divisionId, tierIndex);
		} else {
			const result = purchaseTierBulk(divisionId, tierIndex, qty);
			console.log('[DEBUG] purchaseTierBulk result:', result);
		}
	}

	function handleTapTier(tierIndex: number): boolean {
		return tapProduce(divisionId, tierIndex);
	}

	function handleHireChief() {
		hireChief(divisionId);
	}

	function handleUnlockTier(tierIndex: number) {
		unlockTier(divisionId, tierIndex);
	}

	function handleUnlockDivision() {
		const result = unlockDivision(divisionId);
		if (result) {
			showUnlockCelebration = true;
			setTimeout(() => { showUnlockCelebration = false; }, 3000);
		}
	}
</script>

{#if division && divState}
	{#if divState.unlocked}
		<DivisionDetailTemplate
			{division}
			state={divState}
			{cash}
			onBuyTier={handleBuyTier}
			onTapTier={handleTapTier}
			onHireChief={handleHireChief}
			onUnlockTier={handleUnlockTier}
		/>
	{:else}
		<!-- Division unlock screen -->
		<div class="space-y-4">
			<!-- Division header (same as template) -->
			<div class="flex items-center gap-3">
				<div
					class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
					style="background-color: {division.color}12; border: 1px solid {division.color}25;"
				>
					{division.icon}
				</div>
				<div class="flex-1 min-w-0">
					<h1 class="text-xl font-bold truncate" style="color: {division.color};">
						{division.name}
					</h1>
					<p class="text-xs text-text-secondary mt-0.5">{division.description}</p>
				</div>
			</div>

			<!-- Unlock card -->
			<div class="relative rounded-2xl border border-white/10 overflow-hidden"
				style="background: linear-gradient(135deg, {division.color}08 0%, {division.color}03 100%);"
			>
				{#if showUnlockCelebration}
					<div class="absolute inset-0 pointer-events-none z-20">
						{#each Array(30) as _, i}
							<div
								class="confetti-particle"
								style="
									--delay: {Math.random() * 0.6}s;
									--x-end: {Math.random() * 200 - 100}px;
									--rotation: {Math.random() * 720 - 360}deg;
									--color: {['#FF4444', '#44FF88', '#FFCC44', '#4488FF', '#9944FF', '#44DDFF'][i % 6]};
									left: {Math.random() * 100}%;
								"
							></div>
						{/each}
						<div class="unlock-flash" style="background-color: {division.color};"></div>
					</div>
				{/if}

				<div class="p-6 text-center">
					<div class="text-5xl mb-4">🔒</div>
					<h2 class="text-lg font-bold text-text-primary mb-2">
						Unlock {division.name}
					</h2>
					{#if unlockReq}
						<p class="text-sm text-text-secondary mb-2">
							{unlockReq.description}
						</p>
						<p class="text-xs italic mb-6" style="color: {division.color}80;">
							{unlockReq.flavorText}
						</p>
					{/if}

					<!-- Tier previews (greyed out) -->
					<div class="flex flex-wrap justify-center gap-2 mb-6">
						{#each division.tiers as tier, i}
							<div class="px-3 py-1.5 rounded-lg bg-bg-tertiary/30 text-xs text-text-muted">
								T{i + 1}: {tier.name}
							</div>
						{/each}
					</div>

					<!-- Unlock button -->
					<button
						onclick={handleUnlockDivision}
						class="w-full max-w-sm mx-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl
							   text-base font-bold transition-all duration-200 active:scale-[0.97] touch-manipulation"
						style="background-color: {canAffordDivision ? division.color + '25' : 'var(--color-bg-tertiary)'};
							   color: {canAffordDivision ? division.color : 'var(--color-text-muted)'};
							   border: 2px solid {canAffordDivision ? division.color + '40' : 'transparent'};"
						disabled={!canAffordDivision}
					>
						<span>🚀 Invest {unlockReq ? formatCurrency(divUnlockCost) : ''}</span>
					</button>

					{#if !canAffordDivision}
						<p class="text-xs text-text-muted mt-2">
							Need {unlockReq ? formatCurrency(divUnlockCost) : ''} · Current: {formatCurrency(cash)}
						</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
{:else}
	<!-- Unknown division -->
	<div class="bg-bg-secondary/30 rounded-xl p-8 border border-white/5 text-center">
		<div class="text-4xl mb-3">❓</div>
		<h2 class="text-base font-semibold text-text-primary mb-1">Division Not Found</h2>
		<p class="text-sm text-text-muted">This division doesn't exist yet.</p>
	</div>
{/if}

<style>
	.confetti-particle {
		position: absolute;
		top: 0;
		width: 10px;
		height: 10px;
		border-radius: 2px;
		background-color: var(--color);
		animation: confettiBurst 2s ease-out var(--delay) forwards;
	}

	@keyframes confettiBurst {
		0% {
			transform: translateY(50%) rotate(0deg) scale(0);
			opacity: 0;
		}
		10% {
			opacity: 1;
			transform: translateY(0) rotate(0deg) scale(1);
		}
		100% {
			transform: translateX(var(--x-end)) translateY(300px) rotate(var(--rotation));
			opacity: 0;
		}
	}

	.unlock-flash {
		position: absolute;
		inset: 0;
		animation: divisionFlash 0.8s ease-out forwards;
	}

	@keyframes divisionFlash {
		0% { opacity: 0.35; }
		100% { opacity: 0; }
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
