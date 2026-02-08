<script lang="ts">
	/**
	 * ProductionProgressBar — Animated progress bar for production cycles
	 * Shows fill progress, time remaining, and resets on completion.
	 * Uses CSS transitions for smooth 60fps animation between game loop ticks.
	 */

	let {
		progress = 0,
		durationMs = 1000,
		producing = false,
		color = '#4488FF',
		height = 'sm',
		showTimeRemaining = true,
	}: {
		/** Current progress 0-1 */
		progress?: number;
		/** Total production cycle duration in ms */
		durationMs?: number;
		/** Whether currently producing */
		producing?: boolean;
		/** Accent color for the bar fill */
		color?: string;
		/** Bar height: 'xs' (2px), 'sm' (4px), 'md' (8px), 'lg' (12px) */
		height?: 'xs' | 'sm' | 'md' | 'lg';
		/** Whether to show time remaining label */
		showTimeRemaining?: boolean;
	} = $props();

	const heightMap = { xs: 2, sm: 4, md: 8, lg: 12 };
	let barHeight = $derived(heightMap[height] ?? 4);

	// Clamp progress to 0-1
	let clampedProgress = $derived(Math.max(0, Math.min(1, progress)));
	let percentWidth = $derived(clampedProgress * 100);

	// Calculate time remaining
	let timeRemainingMs = $derived(
		producing ? Math.max(0, (1 - clampedProgress) * durationMs) : 0
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

	// When progress resets to near-zero from near-one, skip transition for instant reset
	let prevProgress = $state(0);
	let skipTransition = $state(false);

	$effect(() => {
		if (clampedProgress < 0.05 && prevProgress > 0.9) {
			// Progress reset — skip transition so bar doesn't animate backwards
			skipTransition = true;
			requestAnimationFrame(() => {
				skipTransition = false;
			});
		}
		prevProgress = clampedProgress;
	});
</script>

<div class="production-progress-bar">
	{#if showTimeRemaining && producing}
		<div class="flex items-center justify-between mb-1">
			<span class="text-[10px] text-text-muted uppercase tracking-wider font-medium">
				Producing...
			</span>
			<span
				class="text-[10px] font-mono tabular-nums font-semibold"
				style="color: {color};"
			>
				{timeDisplay}
			</span>
		</div>
	{:else if showTimeRemaining && !producing && clampedProgress === 0}
		<div class="flex items-center justify-between mb-1">
			<span class="text-[10px] text-text-muted uppercase tracking-wider font-medium">
				Ready
			</span>
			<span class="text-[10px] text-text-muted font-mono tabular-nums">
				Tap to start
			</span>
		</div>
	{/if}

	<!-- Track -->
	<div
		class="w-full rounded-full overflow-hidden"
		style="height: {barHeight}px; background-color: var(--color-bg-tertiary);"
		role="progressbar"
		aria-valuenow={Math.round(clampedProgress * 100)}
		aria-valuemin={0}
		aria-valuemax={100}
		aria-label="Production progress"
	>
		<!-- Fill -->
		<div
			class="h-full rounded-full relative"
			class:transition-width={!skipTransition}
			style="
				width: {percentWidth}%;
				background: linear-gradient(90deg, {color}cc, {color});
			"
		>
			<!-- Shimmer effect when producing -->
			{#if producing && clampedProgress > 0.01}
				<div class="shimmer-overlay absolute inset-0 rounded-full overflow-hidden"></div>
			{/if}
		</div>
	</div>
</div>

<style>
	.transition-width {
		transition: width 120ms linear;
	}

	.shimmer-overlay::after {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.15) 50%,
			transparent 100%
		);
		animation: shimmer 1.5s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% { left: -100%; }
		100% { left: 200%; }
	}
</style>
