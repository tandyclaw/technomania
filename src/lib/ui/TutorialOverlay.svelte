<script lang="ts">
	import { tutorialStore, TUTORIAL_STEPS, TOTAL_STEPS } from '$lib/stores/tutorialStore';
	import { activeTab } from '$lib/stores/navigation';
	import { onMount, tick } from 'svelte';

	let currentStep = $derived($tutorialStore.step);
	let isActive = $derived($tutorialStore.active);
	let stepData = $derived(currentStep < TOTAL_STEPS ? TUTORIAL_STEPS[currentStep] : null);

	// Tooltip positioning state
	let tooltipEl: HTMLDivElement | null = $state(null);
	let tooltipStyle = $state('');
	let highlightStyle = $state('');
	let showHighlight = $state(false);
	let animateIn = $state(false);

	// Recalculate position when step changes
	$effect(() => {
		if (!isActive || !stepData) return;
		// Trigger re-position
		void currentStep;
		positionTooltip();
	});

	async function positionTooltip() {
		// Wait for DOM to settle
		await tick();
		await new Promise((r) => setTimeout(r, 100));

		animateIn = false;
		await tick();

		if (!stepData) return;

		if (stepData.position === 'center' || !stepData.target) {
			// Centered modal — no highlight
			showHighlight = false;
			tooltipStyle = '';
			animateIn = true;
			return;
		}

		// Find the target element by data-tutorial-id
		const targetEl = document.querySelector(`[data-tutorial-id="${stepData.target}"]`);
		if (!targetEl) {
			// Target not in DOM yet — show centered fallback
			showHighlight = false;
			tooltipStyle = '';
			animateIn = true;
			return;
		}

		const rect = targetEl.getBoundingClientRect();
		const padding = 6;

		// Highlight cutout
		showHighlight = true;
		highlightStyle = `
			top: ${rect.top - padding}px;
			left: ${rect.left - padding}px;
			width: ${rect.width + padding * 2}px;
			height: ${rect.height + padding * 2}px;
		`;

		// Tooltip positioning
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

		animateIn = true;
	}

	function handleNext() {
		if (!stepData) return;

		// Step 0 (welcome) → advance
		// Step 1 (go-to-energy) → navigate and advance
		if (currentStep === 1) {
			activeTab.set('teslaenergy');
			tutorialStore.nextStep();
			return;
		}

		// Steps 2-5 auto-advance via EventBus listeners
		// Steps 6, 7 advance on dismiss/next
		if (currentStep === 0 || currentStep === 6 || currentStep === 7) {
			if (currentStep === 7) {
				tutorialStore.complete();
			} else {
				tutorialStore.nextStep();
			}
			return;
		}

		// For auto-advancing steps (2-5), the "Next" acts as dismiss/skip-to-next
		tutorialStore.nextStep();
	}

	function handleSkip() {
		tutorialStore.skip();
	}

	// Button label depends on step
	let buttonLabel = $derived.by(() => {
		if (currentStep === 0) return "Let's Go";
		if (currentStep === 1) return 'Go to Energy ☀️';
		if (currentStep === 7) return 'Start Building! 🚀';
		return 'Next';
	});

	// Some steps auto-advance, so show a "waiting" indicator
	let isAutoAdvanceStep = $derived(currentStep >= 2 && currentStep <= 5);
</script>

{#if isActive && stepData}
	<!-- Backdrop overlay -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="tutorial-overlay fixed inset-0 z-[80] pointer-events-none" onclick={(e) => e.stopPropagation()}>
		<!-- Semi-transparent backdrop — blocks clicks except on highlighted area -->
		<div class="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"></div>

		<!-- Highlight cutout -->
		{#if showHighlight}
			<div
				class="highlight-cutout absolute rounded-xl pointer-events-none z-[81]"
				style={highlightStyle}
			></div>
		{/if}

		<!-- Tooltip -->
		{#if stepData.position === 'center'}
			<!-- Centered modal -->
			<div class="absolute inset-0 flex items-center justify-center z-[82] px-6">
				<div
					class="tutorial-tooltip max-w-sm w-full rounded-2xl border border-solar-gold/20 p-5 text-center
						   {animateIn ? 'animate-in' : 'opacity-0'}"
					style="background: linear-gradient(135deg, #1a2332 0%, #0f1729 100%);"
					bind:this={tooltipEl}
				>
					<!-- Step indicator -->
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

					{#if currentStep === 0}
						<div class="text-4xl mb-3">⚡</div>
					{:else}
						<div class="text-3xl mb-3">🏁</div>
					{/if}

					<h3 class="text-lg font-bold text-solar-gold mb-2">{stepData.title}</h3>
					<p class="text-sm text-text-secondary leading-relaxed mb-5">{stepData.message}</p>

					<div class="flex items-center gap-3">
						<button
							onclick={handleSkip}
							class="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium text-text-muted
								   bg-bg-tertiary/50 hover:bg-bg-tertiary transition-colors touch-manipulation"
						>
							Skip Tutorial
						</button>
						<button
							onclick={handleNext}
							class="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-bg-primary
								   bg-solar-gold hover:bg-solar-gold/90 transition-colors
								   active:scale-95 touch-manipulation"
						>
							{buttonLabel}
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Positioned tooltip -->
			<div
				class="tutorial-tooltip fixed max-w-sm w-[calc(100%-2rem)] rounded-2xl border border-solar-gold/20 p-4 z-[82]
					   {animateIn ? 'animate-in' : 'opacity-0'}"
				style="background: linear-gradient(135deg, #1a2332 0%, #0f1729 100%); {tooltipStyle}"
				bind:this={tooltipEl}
			>
				<!-- Step indicator -->
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

					{#if isAutoAdvanceStep}
						<div class="flex-1 text-right">
							<span class="text-[10px] text-text-muted italic">
								{#if currentStep === 2}
									👆 Tap Build below
								{:else if currentStep === 3}
									👆 Tap the card below
								{:else if currentStep === 4}
									⏳ Waiting for payout...
								{:else if currentStep === 5}
									👆 Buy another panel
								{/if}
							</span>
						</div>
					{:else}
						<button
							onclick={handleNext}
							class="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-bg-primary
								   bg-solar-gold hover:bg-solar-gold/90 transition-colors
								   active:scale-95 touch-manipulation"
						>
							{buttonLabel}
						</button>
					{/if}
				</div>
			</div>

			<!-- Clickthrough zone: let clicks pass through to highlighted element -->
			{#if showHighlight}
				<div
					class="absolute z-[83] rounded-xl"
					style={highlightStyle}
				></div>
			{/if}
		{/if}
	</div>
{/if}

<style>
	.highlight-cutout {
		box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
		border: 2px solid rgba(255, 204, 68, 0.4);
		animation: highlightPulse 2s ease-in-out infinite;
	}

	@keyframes highlightPulse {
		0%,
		100% {
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

	.animate-in {
		animation: tooltipIn 0.3s ease-out forwards;
	}

	@keyframes tooltipIn {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	/* Centered tooltip needs different animation */
	.absolute.inset-0 .animate-in {
		animation: tooltipCenterIn 0.35s ease-out forwards;
	}

	@keyframes tooltipCenterIn {
		from {
			opacity: 0;
			transform: scale(0.92) translateY(10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>
