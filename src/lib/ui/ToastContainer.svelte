<script lang="ts">
	import { toasts, dismissToast, type Toast } from '$lib/stores/toastStore';

	// Map toast type to background style
	function getTypeStyles(toast: Toast): string {
		const color = toast.color ?? '#4488FF';
		return `background-color: ${color}18; border-color: ${color}35;`;
	}

	function getTitleColor(toast: Toast): string {
		return toast.color ?? '#4488FF';
	}
</script>

<!-- Toast container — fixed position, above everything except modals -->
<div class="toast-container fixed top-14 left-0 right-0 z-[80] flex flex-col items-center gap-1.5 px-3 pointer-events-none" aria-live="polite" aria-atomic="false">
	{#each $toasts as toast (toast.id)}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="toast-item pointer-events-auto max-w-sm w-full rounded-xl border px-3.5 py-2.5
				   backdrop-blur-md shadow-lg shadow-black/20 cursor-pointer select-none"
			style={getTypeStyles(toast)}
			onclick={() => dismissToast(toast.id)}
			role="alert"
		>
			<div class="flex items-start gap-2.5">
				<!-- Icon -->
				<span class="text-lg shrink-0 mt-0.5 leading-none">{toast.icon}</span>

				<!-- Content -->
				<div class="flex-1 min-w-0">
					<h4
						class="text-xs font-bold truncate"
						style="color: {getTitleColor(toast)};"
					>
						{toast.title}
					</h4>
					<p class="text-[11px] text-text-secondary mt-0.5 line-clamp-2 leading-snug">
						{toast.message}
					</p>
				</div>

				<!-- Dismiss X -->
				<button
					class="shrink-0 w-5 h-5 flex items-center justify-center text-text-muted hover:text-text-secondary
						   transition-colors rounded-full text-xs leading-none"
					onclick={(e) => { e.stopPropagation(); dismissToast(toast.id); }}
					aria-label="Dismiss"
				>
					✕
				</button>
			</div>
		</div>
	{/each}
</div>

<style>
	.toast-item {
		animation: toastSlideIn 0.25s ease-out forwards;
	}

	@keyframes toastSlideIn {
		from {
			opacity: 0;
			transform: translateY(-12px) scale(0.96);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
