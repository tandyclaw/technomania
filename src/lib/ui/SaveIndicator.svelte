<script lang="ts">
	import { saveStatus } from '$lib/stores/saveIndicator';

	let status = $derived($saveStatus);
	let visible = $derived(status !== 'idle');
</script>

{#if visible}
	<div
		class="save-indicator fixed z-50 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm"
		class:save-saving={status === 'saving'}
		class:save-saved={status === 'saved'}
		class:save-error={status === 'error'}
		role="status"
		aria-live="polite"
	>
		{#if status === 'saving'}
			<span class="save-spin" aria-hidden="true">💾</span>
			<span class="text-text-secondary">Saving...</span>
		{:else if status === 'saved'}
			<span aria-hidden="true">✅</span>
			<span class="text-bio-green">Saved</span>
		{:else if status === 'error'}
			<span aria-hidden="true">⚠️</span>
			<span class="text-rocket-red">Save failed</span>
		{/if}
	</div>
{/if}

<style>
	.save-indicator {
		top: calc(env(safe-area-inset-top, 0px) + 3.75rem);
		right: 0.75rem;
		animation: fadeIn 0.2s ease-out;
	}

	.save-saving {
		background-color: rgba(26, 35, 50, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.save-saved {
		background-color: rgba(68, 255, 136, 0.1);
		border: 1px solid rgba(68, 255, 136, 0.2);
	}

	.save-error {
		background-color: rgba(255, 68, 68, 0.1);
		border: 1px solid rgba(255, 68, 68, 0.2);
	}

	.save-spin {
		animation: spin 1s linear infinite;
		display: inline-block;
		font-size: 12px;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
