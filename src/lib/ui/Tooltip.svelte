<script lang="ts">
	/**
	 * Tooltip.svelte — Info icon with hover/tap tooltip overlay
	 * Shows real-world engineering explanations for tier names and bottlenecks.
	 * Desktop: hover to show. Mobile: tap to toggle.
	 */

	let {
		text,
		color = '#8899aa',
	}: {
		text: string;
		color?: string;
	} = $props();

	let visible = $state(false);
	let tooltipEl: HTMLDivElement | undefined = $state();
	let iconEl: HTMLButtonElement | undefined = $state();

	// Position state for smart placement
	let positionAbove = $state(true);
	let positionLeft = $state(false);

	function show() {
		visible = true;
		// Defer position calculation to next frame
		requestAnimationFrame(adjustPosition);
	}

	function hide() {
		visible = false;
	}

	let lastTouchToggle = 0;

	function toggle(e: MouseEvent | TouchEvent) {
		e.stopPropagation();
		e.preventDefault();
		// Ignore synthetic click events from touch (within 300ms of touch toggle)
		if (e.type === 'click' && Date.now() - lastTouchToggle < 400) return;
		if ('touches' in e) lastTouchToggle = Date.now();
		if (visible) {
			hide();
		} else {
			show();
		}
	}

	function adjustPosition() {
		if (!tooltipEl || !iconEl) return;
		const iconRect = iconEl.getBoundingClientRect();
		const viewportH = window.innerHeight;
		const viewportW = window.innerWidth;

		// If icon is in the top 40% of viewport, show below; otherwise above
		positionAbove = iconRect.top > viewportH * 0.4;

		// If icon is in the right 30% of viewport, align tooltip to the right
		positionLeft = iconRect.left > viewportW * 0.7;
	}

	// Close on outside click
	function handleDocumentClick(e: MouseEvent) {
		if (visible && iconEl && !iconEl.contains(e.target as Node) && tooltipEl && !tooltipEl.contains(e.target as Node)) {
			hide();
		}
	}

	// Use effect to attach/detach document listener
	$effect(() => {
		if (visible) {
			document.addEventListener('click', handleDocumentClick, true);
			return () => document.removeEventListener('click', handleDocumentClick, true);
		}
	});
</script>

<span class="tooltip-wrapper relative inline-flex">
	<!-- Info icon button -->
	<button
		bind:this={iconEl}
		class="tooltip-trigger inline-flex items-center justify-center w-4 h-4 rounded-full
			   text-[9px] font-bold transition-all duration-150 cursor-help select-none
			   hover:scale-110 active:scale-95 touch-manipulation"
		style="background-color: {color}18; color: {color}90; border: 1px solid {color}25;"
		onclick={toggle}
		ontouchstart={(e: TouchEvent) => e.stopPropagation()}
		ontouchend={(e: TouchEvent) => { e.stopPropagation(); toggle(e); }}
		onmouseenter={show}
		onmouseleave={hide}
		aria-label="More info"
		type="button"
	>
		ℹ
	</button>

	<!-- Tooltip popup -->
	{#if visible}
		<div
			bind:this={tooltipEl}
			class="tooltip-popup absolute z-50 w-64 px-3 py-2.5 rounded-xl text-xs leading-relaxed
				   text-text-primary shadow-xl border border-white/10"
			style="background-color: var(--color-bg-secondary);
				   {positionAbove ? 'bottom: calc(100% + 8px);' : 'top: calc(100% + 8px);'}
				   {positionLeft ? 'right: -4px;' : 'left: -4px;'}"
			role="tooltip"
		>
			<!-- Arrow -->
			<div
				class="absolute w-2 h-2 rotate-45 border-white/10"
				style="background-color: var(--color-bg-secondary);
					   {positionAbove
						? 'bottom: -5px; border-right: 1px solid; border-bottom: 1px solid;'
						: 'top: -5px; border-left: 1px solid; border-top: 1px solid;'}
					   {positionLeft ? 'right: 12px;' : 'left: 12px;'}"
			></div>
			{text}
		</div>
	{/if}
</span>

<style>
	.tooltip-popup {
		animation: tooltipFadeIn 0.15s ease-out;
	}

	@keyframes tooltipFadeIn {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.tooltip-wrapper {
		vertical-align: middle;
	}
</style>
