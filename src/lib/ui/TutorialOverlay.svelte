<script lang="ts">
	import { tutorialStore, TUTORIAL_STEPS, TOTAL_STEPS } from '$lib/stores/tutorialStore';
	import { tick } from 'svelte';

	let currentStep = $derived($tutorialStore.step);
	let isActive = $derived($tutorialStore.active);
	let stepData = $derived(currentStep < TOTAL_STEPS ? TUTORIAL_STEPS[currentStep] : null);

	// Tooltip positioning state
	let tooltipEl: HTMLDivElement | null = $state(null);
	let tooltipStyle = $state('');
	let highlightRect = $state({ top: 0, left: 0, width: 0, height: 0 });
	let showHighlight = $state(false);
	let animateIn = $state(false);
	let windowHeight = $state(typeof window !== 'undefined' ? window.innerHeight : 800);

	// Recalculate position when step changes
	$effect(() => {
		if (!isActive || !stepData) return;
		void currentStep;
		positionTooltip();
	});

	async function positionTooltip() {
		await tick();
		await new Promise((r) => setTimeout(r, 150));

		animateIn = false;
		await tick();

		if (!stepData) return;

		if (stepData.position === 'center' || !stepData.target) {
			showHighlight = false;
			tooltipStyle = '';
			animateIn = true;
			return;
		}

		const targetEl = document.querySelector(`[data-tutorial-id="${stepData.target}"]`);
		if (!targetEl) {
			showHighlight = false;
			tooltipStyle = '';
			animateIn = true;
			return;
		}

		const rect = targetEl.getBoundingClientRect();
		const padding = 6;

		showHighlight = true;
		highlightRect = {
			top: rect.top - padding,
			left: rect.left - padding,
			width: rect.width + padding * 2,
			height: rect.height + padding * 2,
		};

		if (stepData.position === 'above') {
			const topPos = rect.top - padding - 12;
			tooltipStyle = `
				bottom: ${window.innerHeight - topPos}px;
				left: 50%;
				transform: translateX(-50%);
			`;
		} else if (stepData.position === 'below') {
			const bottomPos = rect.bottom + padding + 12;
			tooltipStyle = `
				top: ${bottomPos}px;
				left: 50%;
				transform: translateX(-50%);
			`;
		}

		if (typeof window !== 'undefined') {
			windowHeight = window.innerHeight;
		}
		animateIn = true;
	}

	function handleNext() {
		if (!stepData) return;
		if (currentStep === TOTAL_STEPS - 1) {
			tutorialStore.complete();
		} else {
			tutorialStore.nextStep();
		}
	}

	function handleSkip() {
		tutorialStore.skip();
	}

	let isAutoAdvanceStep = $derived(stepData?.autoAdvance ?? false);
</script>

