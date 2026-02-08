<script lang="ts">
	import ResourceBar from '$lib/ui/ResourceBar.svelte';
	import DivisionTabBar from '$lib/ui/DivisionTabBar.svelte';
	import { activeTab } from '$lib/stores/navigation';

	let { children } = $props();
</script>

<svelte:head>
	<title>Technomania — Playing</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="game-shell min-h-screen bg-bg-primary flex flex-col">
	<!-- Fixed top resource bar -->
	<ResourceBar />

	<!-- Main scrollable content area -->
	<main
		class="flex-1 overflow-y-auto overscroll-y-contain"
		style="
			padding-top: calc(env(safe-area-inset-top, 0px) + 3.25rem);
			padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 3.75rem);
		"
	>
		<div class="max-w-2xl mx-auto px-3 py-4">
			{@render children()}
		</div>
	</main>

	<!-- Fixed bottom tab bar -->
	<DivisionTabBar />
</div>

<style>
	.game-shell {
		/* Prevent overscroll bounce on iOS */
		position: fixed;
		inset: 0;
		overflow: hidden;
	}

	main {
		-webkit-overflow-scrolling: touch;
	}
</style>
