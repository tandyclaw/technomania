<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { gameManager } from '$lib/engine/GameManager';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';

	let state = $derived($gameState);
	let foundersVision = $derived(state.foundersVision);
	let prestigeCount = $derived(state.prestigeCount);
	let totalValueEarned = $derived(state.totalValueEarned);
	let currentMultiplier = $derived(gameManager.getPrestigeMultiplier(state));
	let visionEarnable = $derived(gameManager.calculatePrestigeVision(state));
	let postPrestigeVision = $derived(foundersVision + visionEarnable);
	let postPrestigeMultiplier = $derived(1 + postPrestigeVision * 0.1);
	let canPrestige = $derived(visionEarnable > 0);

	// Threshold for next vision point
	let nextThreshold = $derived(1_000_000 * Math.pow(2, visionEarnable + 1));
	let progressToNext = $derived(
		visionEarnable > 0
			? Math.min(1, (totalValueEarned - 1_000_000 * Math.pow(2, visionEarnable)) / (nextThreshold - 1_000_000 * Math.pow(2, visionEarnable)))
			: totalValueEarned >= 1_000_000
				? Math.min(1, (totalValueEarned - 1_000_000) / 1_000_000)
				: totalValueEarned / 1_000_000
	);

	let showConfirmation = $state(false);
	let ipoAnimating = $state(false);

	function openConfirmation() {
		if (!canPrestige) return;
		showConfirmation = true;
	}

	function cancelPrestige() {
		showConfirmation = false;
	}

	function executePrestige() {
		showConfirmation = false;
		ipoAnimating = true;
		// Short delay for dramatic effect
		setTimeout(() => {
			const earned = gameManager.prestige();
			if (earned > 0) {
				// Animation will resolve after state resets
				setTimeout(() => {
					ipoAnimating = false;
				}, 1500);
			} else {
				ipoAnimating = false;
			}
		}, 500);
	}
</script>

