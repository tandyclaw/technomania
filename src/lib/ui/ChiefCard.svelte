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
	let baseNextCost = $derived(getNextChiefCost(chiefLevel));
	let nextCost = $derived(baseNextCost !== null ? baseNextCost * $ngPlusCostMultiplier : null);
	let canAfford = $derived(nextCost !== null && cash >= nextCost);
	let isMaxLevel = $derived(chiefLevel >= CHIEF_LEVELS.length);
	let isHired = $derived(chiefLevel > 0);

	// Buy Max calculation
	let buyMaxInfo = $derived(() => {
		let totalCost = 0;
		let levels = 0;
		let level = chiefLevel;
		let remaining = cash;
		while (level < CHIEF_LEVELS.length) {
			const cost = CHIEF_LEVELS[level].cost;
			if (remaining < cost) break;
			remaining -= cost;
			totalCost += cost;
			level++;
			levels++;
		}
		return { levels, totalCost };
	});

	// Celebration state
	let showCelebration = $state(false);
	let celebrationLevel = $state(0);

	function handleHire() {
		if (!canAfford || !onHire) return;
		const prevLevel = chiefLevel;
		onHire();
		// Trigger celebration animation
		celebrationLevel = prevLevel + 1;
		showCelebration = true;
		setTimeout(() => { showCelebration = false; }, 2500);
	}

	function handleBuyMax() {
		if (!onHire) return;
		const info = buyMaxInfo();
		if (info.levels === 0) return;
		for (let i = 0; i < info.levels; i++) {
			onHire();
		}
		celebrationLevel = chiefLevel;
		showCelebration = true;
		setTimeout(() => { showCelebration = false; }, 2500);
	}
</script>

