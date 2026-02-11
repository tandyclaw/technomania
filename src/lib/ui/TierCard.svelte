<script lang="ts">
	import type { TierState, GameState } from '$lib/stores/gameState';
	import type { TierData } from '$lib/divisions';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';
	import { calculateCost, calculateRevenue, getCycleDurationMs, calculateBulkCost, calculateMaxBuyable } from '$lib/systems/ProductionSystem';
	import { getEffectiveCycleDurationMs, getTierTrueIncomePerSec } from '$lib/engine/ProductionEngine';
	import { buyQuantity, type BuyQuantity } from '$lib/stores/buyQuantity';
	import { ngPlusCostMultiplier } from '$lib/stores/ngPlus';
	import SmoothProgressBar from './SmoothProgressBar.svelte';
	import Tooltip from './Tooltip.svelte';
	import { triggerParticle } from '$lib/stores/particleStore';
	import { getNextMilestone } from '$lib/systems/MilestoneSystem';
	import { createLongPressDetector } from '$lib/utils/gestures';

	// Rarity system based on tier count
	function getRarity(count: number): { name: string; color: string; glow: string; dots: number } {
		if (count >= 200) return { name: 'mythic', color: '#EF4444', glow: '0 0 14px rgba(239, 68, 68, 0.5)', dots: 4 };
		if (count >= 100) return { name: 'legendary', color: '#FFD700', glow: '0 0 12px rgba(255, 215, 0, 0.4)', dots: 3 };
		if (count >= 50) return { name: 'epic', color: '#A855F7', glow: '0 0 10px rgba(168, 85, 247, 0.3)', dots: 2 };
		if (count >= 25) return { name: 'rare', color: '#3B82F6', glow: '0 0 8px rgba(59, 130, 246, 0.25)', dots: 1 };
		if (count >= 10) return { name: 'uncommon', color: '#22C55E', glow: '0 0 6px rgba(34, 197, 94, 0.2)', dots: 0 };
		return { name: 'common', color: '#6B7280', glow: 'none', dots: 0 };
	}

	let {
		tier,
		tierData,
		tierIndex,
		divisionId,
		chiefLevel = 0,
		color,
		cash = 0,
		gameState,
		onBuy,
		onTap,
	}: {
		tier: TierState;
		tierData: TierData;
		tierIndex: number;
		divisionId: string;
		chiefLevel?: number;
		color: string;
		cash?: number;
		gameState?: GameState;
		onBuy?: () => void;
		onTap?: () => boolean;
	} = $props();

	// Buy quantity from global toggle
	let qty = $derived($buyQuantity);
	let ngMult = $derived($ngPlusCostMultiplier);

	// Effective quantity for display — for 'max', compute how many we can afford
	let effectiveQty = $derived.by(() => {
		if (qty === 'max') {
			return calculateMaxBuyable(tierData.config, tier.count, cash, ngMult);
		}
		return qty;
	});

	// Cost calculation based on quantity
	let cost = $derived.by(() => {
		if (effectiveQty <= 0) return calculateCost(tierData.config, tier.count, ngMult);
		if (effectiveQty === 1) return calculateCost(tierData.config, tier.count, ngMult);
		return calculateBulkCost(tierData.config, tier.count, effectiveQty, ngMult);
	});

	let revenue = $derived(calculateRevenue(tierData.config, tier.count, tier.level));
	
	// Use effective cycle duration (includes power efficiency, synergies, bottlenecks)
	let cycleDurationMs = $derived(
		gameState 
			? getEffectiveCycleDurationMs(gameState, divisionId, tierIndex)
			: getCycleDurationMs(tierData.config, chiefLevel)
	);
	let revenuePerSec = $derived(
		gameState && tier.count > 0
			? getTierTrueIncomePerSec(gameState, divisionId, tierIndex)
			: tier.count > 0 ? (revenue / cycleDurationMs) * 1000 : 0
	);
	let canAfford = $derived(cash >= cost && effectiveQty > 0);
	let rarity = $derived(getRarity(tier.count));

	// Milestone info
	let nextMilestone = $derived(gameState ? getNextMilestone(divisionId, tierIndex, gameState) : null);
	// milestone dots removed — just using inline count badge

	let costDisplay = $derived(formatCurrency(cost));
	let revenueDisplay = $derived(formatCurrency(revenuePerSec, 1));
	let revenuePerCycle = $derived(formatCurrency(revenue));

	// Buy button label
	let buyLabel = $derived.by(() => {
		if (tier.count === 0 && effectiveQty <= 1) return 'Build';
		if (qty === 'max') return effectiveQty > 0 ? `Upgrade ×${effectiveQty}` : 'Upgrade';
		if (qty === 1) return tier.count === 0 ? 'Build' : 'Upgrade';
		return `Upgrade ×${effectiveQty}`;
	});

	// Format cycle duration for display
	let cycleDurationDisplay = $derived(formatCycleDuration(cycleDurationMs));

	function formatCycleDuration(ms: number): string {
		if (ms < 1000) return `${Math.round(ms)}ms`;
		if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
		const mins = Math.floor(ms / 60000);
		const secs = Math.floor((ms % 60000) / 1000);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	// Time remaining display
	let timeRemainingMs = $derived(
		tier.producing ? Math.max(0, (1 - tier.progress) * cycleDurationMs) : 0
	);
	let timeDisplay = $derived(formatTimeRemaining(timeRemainingMs));

	function formatTimeRemaining(ms: number): string {
		if (ms <= 0) return '0.0s';
		if (ms < 1000) return `0.${Math.ceil(ms / 100)}s`;
		if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
		const mins = Math.floor(ms / 60000);
		const secs = Math.floor((ms % 60000) / 1000);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	// Long-press tooltip
	let showLongPressTooltip = $state(false);
	const longPress = createLongPressDetector(() => {
		if (tier.unlocked && tier.count > 0) {
			showLongPressTooltip = true;
		}
	}, 500);

	function dismissTooltip() {
		showLongPressTooltip = false;
	}

	// Tap feedback state
	let tapRipple = $state(false);
	let rippleX = $state(50);
	let rippleY = $state(50);

	// Purchase glow state
	let purchaseGlow = $state(false);

	// Payout popup state
	let payoutPopups = $state<{ id: number; amount: string; x: number; y: number }[]>([]);
	let popupCounter = $state(0);

	// Track previous producing state to detect completion
	let prevProducing = $state(false);
	let prevProgress = $state(0);
	let completionPulse = $state(false);
	let kachingFlash = $state(false);

	// PERF: Track timeouts for cleanup
	let pulseTimeout: ReturnType<typeof setTimeout> | undefined;
	let flashTimeout: ReturnType<typeof setTimeout> | undefined;

	// Listen for production completion — only show popups for MANUAL taps (no chief)
	// PERF: Only depend on tier.producing and tier.progress (not other derived values)
	$effect(() => {
		const producing = tier.producing;
		const progress = tier.progress;

		// Detect cycle completion — only one trigger per cycle (not both)
		const justCompleted = prevProducing && !producing && prevProgress > 0.5;
		const cycleCompleted = !justCompleted && producing && progress < prevProgress && prevProgress > 0.8;

		if (justCompleted || cycleCompleted) {
			if (chiefLevel === 0) {
				// Manual tap: full pulse + flash
				completionPulse = true;
				clearTimeout(pulseTimeout);
				pulseTimeout = setTimeout(() => { completionPulse = false; }, 600);

				kachingFlash = true;
				clearTimeout(flashTimeout);
				flashTimeout = setTimeout(() => { kachingFlash = false; }, 400);
			}
			// Chief automation: no pulse/flash — just progress bar reset is enough visual feedback

			// Only show payout popups when manually tapping (no chief automation)
			if (revenue > 0 && chiefLevel === 0) {
				const id = ++popupCounter;
				payoutPopups = [...payoutPopups, { id, amount: `+${formatCurrency(revenue)}`, x: 50, y: 30 }];
				setTimeout(() => {
					payoutPopups = payoutPopups.filter(p => p.id !== id);
				}, 1400);

				// Screen pulse for large payouts (>5% of current cash)
				if (revenue > cash * 0.05 && cash > 0) {
					triggerParticle('screenPulse');
				}
			}
		}

		prevProducing = producing;
		prevProgress = progress;
	});

	function handleTap(event: MouseEvent | TouchEvent) {
		// Don't trigger production when tapping tooltip info icon
		const target = event.target as HTMLElement;
		if (target.closest('.tooltip-wrapper')) return;

		if (!tier.unlocked || tier.count === 0 || !onTap) return;

		// If already producing, tap does nothing (AdCap style)
		if (tier.producing) return;

		const started = onTap();
		if (!started) return;

		// Get tap position relative to card for ripple origin
		const card = (event.currentTarget as HTMLElement);
		const rect = card.getBoundingClientRect();
		let clientX: number, clientY: number;
		if ('touches' in event && event.touches.length > 0) {
			clientX = event.touches[0].clientX;
			clientY = event.touches[0].clientY;
		} else {
			clientX = (event as MouseEvent).clientX;
			clientY = (event as MouseEvent).clientY;
		}
		rippleX = ((clientX - rect.left) / rect.width) * 100;
		rippleY = ((clientY - rect.top) / rect.height) * 100;

		// Trigger ripple
		tapRipple = true;
		setTimeout(() => { tapRipple = false; }, 500);
	}

	function handleBuy(event: MouseEvent) {
		event.stopPropagation();
		if (!canAfford) return;
		// Get position for spark effect
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
		const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
		triggerParticle('spark', x, y);

		// Purchase glow + bounce
		purchaseGlow = true;
		setTimeout(() => { purchaseGlow = false; }, 500);

		onBuy?.();
	}
</script>

<div
	class="tier-card relative rounded-xl border transition-all duration-200 overflow-hidden select-none
		{tier.unlocked
			? tier.count > 0
				? 'bg-bg-secondary/60 hover:border-white/10 cursor-pointer'
				: 'bg-bg-secondary/60 border-white/5'
			: 'bg-bg-secondary/20 border-white/[0.02] opacity-40'}
		{rarity.name === 'legendary' ? 'legendary-pulse' : ''}
		{completionPulse ? 'completion-pulse' : ''}
		{kachingFlash ? 'kaching-flash' : ''}
		{purchaseGlow ? 'purchase-glow' : ''}"
	style="{tier.unlocked && tier.count > 0
		? `border-color: ${rarity.color}30; box-shadow: ${rarity.glow};`
		: ''}"
	onclick={handleTap}
	onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(e as any); } }}
	ontouchstart={longPress.onTouchStart}
	ontouchmove={longPress.onTouchMove}
	ontouchend={longPress.onTouchEnd}
	role={tier.unlocked && tier.count > 0 ? 'button' : undefined}
	tabindex={tier.unlocked && tier.count > 0 ? 0 : undefined}
	aria-label="{tierData.name} - Tier {tierIndex + 1}{tier.count > 0 ? `, ${tier.count} owned` : ''}{tier.producing ? ', producing' : ''}"
	data-tutorial-id="tier-card-{tierIndex}"
