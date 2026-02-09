<script lang="ts">
	/**
	 * SmoothProgressBar — 60fps smooth progress bar using CSS animations
	 * 
	 * Instead of updating width every game tick (10fps = jumpy),
	 * this uses a CSS animation that runs at native 60fps.
	 * 
	 * When producing: animates from current progress to ~95% over remaining time.
	 * The last 5% is left as buffer so animation doesn't hit 100% before game tick.
	 * When cycle resets: instantly resets to 0 and starts a new animation.
	 * When idle: stays at 0%.
	 */

	let {
		producing = false,
		progress = 0,
		cycleDurationMs = 1000,
		color = '#4488FF',
	}: {
		producing?: boolean;
		/** Game-state progress 0-1 (used for initial sync) */
		progress?: number;
		/** Total cycle duration in ms */
		cycleDurationMs?: number;
		/** Bar fill color */
		color?: string;
	} = $props();

	// Track the animation by generating a new key whenever cycle restarts
	let animKey = $state(0);
	let prevProducing = $state(false);
	let prevProgress = $state(0);

	// Detect cycle restart: progress drops significantly while still producing
	$effect(() => {
		const isReset = producing && prevProducing && progress < 0.05 && prevProgress > 0.8;
		const justStarted = producing && !prevProducing;

		if (isReset || justStarted) {
			animKey++;
		}

		prevProducing = producing;
		prevProgress = progress;
	});

	// Calculate where the animation should start from and how long remains
	// Cap at 95% so animation doesn't overshoot before game tick processes completion
	let startPercent = $derived(producing ? Math.max(0, Math.min(progress * 100, 95)) : 0);
	
	// Target 97% instead of 100% — leaves visual buffer for tick timing
	const TARGET_PERCENT = 97;
	
	// Remaining time to reach target (not 100%)
	let remainingMs = $derived.by(() => {
		if (!producing) return 0;
		const targetProgress = TARGET_PERCENT / 100;
		const remaining = Math.max(0, targetProgress - progress);
		return Math.max(16, remaining * cycleDurationMs);
	});
</script>

{#if producing}
	<!-- Use key block to force re-render on cycle restart -->
	{#key animKey}
		<div class="h-full smooth-bar" style="
			--start: {startPercent}%;
			--end: {TARGET_PERCENT}%;
			--duration: {remainingMs}ms;
			--color: {color};
		"></div>
	{/key}
{/if}

<style>
	.smooth-bar {
		width: var(--start);
		background-color: var(--color);
		border-radius: 9999px;
		animation: fillBar var(--duration) linear forwards;
		will-change: width;
	}

	@keyframes fillBar {
		from { width: var(--start); }
		to { width: var(--end); }
	}
</style>