{#if chief}
	<div class="chief-card relative rounded-xl border overflow-hidden transition-all duration-300
		{isHired ? '' : 'border-white/5 bg-bg-secondary/30'}"
		style={isHired ? `background-color: ${color}08; border-color: ${color}20;` : ''}
		data-tutorial-id="chief-card"
	>
		<!-- Celebration overlay -->
		{#if showCelebration}
			<div class="celebration-overlay absolute inset-0 pointer-events-none z-20">
				<!-- Confetti particles -->
				{#each Array(20) as _, i}
					<div
						class="confetti"
						style="
							--delay: {Math.random() * 0.5}s;
							--x: {Math.random() * 100}%;
							--rotation: {Math.random() * 720 - 360}deg;
							--color: {['#FF4444', '#44FF88', '#FFCC44', '#4488FF', '#9944FF', '#44DDFF'][i % 6]};
							left: {Math.random() * 100}%;
						"
					></div>
				{/each}
				<!-- Flash overlay -->
				<div class="hire-flash" style="background-color: {color};"></div>
			</div>

			<!-- Level up toast -->
			<div class="level-toast absolute top-2 left-1/2 -translate-x-1/2 z-30
				px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
				style="background-color: {color}; color: #0f1729;"
			>
				{celebrationLevel === 1 ? '🎉 CHIEF HIRED!' : `⬆️ LEVEL ${celebrationLevel}!`}
			</div>
		{/if}

		<div class="p-4">
			<!-- Chief info row -->
			<div class="flex items-start gap-3">
				<!-- Portrait -->
				<div
					class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-all duration-300"
					style="background-color: {isHired ? color + '20' : 'var(--color-bg-tertiary)'};
						   border: 2px solid {isHired ? color + '40' : 'transparent'};"
				>
					{#if isHired}
						{chief.portrait}
					{:else}
						<span class="text-text-muted text-lg">👤</span>
					{/if}
				</div>

				<!-- Info -->
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<h3 class="text-sm font-bold truncate"
							style="color: {isHired ? color : 'var(--color-text-primary)'};"
						>
							{chief.name}
						</h3>
						{#if isHired && currentLevelData}
							<span class="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
								style="background-color: {color}20; color: {color};"
							>
								Lv.{chiefLevel} · {currentLevelData.label}
							</span>
						{/if}
					</div>
					<p class="text-xs text-text-muted mt-0.5">{chief.title}</p>

					{#if isHired}
						<p class="text-[11px] italic mt-1" style="color: {color}90;">
							{chief.quip}
						</p>
					{:else}
						<p class="text-xs text-text-secondary mt-1">
							Hire to <strong>automate all production</strong> in this division
						</p>
					{/if}
				</div>
			</div>

			<!-- Current bonus display -->
			{#if isHired && currentLevelData}
				<div class="mt-3 flex items-center gap-2">
					<div class="flex-1 bg-bg-tertiary/30 rounded-lg px-3 py-1.5">
						<span class="text-[10px] text-text-muted uppercase tracking-wider">Speed</span>
						<span class="text-xs font-bold ml-1" style="color: {color};">
							{currentLevelData.speedMultiplier}x
						</span>
					</div>
					<div class="flex-1 bg-bg-tertiary/30 rounded-lg px-3 py-1.5">
						<span class="text-[10px] text-text-muted uppercase tracking-wider">Status</span>
						<span class="text-xs font-bold ml-1 text-bio-green">
							Auto ✓
						</span>
					</div>
				</div>
			{/if}

			<!-- Hire / Upgrade button -->
			{#if !isMaxLevel}
				<button
					onclick={handleHire}
					class="mt-3 w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-bold
						   transition-all duration-200 active:scale-[0.97] touch-manipulation"
					style="background-color: {canAfford ? color + '20' : 'var(--color-bg-tertiary)'};
						   color: {canAfford ? color : 'var(--color-text-muted)'};
						   border: 1.5px solid {canAfford ? color + '35' : 'transparent'};"
					disabled={!canAfford}
					aria-label="{!isHired ? 'Hire' : 'Upgrade'} {chief?.name ?? 'Chief'}{nextCost !== null ? ` for ${formatCurrency(nextCost)}` : ''}"
				>
					<span class="flex items-center gap-2">
						{#if !isHired}
							<span class="text-base" aria-hidden="true">👔</span>
							<span>Hire Chief</span>
						{:else}
							<span class="text-base" aria-hidden="true">⬆️</span>
							<span>Upgrade to Lv.{chiefLevel + 1}</span>
						{/if}
					</span>
					<span class="font-mono tabular-nums opacity-80">
						{nextCost !== null ? formatCurrency(nextCost) : '—'}
					</span>
				</button>

				{#if nextLevelData && isHired}
					<p class="text-[10px] text-text-muted mt-1.5 text-center">
						Next: {nextLevelData.speedMultiplier}x speed · {nextLevelData.description}
					</p>
				{/if}

				<!-- Buy Max button -->
				{#if isHired && buyMaxInfo().levels > 1}
					{@const info = buyMaxInfo()}
					<button
						onclick={handleBuyMax}
						class="mt-2 w-full flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold
							   transition-all duration-200 active:scale-[0.97] touch-manipulation"
						style="background-color: {color}10; color: {color}; border: 1px solid {color}25;"
					>
						<span>🚀 Buy Max (+{info.levels} levels)</span>
						<span class="font-mono tabular-nums opacity-80">{formatCurrency(info.totalCost)}</span>
					</button>
				{/if}
			{:else}
				<div class="mt-3 text-center py-2">
					<span class="text-xs font-bold" style="color: {color};">
						✨ Maximum Level Reached ✨
					</span>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.celebration-overlay {
		animation: celebrationFade 2.5s ease-out forwards;
	}

	@keyframes celebrationFade {
		0% { opacity: 1; }
		70% { opacity: 1; }
		100% { opacity: 0; }
	}

	.hire-flash {
		position: absolute;
		inset: 0;
		opacity: 0;
		animation: flashPulse 0.6s ease-out;
	}

	@keyframes flashPulse {
		0% { opacity: 0.4; }
		100% { opacity: 0; }
	}

	.confetti {
		position: absolute;
		top: -8px;
		width: 8px;
		height: 8px;
		border-radius: 2px;
		background-color: var(--color);
		animation: confettiFall 2s ease-in var(--delay) forwards;
		transform: rotate(0deg);
	}

	@keyframes confettiFall {
		0% {
			transform: translateY(0) rotate(0deg);
			opacity: 1;
		}
		100% {
			transform: translateY(200px) rotate(var(--rotation));
			opacity: 0;
		}
	}

	.level-toast {
		animation: toastBounce 2.5s ease-out forwards;
	}

	@keyframes toastBounce {
		0% { transform: translate(-50%, -20px) scale(0.5); opacity: 0; }
		15% { transform: translate(-50%, 0) scale(1.1); opacity: 1; }
		25% { transform: translate(-50%, 0) scale(1); }
		80% { opacity: 1; }
		100% { transform: translate(-50%, -10px); opacity: 0; }
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