>
	<!-- Tap ripple overlay (radial from touch point) -->
	{#if tapRipple}
		<div class="tap-ripple absolute inset-0 pointer-events-none z-10"
			style="--ripple-x: {rippleX}%; --ripple-y: {rippleY}%; --ripple-color: {color};"></div>
	{/if}

	<!-- Payout popups -->
	{#each payoutPopups as popup (popup.id)}
		<div
			class="payout-popup absolute pointer-events-none z-20 font-bold text-sm font-mono whitespace-nowrap"
			style="left: {popup.x}%; top: {popup.y}%; color: {color};"
		>
			{popup.amount}
		</div>
	{/each}

	<div class="p-3.5 flex items-start gap-3">
		<!-- Tier badge -->
		<div class="shrink-0 flex flex-col items-center gap-1">
			<div
				class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
				style="background-color: {tier.unlocked ? color + '15' : 'transparent'};
					   color: {tier.unlocked ? color : 'var(--color-text-muted)'};"
			>
				T{tierIndex + 1}
			</div>
			{#if tier.unlocked && tier.count > 0}
				<span
					class="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
					style="background-color: {color}15; color: {color};"
				>
					{#if nextMilestone}
						{nextMilestone.current}/{nextMilestone.threshold}
					{:else}
						×{tier.count}
					{/if}
				</span>
				<!-- Milestone dots -->
				<div class="flex items-center gap-[2px]">
					{#each [25, 50, 100, 200] as threshold, i}
						<div
							class="rounded-full"
							style="width: 4px; height: 4px; background-color: {tier.count >= threshold ? rarity.color : 'rgba(255,255,255,0.15)'};"
						></div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Info section -->
		<div class="flex-1 min-w-0">
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0">
					<h3 class="text-sm font-semibold text-text-primary truncate flex items-center gap-1.5">
						{tierData.name}
						{#if tierData.tooltip}
							<Tooltip text={tierData.tooltip} {color} />
						{/if}
					</h3>
					{#if !tier.unlocked}
						<p class="text-xs text-text-muted mt-0.5">
							🔒 Unlock previous tier
						</p>
					{/if}
				</div>
			</div>

			{#if tier.unlocked}
				<!-- Stats row (compact) -->
				<div class="flex items-center gap-3 mt-1.5" style="min-height: 18px;">
					{#if tier.count > 0}
						{#if chiefLevel > 0}
							<span class="text-sm font-bold tabular-nums" style="color: {color};">
								{revenueDisplay}/s
							</span>
							<span class="text-[10px] text-text-muted tabular-nums">
								{cycleDurationDisplay}/cycle
							</span>
						{:else}
							<span class="text-xs font-semibold tabular-nums" style="color: {color};">
								{revenuePerCycle}/cycle
							</span>
							<span class="text-[10px] text-text-muted tabular-nums">
								{cycleDurationDisplay}
							</span>
						{/if}

						{#if tierData.powerMW}
							{@const totalPower = tierData.powerMW * tier.count}
							<span class="text-xs font-semibold tabular-nums"
								class:text-solar-gold={totalPower > 0}
								class:text-rocket-red={totalPower < 0}
							>
								⚡{totalPower > 0 ? '+' : ''}{formatNumber(Math.abs(totalPower), 2)}
							</span>
						{/if}
					{/if}
				</div>

				<!-- Progress bar — always reserves space to prevent layout shift -->
				<div class="mt-1.5" style="min-height: 26px;">
					<div class="flex items-center justify-between mb-0.5" style="min-height: 14px;">
						{#if tier.count > 0 && tier.producing}
							<span class="text-[10px] text-text-muted uppercase tracking-wider font-medium">
								Producing...
							</span>
							<span
								class="text-[10px] font-mono tabular-nums font-semibold"
								style="color: {color};"
							>
								{timeDisplay}
							</span>
						{:else if tier.count > 0 && chiefLevel === 0}
							<span class="text-[10px] text-text-muted/40 uppercase tracking-wider font-medium">
								Tap to produce
							</span>
						{:else}
							<span class="text-[10px] text-transparent">—</span>
						{/if}
					</div>
					<div
						class="w-full rounded-full overflow-hidden"
						style="height: 6px; background-color: var(--color-bg-tertiary); opacity: {tier.count > 0 ? 1 : 0.3};"
						role="progressbar"
						aria-valuenow={Math.round(tier.progress * 100)}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label="Production progress"
					>
						<SmoothProgressBar
							producing={tier.producing}
							progress={tier.progress}
							{cycleDurationMs}
							{color}
						/>
					</div>
				</div>

				<!-- Buy button — wrapper div stops propagation even when button is disabled -->
				<div class="mt-1.5" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="presentation">
					<button
						onclick={handleBuy}
						data-tutorial-id="tier-buy-{tierIndex}"
						class="buy-button w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold
							   transition-all duration-150 active:scale-[0.97] touch-manipulation"
						style="background-color: {canAfford ? color + '15' : 'var(--color-bg-tertiary)'};
							   color: {canAfford ? color : 'var(--color-text-muted)'};
							   border: 1px solid {canAfford ? color + '25' : 'transparent'};"
						disabled={!canAfford}
						aria-label="{buyLabel} {tierData.name} for {costDisplay}"
					>
						<span>
							{buyLabel}
						</span>
						<span class="font-mono tabular-nums opacity-80">
							{costDisplay}
						</span>
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Long-press detailed tooltip -->
{#if showLongPressTooltip}
	<div class="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center px-4" onclick={dismissTooltip} onkeydown={(e) => { if (e.key === 'Escape') dismissTooltip(); }} role="dialog" aria-modal="true" aria-label="{tierData.name} details" tabindex="-1">
		<div class="bg-bg-secondary rounded-xl p-4 max-w-xs w-full border border-white/10 shadow-2xl space-y-2 text-left max-h-[85vh] overflow-y-auto" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
					style="background-color: {color}15; color: {color};">T{tierIndex + 1}</div>
				<div>
					<h3 class="text-sm font-bold text-text-primary">{tierData.name}</h3>
					<p class="text-[11px] text-text-muted">{tierData.description}</p>
				</div>
			</div>
			{#if tierData.flavor}
				<p class="text-[11px] italic text-text-muted/70 border-l-2 pl-2" style="border-color: {color}40;">
					{tierData.flavor}
				</p>
			{/if}
			<div class="grid grid-cols-2 gap-2 text-xs">
				<div><span class="text-text-muted">Count:</span> <span class="font-bold text-text-primary">{tier.count}</span></div>
				<div><span class="text-text-muted">Revenue/cycle:</span> <span class="font-bold" style="color: {color};">{revenuePerCycle}</span></div>
				<div><span class="text-text-muted">Income/s:</span> <span class="font-bold" style="color: {color};">{revenueDisplay}/s</span></div>
				<div><span class="text-text-muted">Cycle:</span> <span class="font-bold text-text-primary">{cycleDurationDisplay}</span></div>
				<div><span class="text-text-muted">Next cost:</span> <span class="font-bold text-text-primary">{costDisplay}</span></div>
				{#if tierData.powerMW}
					<div><span class="text-text-muted">Power:</span> <span class="font-bold" class:text-solar-gold={tierData.powerMW > 0} class:text-rocket-red={tierData.powerMW < 0}>{tierData.powerMW > 0 ? '+' : ''}{formatNumber(tierData.powerMW * tier.count, 2)} MW</span></div>
				{/if}
			</div>
			<button onclick={dismissTooltip} class="w-full text-center text-xs text-text-muted mt-2 py-1">Tap to close</button>
		</div>
	</div>
{/if}

<style>
	.buy-button {
		min-height: 44px;
	}

	.buy-button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.tap-ripple {
		background: radial-gradient(circle at var(--ripple-x) var(--ripple-y), var(--ripple-color) 0%, transparent 70%);
		animation: rippleExpand 0.5s ease-out forwards;
	}

	@keyframes rippleExpand {
		0% {
			opacity: 0.25;
			clip-path: circle(0% at var(--ripple-x) var(--ripple-y));
		}
		100% {
			opacity: 0;
			clip-path: circle(100% at var(--ripple-x) var(--ripple-y));
		}
	}

	.payout-popup {
		animation: payoutFloat 1.4s cubic-bezier(0.2, 0, 0, 1) forwards;
		transform: translate(-50%, -100%);
		text-shadow: 0 0 8px currentColor, 0 1px 3px rgba(0, 0, 0, 0.6);
		font-size: 16px;
	}

	@keyframes payoutFloat {
		0% {
			opacity: 0;
			transform: translate(-50%, -100%) translateY(5px) scale(0.5);
		}
		10% {
			opacity: 1;
			transform: translate(-50%, -100%) translateY(0) scale(1.3);
		}
		25% {
			transform: translate(-50%, -100%) translateY(-8px) scale(1);
		}
		65% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -100%) translateY(-55px) scale(0.85);
		}
	}

	.tier-card {
		-webkit-tap-highlight-color: transparent;
		/* NOTE: Removed will-change:transform + contain:layout — they created 36+
		   compositing layers which caused iOS Safari to intermittently drop touch
		   events on buy buttons. contain:style is safe (scopes counters only). */
		contain: style;
	}

	.legendary-pulse {
		animation: legendaryGlow 2s ease-in-out infinite;
	}

	.completion-pulse {
		animation: completionFlash 0.6s ease-out;
	}

	.completion-pulse {
		animation: completionFlash 0.6s ease-out;
	}

	@keyframes completionFlash {
		0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3); }
		15% { transform: scale(1.025); box-shadow: 0 0 25px 6px rgba(255, 255, 255, 0.18); }
		40% { transform: scale(0.995); }
		100% { transform: scale(1); box-shadow: none; }
	}

	.kaching-flash {
		animation: kachingGold 0.4s ease-out;
	}

	@keyframes kachingGold {
		0% { border-color: rgba(255, 215, 0, 0.9); box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), inset 0 0 15px rgba(255, 215, 0, 0.1); }
		100% { border-color: transparent; box-shadow: none; }
	}

	.purchase-glow {
		animation: purchaseBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes purchaseBounce {
		0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(68, 255, 136, 0.5); }
		25% { transform: scale(1.03); box-shadow: 0 0 20px 4px rgba(68, 255, 136, 0.3); }
		50% { transform: scale(0.985); }
		100% { transform: scale(1); box-shadow: none; }
	}

	@keyframes legendaryGlow {
		0%, 100% { box-shadow: 0 0 12px rgba(255, 215, 0, 0.3); }
		50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 0 4px rgba(255, 215, 0, 0.2); }
	}
</style>