<!-- IPO Flash overlay -->
{#if ipoAnimating}
	<div class="fixed inset-0 z-[200] flex items-center justify-center ipo-flash">
		<div class="text-center ipo-content">
			<div class="text-6xl mb-4">🔔</div>
			<h1 class="text-3xl font-black text-white tracking-tight">IPO COMPLETE</h1>
			<p class="text-lg text-white/70 mt-2">A new chapter begins…</p>
		</div>
	</div>
{/if}

<div class="prestige-view space-y-5">
	<!-- Header -->
	<div>
		<h1 class="text-xl font-bold text-text-primary flex items-center gap-2">
			<span>🏛️</span> The IPO
		</h1>
		<p class="text-sm text-text-secondary mt-0.5">
			Cash out, reset, come back stronger.
		</p>
	</div>

	<!-- Founder's Vision Display -->
	<div
		class="relative overflow-hidden rounded-xl p-5 border border-white/5"
		style="background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(153, 68, 255, 0.12) 100%);"
	>
		<div class="relative z-10">
			<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">
				Founder's Vision
			</div>
			<div class="text-4xl font-black text-neural-purple tabular-nums font-mono">
				{foundersVision}
			</div>
			{#if foundersVision > 0}
				<div class="mt-2 flex items-center gap-2">
					<span class="text-sm text-text-secondary">Global Multiplier:</span>
					<span class="text-sm font-bold text-neural-purple">×{currentMultiplier.toFixed(1)}</span>
					<span class="text-xs text-text-muted">(+{(foundersVision * 10)}% to all revenue)</span>
				</div>
			{:else}
				<p class="text-sm text-text-muted mt-2">
					Perform your first IPO to earn Founder's Vision points.
				</p>
			{/if}
		</div>
		<!-- Glow -->
		{#if foundersVision > 0}
			<div
				class="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-15 blur-3xl"
				style="background: var(--color-neural-purple);"
			></div>
		{/if}
	</div>

	<!-- Prestige History -->
	{#if prestigeCount > 0}
		<div class="bg-bg-secondary/60 rounded-xl p-4 border border-white/[0.03]">
			<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-2">
				IPO History
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div>
					<div class="text-[10px] text-text-muted">Times IPO'd</div>
					<div class="text-lg font-bold text-text-primary tabular-nums">{prestigeCount}</div>
				</div>
				<div>
					<div class="text-[10px] text-text-muted">Timeline</div>
					<div class="text-lg font-bold text-text-primary tabular-nums">#{prestigeCount + 1}</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Current Run Stats -->
	<div class="bg-bg-secondary/60 rounded-xl p-4 border border-white/[0.03]">
		<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">
			This Run
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
					{formatCurrency(state.cash)}
				</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-sm text-text-secondary">IPO Threshold</span>
				<span class="text-sm font-mono text-text-muted">
					{formatCurrency(1_000_000)} total value
				</span>
			</div>
		</div>
	</div>

	<!-- Vision Earnings Preview -->
	<div
		class="rounded-xl p-4 border-2 transition-all duration-300 {canPrestige ? 'border-neural-purple bg-neural-purple/5' : 'border-white/5 bg-bg-secondary/40'}"
	>
		<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">
			{canPrestige ? '🔮 IPO Preview' : '🔒 Not Ready'}
		</div>

		{#if canPrestige}
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-sm text-text-secondary">Vision Points Earned</span>
					<span class="text-xl font-black text-neural-purple tabular-nums">
						+{visionEarnable}
					</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm text-text-secondary">New Total Vision</span>
					<span class="text-sm font-bold text-text-primary tabular-nums">
						{foundersVision} → {postPrestigeVision}
					</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm text-text-secondary">New Multiplier</span>
					<span class="text-sm font-bold text-neural-purple tabular-nums">
						×{currentMultiplier.toFixed(1)} → ×{postPrestigeMultiplier.toFixed(1)}
					</span>
				</div>

				<!-- Progress to next point -->
				<div class="mt-2">
					<div class="flex items-center justify-between mb-1">
						<span class="text-[10px] text-text-muted">Progress to +1 more</span>
						<span class="text-[10px] text-text-muted">
							{formatCurrency(totalValueEarned)} / {formatCurrency(nextThreshold)}
						</span>
					</div>
					<div class="w-full h-2 rounded-full bg-bg-tertiary overflow-hidden">
						<div
							class="h-full rounded-full transition-all duration-500"
							style="width: {Math.max(0, Math.min(100, progressToNext * 100))}%; background: var(--color-neural-purple);"
						></div>
					</div>
				</div>
			</div>
		{:else}
			<p class="text-sm text-text-muted">
				Earn at least <span class="font-bold text-text-secondary">{formatCurrency(1_000_000)}</span> total value to unlock the IPO.
				{#if totalValueEarned > 0}
					<br />
					<span class="text-xs mt-1 inline-block">
						Progress: {formatCurrency(totalValueEarned)} / {formatCurrency(1_000_000)}
						({(totalValueEarned / 1_000_000 * 100).toFixed(1)}%)
					</span>
				{/if}
			</p>
			<!-- Progress bar to first IPO -->
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
					<span class="text-bio-green">•</span> Founder's Vision
				</li>
				<li class="text-xs text-text-secondary flex items-center gap-1.5">
					<span class="text-bio-green">•</span> Research Unlocks
				</li>
				<li class="text-xs text-text-secondary flex items-center gap-1.5">
					<span class="text-bio-green">•</span> Achievements
				</li>
				<li class="text-xs text-text-secondary flex items-center gap-1.5">
					<span class="text-bio-green">•</span> Lifetime Stats
				</li>
				{#if prestigeCount > 0 || visionEarnable > 0}
					<li class="text-xs text-text-secondary flex items-center gap-1.5">
						<span class="text-bio-green">•</span> All Divisions Unlocked
					</li>
				{/if}
			</ul>
		</div>
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-rocket-red/20">
			<div class="text-[10px] text-rocket-red uppercase tracking-wider font-semibold mb-2">
				❌ You Lose
			</div>
			<ul class="space-y-1.5">
				<li class="text-xs text-text-secondary flex items-center gap-1.5">
					<span class="text-rocket-red">•</span> All Cash
				</li>
				<li class="text-xs text-text-secondary flex items-center gap-1.5">
					<span class="text-rocket-red">•</span> Tier Upgrades
				</li>
				<li class="text-xs text-text-secondary flex items-center gap-1.5">
					<span class="text-rocket-red">•</span> Division Chiefs
				</li>
				<li class="text-xs text-text-secondary flex items-center gap-1.5">
					<span class="text-rocket-red">•</span> Research Points
				</li>
				<li class="text-xs text-text-secondary flex items-center gap-1.5">
					<span class="text-rocket-red">•</span> Production Progress
				</li>
			</ul>
		</div>
	</div>

	<!-- The Big IPO Button -->
	<div class="pt-2 pb-4">
		<button
			onclick={openConfirmation}
			disabled={!canPrestige}
			class="ipo-button group w-full relative overflow-hidden rounded-2xl p-5
				   transition-all duration-300 touch-manipulation
				   active:scale-[0.97]
				   disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
			class:ipo-ready={canPrestige}
		>
			<!-- Animated background for ready state -->
			{#if canPrestige}
				<div class="absolute inset-0 ipo-gradient"></div>
				<div class="absolute inset-0 ipo-shimmer"></div>
			{:else}
				<div class="absolute inset-0 bg-bg-tertiary"></div>
			{/if}

			<div class="relative z-10 text-center">
				<div class="text-3xl mb-1">🔔</div>
				<div class="text-xl font-black text-white tracking-tight">
					{canPrestige ? 'RING THE BELL' : 'IPO LOCKED'}
				</div>
				<div class="text-sm mt-1 {canPrestige ? 'text-white/70' : 'text-text-muted'}">
					{#if canPrestige}
						Take the company public for <span class="font-bold text-white">+{visionEarnable} Vision</span>
					{:else}
						Earn {formatCurrency(1_000_000)} total value to unlock
					{/if}
				</div>
			</div>
		</button>
	</div>

	<!-- Formula explanation -->
	<div class="bg-bg-secondary/30 rounded-xl p-4 border border-white/5">
		<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-2">
			📐 How It Works
		</div>
		<div class="space-y-1.5">
			<p class="text-xs text-text-muted">
				<span class="font-mono text-text-secondary">Vision = floor(log₂(totalValue / $1M))</span>
			</p>
			<p class="text-xs text-text-muted">
				Each Vision point grants <span class="text-neural-purple font-semibold">+10%</span> to all production revenue, permanently.
			</p>
			<p class="text-xs text-text-muted">
				IPO resets your cash, tiers, and chiefs — but you keep research, achievements, and your accumulated Vision.
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
		aria-label="Confirm IPO"
	>
		<div class="bg-bg-secondary rounded-2xl p-6 max-w-sm w-full border border-neural-purple/30 shadow-2xl confirm-enter">
			<div class="text-center">
				<div class="text-5xl mb-3">🔔</div>
				<h2 class="text-xl font-black text-text-primary">Ring the Bell?</h2>
				<p class="text-sm text-text-secondary mt-2 leading-relaxed">
					You're about to take your company public.
					This will <span class="text-rocket-red font-semibold">reset all progress</span> but earn you
					<span class="text-neural-purple font-bold">+{visionEarnable} Founder's Vision</span>.
				</p>

				<div class="bg-bg-tertiary/50 rounded-xl p-3 mt-4 space-y-1.5">
					<div class="flex items-center justify-between">
						<span class="text-xs text-text-muted">Vision</span>
						<span class="text-sm font-bold text-neural-purple">
							{foundersVision} → {postPrestigeVision}
						</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-xs text-text-muted">Multiplier</span>
						<span class="text-sm font-bold text-neural-purple">
							×{currentMultiplier.toFixed(1)} → ×{postPrestigeMultiplier.toFixed(1)}
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
					style="background: linear-gradient(135deg, #9944FF 0%, #6622CC 100%);"
				>
					🔔 Do It
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.ipo-gradient {
		background: linear-gradient(135deg, #9944FF 0%, #6622CC 50%, #4411AA 100%);
	}

	.ipo-shimmer {
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

	.ipo-ready:hover .ipo-shimmer {
		animation-duration: 1.5s;
	}

	.ipo-flash {
		background: rgba(153, 68, 255, 0.95);
		animation: flashIn 0.3s ease-out, flashHold 1.5s ease-in 0.3s forwards;
	}

	.ipo-content {
		animation: contentPop 0.5s ease-out 0.2s both;
	}

	@keyframes flashIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
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
