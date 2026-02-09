<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let { incomePerSec = 0 }: { incomePerSec: number } = $props();

	let dataPoints = $state<number[]>(new Array(60).fill(0));
	let intervalId: ReturnType<typeof setInterval> | null = null;
	// PERF: Ring buffer index to avoid allocating a new array every second
	let ringIndex = $state(0);

	onMount(() => {
		intervalId = setInterval(() => {
			// Shift left by 1 and append new value (mutate in place, reassign for reactivity)
			const arr = dataPoints;
			for (let i = 0; i < arr.length - 1; i++) arr[i] = arr[i + 1];
			arr[arr.length - 1] = incomePerSec;
			dataPoints = arr;
		}, 1000);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});

	let maxVal = $derived(Math.max(...dataPoints, 1));

	let polylinePoints = $derived(
		dataPoints.map((v, i) => {
			const x = (i / 59) * 200;
			const y = 40 - (v / maxVal) * 36;
			return `${x},${y}`;
		}).join(' ')
	);

	let areaPoints = $derived(
		`0,40 ${polylinePoints} 200,40`
	);
</script>

<svg viewBox="0 0 200 40" preserveAspectRatio="none" class="w-full h-10 mt-2">
	<defs>
		<linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color="var(--color-electric-blue)" stop-opacity="0.3" />
			<stop offset="100%" stop-color="var(--color-electric-blue)" stop-opacity="0.02" />
		</linearGradient>
	</defs>
	<polygon points={areaPoints} fill="url(#sparkline-fill)" />
	<polyline
		points={polylinePoints}
		fill="none"
		stroke="var(--color-electric-blue)"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
		vector-effect="non-scaling-stroke"
	/>
</svg>
