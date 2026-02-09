<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { gameManager } from '$lib/engine/GameManager';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';
	import { getColonyMilestone } from '$lib/systems/PrestigeSystem';

	let gs = $derived($gameState);
	let colonyTech = $derived(gs.colonyTech);
	let prestigeCount = $derived(gs.prestigeCount);
	let totalValueEarned = $derived(gs.totalValueEarned);
	let currentMultiplier = $derived(gameManager.getPrestigeMultiplier(gs));
	let techEarnable = $derived(gameManager.calculatePrestigeVision(gs));
	let postPrestigeTech = $derived(colonyTech + techEarnable);
	let postPrestigeMultiplier = $derived(1 + postPrestigeTech * 0.03);
	let canPrestige = $derived(techEarnable > 0);

	let currentColony = $derived(getColonyMilestone(prestigeCount));
	let nextColony = $derived(getColonyMilestone(prestigeCount + 1));

	// Threshold: $100M for first reset, then scales
	const BASE_THRESHOLD = 100_000_000;
	let threshold = $derived(BASE_THRESHOLD * Math.pow(10, techEarnable));
	let progressToNext = $derived(
		techEarnable > 0
			? Math.min(1, (totalValueEarned - threshold / 10) / (threshold - threshold / 10))
			: totalValueEarned / BASE_THRESHOLD
	);

	let showConfirmation = $state(false);
	let launchAnimating = $state(false);

	function openConfirmation() {
		if (!canPrestige) return;
		showConfirmation = true;
	}

	function cancelPrestige() {
		showConfirmation = false;
	}

	function executePrestige() {
		showConfirmation = false;
		launchAnimating = true;
		setTimeout(() => {
			const earned = gameManager.prestige();
			if (earned > 0) {
				setTimeout(() => {
					launchAnimating = false;
				}, 2000);
			} else {
				launchAnimating = false;
			}
		}, 500);
	}
</script>