{#if isActive && stepData}
	{#if stepData.position === 'center'}
		<!-- CENTERED MODAL: full backdrop + centered tooltip -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="fixed inset-0 z-[80]" onclick={(e) => e.stopPropagation()}>
			<div class="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
			<div class="absolute inset-0 flex items-center justify-center z-[82] px-6">
				<div
					class="tutorial-tooltip max-w-sm w-full rounded-2xl border border-solar-gold/20 p-5 text-center pointer-events-auto
						   {animateIn ? 'animate-center' : 'opacity-0'}"
					style="background: linear-gradient(135deg, #1a2332 0%, #0f1729 100%);"
					bind:this={tooltipEl}
				>
					<!-- Step dots -->
					<div class="flex items-center justify-center gap-1.5 mb-3">
						{#each TUTORIAL_STEPS as _, i}
							<div
								class="w-1.5 h-1.5 rounded-full transition-all duration-300"
								class:bg-solar-gold={i <= currentStep}
								class:bg-bg-tertiary={i > currentStep}
								class:w-3={i === currentStep}
							></div>
						{/each}
					</div>

					<h3 class="text-lg font-bold text-solar-gold mb-2">{stepData.title}</h3>
					<p class="text-sm text-text-secondary leading-relaxed mb-5">{stepData.message}</p>

					<div class="flex items-center gap-3">
						<button
							onclick={handleSkip}
							class="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium text-text-muted
								   bg-bg-tertiary/50 hover:bg-bg-tertiary transition-colors touch-manipulation"
						>
							Skip
						</button>
						<button
							onclick={handleNext}
							class="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-bg-primary
								   bg-solar-gold hover:bg-solar-gold/90 transition-colors
								   active:scale-95 touch-manipulation"
						>
							{currentStep === TOTAL_STEPS - 1 ? 'Got It! 🚀' : 'Next'}
						</button>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<!-- TARGETED TOOLTIP: cutout highlight with click-through -->

		<!-- Highlight cutout acts as the backdrop via box-shadow -->
		{#if showHighlight}
			<div
				class="highlight-cutout fixed rounded-xl z-[80] pointer-events-none"
				style="
					top: {highlightRect.top}px;
					left: {highlightRect.left}px;
					width: {highlightRect.width}px;
					height: {highlightRect.height}px;
				"
			></div>
		{/if}

		<!-- Invisible blocker around the screen EXCEPT the highlight area -->
		<div class="fixed z-[80] left-0 right-0 top-0" style="height: {highlightRect.top}px;"></div>
		<div class="fixed z-[80] left-0 right-0 bottom-0"
			style="height: {Math.max(0, windowHeight - highlightRect.top - highlightRect.height)}px;"></div>
		<div class="fixed z-[80] left-0"
			style="top: {highlightRect.top}px; width: {highlightRect.left}px; height: {highlightRect.height}px;"></div>
		<div class="fixed z-[80]"
			style="top: {highlightRect.top}px; left: {highlightRect.left + highlightRect.width}px; right: 0; height: {highlightRect.height}px;"></div>

		<!-- Tooltip -->
		<div
			class="tutorial-tooltip fixed max-w-sm w-[calc(100%-2rem)] rounded-2xl border border-solar-gold/20 p-4 z-[82] pointer-events-auto
				   {animateIn ? 'animate-positioned' : 'opacity-0'}"
			style="background: linear-gradient(135deg, #1a2332 0%, #0f1729 100%); {tooltipStyle}"
			bind:this={tooltipEl}
		>
			<!-- Step dots -->
			<div class="flex items-center gap-1.5 mb-2">
				{#each TUTORIAL_STEPS as _, i}
					<div
						class="w-1.5 h-1.5 rounded-full transition-all duration-300"
						class:bg-solar-gold={i <= currentStep}
						class:bg-bg-tertiary={i > currentStep}
						class:w-3={i === currentStep}
					></div>
				{/each}
			</div>

			<h3 class="text-sm font-bold text-solar-gold mb-1">{stepData.title}</h3>
			<p class="text-xs text-text-secondary leading-relaxed mb-3">{stepData.message}</p>

			<div class="flex items-center gap-2">
				<button
					onclick={handleSkip}
					class="py-2 px-3 rounded-lg text-[10px] font-medium text-text-muted
						   bg-bg-tertiary/50 hover:bg-bg-tertiary transition-colors touch-manipulation"
				>
					Skip
				</button>

				{#if isAutoAdvanceStep && stepData.hint}
					<div class="flex-1 text-right">
						<span class="text-[10px] text-text-muted italic">{stepData.hint}</span>
					</div>
				{:else}
					<button
						onclick={handleNext}
						class="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-bg-primary
							   bg-solar-gold hover:bg-solar-gold/90 transition-colors
							   active:scale-95 touch-manipulation"
					>
						{currentStep === TOTAL_STEPS - 1 ? 'Got It! 🚀' : 'Next'}
					</button>
				{/if}
			</div>
		</div>
	{/if}
{/if}

<style>
	.highlight-cutout {
		box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
		border: 2px solid rgba(255, 204, 68, 0.4);
		animation: highlightPulse 2s ease-in-out infinite;
	}

	@keyframes highlightPulse {
		0%, 100% {
			border-color: rgba(255, 204, 68, 0.4);
			box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 12px rgba(255, 204, 68, 0.15);
		}
		50% {
			border-color: rgba(255, 204, 68, 0.7);
			box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 204, 68, 0.3);
		}
	}

	.tutorial-tooltip {
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 16px rgba(255, 204, 68, 0.08);
	}

	.animate-positioned {
		animation: tooltipIn 0.3s ease-out forwards;
	}

	@keyframes tooltipIn {
		from { opacity: 0; transform: translateX(-50%) translateY(8px); }
		to { opacity: 1; transform: translateX(-50%) translateY(0); }
	}

	.animate-center {
		animation: tooltipCenterIn 0.35s ease-out forwards;
	}

	@keyframes tooltipCenterIn {
		from { opacity: 0; transform: scale(0.92) translateY(10px); }
		to { opacity: 1; transform: scale(1) translateY(0); }
	}
</style>
