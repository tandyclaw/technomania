<script lang="ts">
	/**
	 * SmoothProgressBar — Progress bar that follows game state
	 * 
	 * Uses CSS transitions for smooth interpolation between game ticks.
	 * The game ticks at 100ms (10fps), but the CSS transition smooths it to 60fps.
	 */

	let {
		producing = false,
		progress = 0,
		cycleDurationMs = 1000,
		color = '#4488FF',
		label = '',
	}: {
		producing?: boolean;
		/** Game-state progress 0-1 */
		progress?: number;
		/** Total cycle duration in ms (used for transition timing) */
		cycleDurationMs?: number;
		/** Bar fill color */
		color?: string;
		/** Accessible label (only needed when not wrapped by a progressbar parent) */
		label?: string;
	} = $props();

	// Transition duration = time between ticks (100ms) for smooth interpolation
	// Cap it so very fast cycles don't have sluggish transitions
	let transitionMs = $derived(Math.min(100, cycleDurationMs / 10));
</script>

<div
	class="h-full rounded-full bar-fill"
	class:bar-near-complete={producing && progress > 0.9}
	style="
		width: {producing ? progress * 100 : 0}%;
		background-color: {color};
		transition: width {transitionMs}ms linear;
		contain: strict;
		--bar-color: {color};
	"
></div>

<style>
	.bar-fill {
		position: relative;
	}

	.bar-near-complete {
		box-shadow: 0 0 8px var(--bar-color), 0 0 2px var(--bar-color);
		filter: brightness(1.3);
	}
</style>
