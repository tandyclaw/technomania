<script>
	import '../app.css';
	import { onMount } from 'svelte';
	let { children } = $props();

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').catch((err) => {
				console.warn('[SW] Registration failed:', err);
			});
		}
	});
</script>

{@render children()}
