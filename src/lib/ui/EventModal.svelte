<script lang="ts">
	import { pendingEvent, dismissEvent } from '$lib/stores/eventStore';

	let event = $derived($pendingEvent);

	function formatTime(ms: number): string {
		return `${Math.ceil(ms / 1000)}s`;
	}

	function handleChoice(action: () => void): void {
		action();
		dismissEvent();
	}
</script>

{#if event}
	<!-- Backdrop -->
	<div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center px-4 modal-mobile-fullscreen-container" role="dialog" aria-modal="true" aria-label={event.title}>
		<div
			class="bg-bg-secondary rounded-2xl p-5 max-w-sm w-full border border-white/10 shadow-2xl animate-in modal-mobile-fullscreen max-h-[85vh] overflow-y-auto"
		>
			<!-- Header -->
			<div class="text-center mb-4">
				<div class="text-4xl mb-2">{event.icon}</div>
				<h2 class="text-lg font-bold text-text-primary">{event.title}</h2>
				<p class="text-sm text-text-secondary mt-1">{event.description}</p>
			</div>

			<!-- Timer bar -->
			{#if event.timerMs > 0}
				<div class="mb-4">
					<div class="flex justify-between text-[10px] text-text-muted mb-1">
						<span>Auto-picks first option</span>
						<span class="tabular-nums font-mono">{formatTime(event.remainingMs)}</span>
					</div>
					<div class="h-1 rounded-full bg-bg-tertiary overflow-hidden" role="progressbar" aria-valuenow={Math.round((event.remainingMs / event.timerMs) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Event timer">
						<div
							class="h-full rounded-full bg-solar-gold transition-all duration-200 ease-linear"
							style="width: {Math.max(0, (event.remainingMs / event.timerMs) * 100)}%"
						></div>
					</div>
				</div>
			{/if}

			<!-- Choices -->
			{#if event.choices.length > 0}
				<div class="space-y-2">
					{#each event.choices as choice, i}
						<button
							onclick={() => handleChoice(choice.action)}
							class="w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
								   active:scale-[0.98] touch-manipulation
								   {i === 0
									? 'bg-electric-blue/10 border-electric-blue/30 hover:bg-electric-blue/20'
									: 'bg-bg-tertiary/50 border-white/5 hover:bg-bg-tertiary'}"
						>
							<span class="text-xl shrink-0" aria-hidden="true">{choice.icon}</span>
							<div class="text-left min-w-0">
								<div class="text-sm font-semibold text-text-primary">{choice.label}</div>
								<div class="text-[11px] text-text-secondary">{choice.description}</div>
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<!-- Unavoidable event — just dismiss -->
				<button
					onclick={dismissEvent}
					class="w-full py-3 px-6 rounded-xl bg-bg-tertiary text-text-primary font-semibold
						   transition-all duration-200 active:scale-95 touch-manipulation border border-white/5"
				>
					OK
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.animate-in {
		animation: modalIn 0.25s ease-out;
	}

	@keyframes modalIn {
		from {
			opacity: 0;
			transform: scale(0.9) translateY(10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>
