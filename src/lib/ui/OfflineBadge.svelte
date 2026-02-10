<script lang="ts">
	import { onMount } from 'svelte';

	let offline = $state(false);

	onMount(() => {
		offline = !navigator.onLine;

		const goOffline = () => { offline = true; };
		const goOnline = () => { offline = false; };

		window.addEventListener('offline', goOffline);
		window.addEventListener('online', goOnline);

		return () => {
			window.removeEventListener('offline', goOffline);
			window.removeEventListener('online', goOnline);
		};
	});
</script>

{#if offline}
	<div class="fixed top-[calc(env(safe-area-inset-top,0px)+0.5rem)] right-3 z-[80]
				bg-yellow-600/90 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full
				flex items-center gap-1.5 shadow-lg backdrop-blur-sm animate-pulse">
		<span class="w-1.5 h-1.5 rounded-full bg-white/80"></span>
		Offline
	</div>
	<div class="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+4.5rem)] left-1/2 -translate-x-1/2 z-[80]
				bg-bg-secondary/95 text-text-secondary text-xs px-4 py-2 rounded-xl
				border border-yellow-600/30 shadow-lg backdrop-blur-sm max-w-[280px] text-center">
		📡 You're offline — no worries, all saves are stored locally on your device.
	</div>
{/if}
