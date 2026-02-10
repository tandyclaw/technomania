<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { activeTab } from '$lib/stores/navigation';

	let showOverlay = $state(false);

	const tabMap: Record<string, string> = {
		'1': 'dashboard',
		'2': 'spacex',
		'3': 'tesla',
		'4': 'teslaenergy',
		'5': 'ai',
		'6': 'tunnels',
		'7': 'treasury',
		'8': 'research',
		'9': 'prestige',
	};

	function isModalOpen(): boolean {
		return !!document.querySelector('[role="dialog"]');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (isModalOpen() && !showOverlay) return;

		if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
			e.preventDefault();
			showOverlay = !showOverlay;
			return;
		}

		if (showOverlay) {
			if (e.key === 'Escape') showOverlay = false;
			return;
		}

		if (e.key === 'Escape') return;

		if (tabMap[e.key]) {
			e.preventDefault();
			activeTab.set(tabMap[e.key]);
			return;
		}

	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeydown);
	});
</script>

{#if showOverlay}
	<div
		class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] px-4"
		role="dialog"
		aria-modal="true"
		aria-label="Keyboard shortcuts"
	>
		<div class="bg-bg-secondary rounded-2xl p-6 max-w-sm w-full border border-white/10">
			<div class="text-center mb-4">
				<div class="text-3xl mb-2">⌨️</div>
				<h2 class="text-lg font-bold text-text-primary">Keyboard Shortcuts</h2>
			</div>
			<div class="space-y-2 text-sm">
				{#each [
					['1-9', 'Switch tabs'],
					['?', 'Toggle this overlay'],
					['Esc', 'Close overlay'],
				] as [key, desc]}
					<div class="flex items-center justify-between">
						<span class="text-text-secondary">{desc}</span>
						<kbd class="px-2 py-0.5 rounded bg-bg-tertiary text-text-primary text-xs font-mono border border-white/10">{key}</kbd>
					</div>
				{/each}
			</div>
			<button
				onclick={() => showOverlay = false}
				class="w-full mt-5 py-3 rounded-xl bg-bg-tertiary text-text-secondary font-semibold text-sm
					   transition-all active:scale-95 touch-manipulation"
			>
				Close
			</button>
		</div>
	</div>
{/if}
