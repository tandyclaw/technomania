<script lang="ts">
	import { onMount } from 'svelte';
	import { deleteAllBackups } from '$lib/engine/SaveManager';

	let show = $state(false);
	let clearing = $state(false);

	export function showWarning() {
		show = true;
	}

	onMount(() => {
		// Check storage quota if available
		if (navigator.storage?.estimate) {
			navigator.storage.estimate().then(({ usage, quota }) => {
				if (usage && quota && usage / quota > 0.9) {
					show = true;
				}
			}).catch(() => {});
		}

		// Listen for quota exceeded events from SaveManager
		const handler = () => { show = true; };
		window.addEventListener('storage-quota-exceeded', handler);
		return () => window.removeEventListener('storage-quota-exceeded', handler);
	});

	async function clearOldData() {
		clearing = true;
		try {
			await deleteAllBackups();
			// Clear any stale localStorage items
			const keysToRemove: string[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith('tech-tycoon-old-')) {
					keysToRemove.push(key);
				}
			}
			keysToRemove.forEach(k => localStorage.removeItem(k));
			show = false;
		} catch (err) {
			console.error('[StorageWarning] Failed to clear data:', err);
		} finally {
			clearing = false;
		}
	}

	function dismiss() {
		show = false;
	}
</script>

{#if show}
	<div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] px-4">
		<div class="bg-bg-secondary rounded-2xl p-5 max-w-sm w-full border border-yellow-600/30 text-center">
			<div class="text-4xl mb-3">💾</div>
			<h2 class="text-lg font-bold text-text-primary mb-2">Storage Almost Full</h2>
			<p class="text-text-secondary text-sm mb-4">
				Your device storage is running low. This could prevent saving your game.
				Clear old backup data to free up space.
			</p>
			<button
				onclick={clearOldData}
				disabled={clearing}
				class="w-full py-3 px-6 rounded-xl bg-solar-gold text-black font-semibold
					   transition-all duration-200 active:scale-95 touch-manipulation mb-2
					   disabled:opacity-50"
			>
				{clearing ? 'Clearing...' : 'Clear Old Backups'}
			</button>
			<button
				onclick={dismiss}
				class="w-full py-2 px-6 rounded-xl text-text-muted text-sm
					   transition-all duration-200 active:scale-95 touch-manipulation"
			>
				Dismiss
			</button>
		</div>
	</div>
{/if}
