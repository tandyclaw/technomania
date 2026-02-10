<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
	let hasError = $state(false);
	let errorMessage = $state('');

	onMount(() => {
		const handler = (event: ErrorEvent) => {
			console.error('[ErrorBoundary] Uncaught error:', event.error);
			hasError = true;
			errorMessage = event.message || 'An unexpected error occurred';
		};

		const rejectionHandler = (event: PromiseRejectionEvent) => {
			console.error('[ErrorBoundary] Unhandled rejection:', event.reason);
			hasError = true;
			errorMessage = String(event.reason) || 'An unexpected error occurred';
		};

		window.addEventListener('error', handler);
		window.addEventListener('unhandledrejection', rejectionHandler);

		return () => {
			window.removeEventListener('error', handler);
			window.removeEventListener('unhandledrejection', rejectionHandler);
		};
	});

	function retry() {
		hasError = false;
		errorMessage = '';
	}

	function hardReset() {
		if (confirm('This will reload the page. Your last auto-save will be preserved.')) {
			window.location.reload();
		}
	}
</script>

{#if hasError}
	<div class="fixed inset-0 bg-bg-primary flex items-center justify-center z-[200] px-4">
		<div class="text-center max-w-sm w-full">
			<div class="text-5xl mb-4">⚠️</div>
			<h2 class="text-xl font-bold text-text-primary mb-2">Something Went Wrong</h2>
			<p class="text-text-secondary text-sm mb-1">
				A component crashed, but your save data is safe.
			</p>
			<p class="text-text-muted text-xs mb-6 font-mono break-all">
				{errorMessage}
			</p>
			<button
				onclick={retry}
				class="w-full py-3 px-6 rounded-xl bg-electric-blue text-white font-semibold
					   transition-all duration-200 active:scale-95 touch-manipulation mb-2"
			>
				Try Again
			</button>
			<button
				onclick={hardReset}
				class="w-full py-2.5 px-6 rounded-xl bg-bg-secondary text-text-secondary text-sm
					   border border-white/10 transition-all duration-200 active:scale-95 touch-manipulation"
			>
				Reload Page
			</button>
		</div>
	</div>
{:else}
	{@render children()}
{/if}