<!-- Launch Flash overlay -->
{#if launchAnimating}
	<div class="fixed inset-0 z-[200] flex items-center justify-center launch-flash">
		<div class="text-center launch-content">
			<div class="text-6xl mb-4">🚀</div>
			<h1 class="text-3xl font-black text-white tracking-tight">COLONY LAUNCHED</h1>
			<p class="text-lg text-white/70 mt-2">{nextColony.destination} awaits...</p>
		</div>
	</div>
{/if}

<div class="prestige-view space-y-5">
	<!-- Header -->
	<div>
		<h1 class="text-xl font-bold text-text-primary flex items-center gap-2">
			<span>🪐</span> New Colony
		</h1>
		<p class="text-sm text-text-secondary mt-0.5">
			Take your tech to a new frontier. Start fresh, but stronger.
		</p>
	</div>

	<!-- Colony Tech Display -->
	<div
		class="relative overflow-hidden rounded-xl p-5 border border-white/5"
		style="background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(68, 136, 255, 0.12) 100%);"
	>
		<div class="relative z-10">
			<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">
				Colony Tech
			</div>
			<div class="text-4xl font-black text-electric-blue tabular-nums font-mono">
				{colonyTech}
			</div>
			{#if colonyTech > 0}
				<div class="mt-2 flex items-center gap-2">
					<span class="text-sm text-text-secondary">Production Speed:</span>
					<span class="text-sm font-bold text-electric-blue">×{currentMultiplier.toFixed(2)}</span>
					<span class="text-xs text-text-muted">(+{Math.round((currentMultiplier - 1) * 100)}%)</span>
				</div>
			{:else}
				<p class="text-sm text-text-muted mt-2">
					Launch your first colony to earn Colony Tech.
				</p>
			{/if}
		</div>
		{#if colonyTech > 0}
			<div
				class="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-15 blur-3xl"
				style="background: var(--color-electric-blue);"
			></div>
		{/if}
	</div>

	<!-- Current Colony Status -->
	<div class="bg-bg-secondary/60 rounded-xl p-4 border border-white/[0.03]">
		<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">
			Current Colony
		</div>
		<div class="flex items-center gap-4">
			<div class="text-4xl">
				{#if prestigeCount === 0}🌍{:else if prestigeCount === 1}🌙{:else if prestigeCount <= 3}🔴{:else if prestigeCount === 4}🟠{:else}🌌{/if}
			</div>
			<div>
				<div class="text-lg font-bold text-text-primary">{currentColony.name}</div>
				<div class="text-sm text-text-secondary">{currentColony.destination}</div>
				<div class="text-xs text-text-muted mt-1">{currentColony.unlock}</div>
			</div>
		</div>
	</div>

	<!-- Current Run Stats -->
	<div class="bg-bg-secondary/60 rounded-xl p-4 border border-white/[0.03]">
		<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">
			This Colony
		</div>
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<span class="text-sm text-text-secondary">Total Value Earned</span>
				<span class="text-sm font-bold text-text-primary tabular-nums font-mono">
					{formatCurrency(totalValueEarned)}
				</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-sm text-text-secondary">Current Cash</span>
				<span class="text-sm font-bold text-text-primary tabular-nums font-mono">
					{formatCurrency(gs.cash)}
				</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-sm text-text-secondary">Launch Threshold</span>
				<span class="text-sm font-mono text-text-muted">
					{formatCurrency(BASE_THRESHOLD)} lifetime
				</span>
			</div>
		</div>
	</div>

	<!-- Colony Launch Preview -->
	<div
		class="rounded-xl p-4 border-2 transition-all duration-300 {canPrestige ? 'border-electric-blue bg-electric-blue/5' : 'border-white/5 bg-bg-secondary/40'}"
	>
		<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">
			{canPrestige ? '🚀 Launch Preview' : '🔒 Not Ready'}
		</div>

		{#if canPrestige}
			<div class="space-y-3">
				<!-- Next destination -->
				<div class="flex items-center gap-3 mb-4 p-3 bg-bg-tertiary/50 rounded-lg">
					<div class="text-3xl">
						{#if prestigeCount === 0}🌙{:else if prestigeCount <= 2}🔴{:else if prestigeCount === 3}🟠{:else}🌌{/if}
					</div>
					<div>
						<div class="text-sm font-bold text-text-primary">Next: {nextColony.name}</div>
						<div class="text-xs text-text-muted">{nextColony.unlock}</div>
					</div>
				</div>

				<div class="flex items-center justify-between">
					<span class="text-sm text-text-secondary">Colony Tech Earned</span>
					<span class="text-xl font-black text-electric-blue tabular-nums">
						+{techEarnable}
					</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm text-text-secondary">New Total</span>
					<span class="text-sm font-bold text-text-primary tabular-nums">
						{colonyTech} → {postPrestigeTech}
					</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm text-text-secondary">New Speed Bonus</span>
					<span class="text-sm font-bold text-electric-blue tabular-nums">
						×{currentMultiplier.toFixed(2)} → ×{postPrestigeMultiplier.toFixed(2)}
					</span>
				</div>
			</div>
		{:else}
			<p class="text-sm text-text-muted">
				Earn at least <span class="font-bold text-text-secondary">{formatCurrency(BASE_THRESHOLD)}</span> lifetime value to launch a new colony.
				{#if totalValueEarned > 0}
					<br />
					<span class="text-xs mt-1 inline-block">
						Progress: {formatCurrency(totalValueEarned)} / {formatCurrency(BASE_THRESHOLD)}
						({(totalValueEarned / BASE_THRESHOLD * 100).toFixed(1)}%)
					</span>
				{/if}
			</p>
			<div class="mt-3">
				<div class="w-full h-2 rounded-full bg-bg-tertiary overflow-hidden">
					<div
						class="h-full rounded-full transition-all duration-500"
						style="width: {Math.max(0, Math.min(100, progressToNext * 100))}%; background: var(--color-text-muted);"
					></div>
				</div>
			</div>
		{/if}
	</div>

	<!-- What You Keep / What You Lose -->
	<div class="grid grid-cols-2 gap-3">
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-bio-green/20">
			<div class="text-[10px] text-bio-green uppercase tracking-wider font-semibold mb-2">
				✅ You Keep
			</div>
			<ul class="space-y-1.5">
				<li class="text-xs text-text-secondary flex items-center gap-1.5">
					<span class="text-bio-green">•</span> Colony Tech
				</li>
				<li class="text-xs text-text-secondary flex items-center gap-1.5">
					<span class="text-bio-green">•</span> Research
				</li>
				<li class="text-xs text-text-secondary flex items-center gap-1.5">
					<span class="text-bio-green">•</span> Achievements
				</li>
				{#if prestigeCount > 0 || techEarnable > 0}
					<li class="text-xs text-text-secondary flex items-center gap-1.5">
						<span class="text-bio-green">•</span> All Divisions
					</li>
				{/if}
			</ul>
		</div>
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-rocket-red/20">
			<div class="text-[10px] text-rocket-red uppercase tracking-wider font-semibold mb-2">
				❌ Reset
			</div>
			<ul class="space-y-1.5">
				<li class="text-xs text-text-secondary flex items-center gap-1.5">
					<span class="text-rocket-red">•</span> Cash
				</li>
				<li class="text-xs text-text-secondary flex items-center gap-1.5">
					<span class="text-rocket-red">•</span> Tiers
				</li>
				<li class="text-xs text-text-secondary flex items-center gap-1.5">
					<span class="text-rocket-red">•</span> Managers
				</li>
				<li class="text-xs text-text-secondary flex items-center gap-1.5">
					<span class="text-rocket-red">•</span> Treasury
				</li>
			</ul>
		</div>
	</div>

	<!-- The Big Launch Button -->
	<div class="pt-2 pb-4">
		<button
			onclick={openConfirmation}
			disabled={!canPrestige}
			class="launch-button group w-full relative overflow-hidden rounded-2xl p-5
				   transition-all duration-300 touch-manipulation
				   active:scale-[0.97]
				   disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
			class:launch-ready={canPrestige}
		>
			{#if canPrestige}
				<div class="absolute inset-0 launch-gradient"></div>
				<div class="absolute inset-0 launch-shimmer"></div>
			{:else}
				<div class="absolute inset-0 bg-bg-tertiary"></div>
			{/if}

			<div class="relative z-10 text-center">
				<div class="text-3xl mb-1">🚀</div>
				<div class="text-xl font-black text-white tracking-tight">
					{canPrestige ? 'LAUNCH COLONY' : 'NOT READY'}
				</div>
				<div class="text-sm mt-1 {canPrestige ? 'text-white/70' : 'text-text-muted'}">
					{#if canPrestige}
						Expand to {nextColony.destination} for <span class="font-bold text-white">+{techEarnable} Tech</span>
					{:else}
						Earn {formatCurrency(BASE_THRESHOLD)} lifetime to unlock
					{/if}
				</div>
			</div>
		</button>
	</div>

	<!-- Formula explanation -->
	<div class="bg-bg-secondary/30 rounded-xl p-4 border border-white/5">
		<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-2">
			📐 How Colony Tech Works
		</div>
		<div class="space-y-1.5">
			<p class="text-xs text-text-muted">
				Each Colony Tech point gives <span class="text-electric-blue font-semibold">+3%</span> production speed, permanently.
			</p>
			<p class="text-xs text-text-muted">
				Colony Tech is earned based on your lifetime earnings when you launch.
			</p>
			<p class="text-xs text-text-muted">
				Each new colony unlocks permanent bonuses. The more you build, the faster you grow.
			</p>
		</div>
	</div>
</div>

<!-- Confirmation Dialog -->
{#if showConfirmation}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
		role="dialog"
		aria-modal="true"
	>
		<div class="bg-bg-secondary rounded-2xl p-6 max-w-sm w-full border border-electric-blue/30 shadow-2xl confirm-enter">
			<div class="text-center">
				<div class="text-5xl mb-3">🚀</div>
				<h2 class="text-xl font-black text-text-primary">Launch to {nextColony.destination}?</h2>
				<p class="text-sm text-text-secondary mt-2 leading-relaxed">
					This will <span class="text-rocket-red font-semibold">reset progress</span> but you'll earn
					<span class="text-electric-blue font-bold">+{techEarnable} Colony Tech</span>.
				</p>

				<div class="bg-bg-tertiary/50 rounded-xl p-3 mt-4 space-y-1.5">
					<div class="flex items-center justify-between">
						<span class="text-xs text-text-muted">Colony Tech</span>
						<span class="text-sm font-bold text-electric-blue">
							{colonyTech} → {postPrestigeTech}
						</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-xs text-text-muted">Speed Bonus</span>
						<span class="text-sm font-bold text-electric-blue">
							×{currentMultiplier.toFixed(2)} → ×{postPrestigeMultiplier.toFixed(2)}
						</span>
					</div>
				</div>
			</div>

			<div class="flex gap-3 mt-6">
				<button
					onclick={cancelPrestige}
					class="flex-1 py-3 px-4 rounded-xl bg-bg-tertiary text-text-secondary font-semibold
						   transition-all duration-200 active:scale-95 touch-manipulation"
				>
					Not Yet
				</button>
				<button
					onclick={executePrestige}
					class="flex-1 py-3 px-4 rounded-xl font-semibold text-white
						   transition-all duration-200 active:scale-95 touch-manipulation"
					style="background: linear-gradient(135deg, #4488FF 0%, #2266CC 100%);"
				>
					🚀 Launch
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.launch-gradient {
		background: linear-gradient(135deg, #4488FF 0%, #2266CC 50%, #1144AA 100%);
	}

	.launch-shimmer {
		background: linear-gradient(
			110deg,
			transparent 20%,
			rgba(255, 255, 255, 0.08) 40%,
			rgba(255, 255, 255, 0.12) 50%,
			rgba(255, 255, 255, 0.08) 60%,
			transparent 80%
		);
		background-size: 200% 100%;
		animation: shimmer 3s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	.launch-ready:hover .launch-shimmer {
		animation-duration: 1.5s;
	}

	.launch-flash {
		background: linear-gradient(135deg, rgba(68, 136, 255, 0.95), rgba(34, 102, 204, 0.95));
		animation: flashIn 0.3s ease-out, flashHold 2s ease-in 0.3s forwards;
	}

	.launch-content {
		animation: contentPop 0.5s ease-out 0.2s both;
	}

	@keyframes flashIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes flashHold {
		0% { opacity: 1; }
		70% { opacity: 1; }
		100% { opacity: 0; }
	}

	@keyframes contentPop {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.confirm-enter {
		animation: confirmSlideUp 0.3s ease-out;
	}

	@keyframes confirmSlideUp {
		from {
			opacity: 0;
			transform: translateY(20px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
