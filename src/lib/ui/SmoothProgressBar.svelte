<script lang="ts">
	/**
	 * SmoothProgressBar — 60fps smooth progress bar using CSS animations
	 * 
	 * Instead of updating width every game tick (10fps = jumpy),
	 * this uses a CSS animation that runs at native 60fps.
	 * 
	 * When producing: animates from current progress to 100% over remaining time.
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
	let startPercent = $derived(producing ? Math.max(0, Math.min(progress * 100, 99)) : 0);
	let remainingMs = $derived(producing ? Math.max(16, (1 - progress) * cycleDurationMs) : 0);
</script>

{#if producing}
	<!-- Use key block to force re-render on cycle restart -->
	{#key animKey}
		<div class="h-full smooth-bar" style="
			--start: {startPercent}%;
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
		to { width: 100%; }
	}
</style>
