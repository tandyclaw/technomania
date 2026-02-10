<script lang="ts">
	/**
	 * AnimatedNumber.svelte — Smooth counting animation for number displays
	 *
	 * When the target value changes, the displayed number smoothly counts
	 * up (or down) to the new value over a short duration. Uses
	 * requestAnimationFrame for 60fps smoothness.
	 *
	 * Props:
	 * - value: the target number
	 * - formatter: function to format the number for display (e.g., formatCurrency)
	 * - duration: animation duration in ms (default 400)
	 */
	import { onMount, onDestroy } from 'svelte';

	let {
		value,
		formatter = (n: number) => String(n),
		duration = 400,
	}: {
		value: number;
		formatter?: (n: number) => string;
		duration?: number;
	} = $props();

	let displayValue = $state(0);
	let displayText = $derived(formatter(displayValue));
	let animating = $state(false);

	// Animation state
	let animationFrame: number | null = null;
	let startValue = 0;
	let endValue = 0;
	let startTime = 0;
	let mounted = false;

	onMount(() => {
		// Initialize to current value immediately (no animation on first render)
		displayValue = value;
		mounted = true;
	});

	onDestroy(() => {
		if (animationFrame !== null) {
			cancelAnimationFrame(animationFrame);
			animationFrame = null;
		}
	});

	// Watch for value changes and animate
	// PERF: If value changes faster than animation duration (e.g. cash every 100ms),
	// retarget the running animation instead of restarting from scratch.
	$effect(() => {
		const target = value;

		if (!mounted) return;

		// Skip if the value hasn't meaningfully changed
		if (Math.abs(target - displayValue) < 0.001) {
			displayValue = target;
			return;
		}

		// If already animating, just retarget — don't restart from current displayValue
		// This prevents rAF pile-up when value changes every 100ms
		if (animating && animationFrame !== null) {
			endValue = target;
			return;
		}

		// Start new animation
		startValue = displayValue;
		endValue = target;
		startTime = performance.now();
		animating = true;

		if (animationFrame !== null) {
			cancelAnimationFrame(animationFrame);
		}

		function tick(now: number) {
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Ease-out cubic for natural deceleration
			const eased = 1 - Math.pow(1 - progress, 3);

			displayValue = startValue + (endValue - startValue) * eased;

			if (progress < 1) {
				animationFrame = requestAnimationFrame(tick);
			} else {
				displayValue = endValue;
				animating = false;
				animationFrame = null;
			}
		}

		animationFrame = requestAnimationFrame(tick);
	});
</script>

<span class="animated-number" class:counting={animating}>{displayText}</span>

<style>
	.animated-number {
		display: inline;
		transition: color 0.15s ease, filter 0.15s ease;
	}

	.animated-number.counting {
		/* Brightness pulse + subtle scale while counting */
		filter: brightness(1.2);
		animation: countPulse 0.35s ease-out;
	}

	@keyframes countPulse {
		0% { transform: scale(1); }
		30% { transform: scale(1.06); }
		100% { transform: scale(1); }
	}
</style>
