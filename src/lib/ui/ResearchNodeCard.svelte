<script lang="ts">
	import type { ResearchNode, NodeStatus } from '$lib/systems/ResearchSystem';
	import { CATEGORY_META } from '$lib/data/techTree';
	import { gameState } from '$lib/stores/gameState';

	let {
		node,
		status,
		isSelected,
		onSelect,
	}: {
		node: ResearchNode;
		status: NodeStatus;
		isSelected: boolean;
		onSelect: () => void;
	} = $props();

	let activeResearch = $derived($gameState.activeResearch);
	let catMeta = $derived(CATEGORY_META[node.category]);

	let borderColor = $derived(
		status === 'completed'
			? 'border-bio-green/20'
			: status === 'researching'
				? 'border-neural-purple/40'
				: status === 'available'
					? isSelected
						? 'border-neural-purple/30'
						: 'border-white/10'
					: 'border-white/5'
	);

	let bgColor = $derived(
		status === 'completed'
			? 'bg-bio-green/5'
			: status === 'researching'
				? 'bg-neural-purple/10'
				: status === 'available'
					? 'bg-bg-secondary/50'
					: 'bg-bg-secondary/20'
	);
</script>

<button
	onclick={onSelect}
	class="w-full text-left rounded-xl border p-3 transition-all duration-200
		   active:scale-[0.98] touch-manipulation
		   {borderColor} {bgColor}
		   {status === 'locked' ? 'opacity-50' : ''}
		   {isSelected ? 'ring-1 ring-neural-purple/20' : ''}"
>
	<div class="flex items-center gap-3">
		<!-- Category icon -->
		<div
			class="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0
				   {status === 'completed' ? 'bg-bio-green/10' : status === 'locked' ? 'bg-bg-tertiary/30' : 'bg-bg-tertiary/50'}"
		>
			{#if status === 'completed'}
				<span class="text-bio-green text-lg">✓</span>
			{:else if status === 'locked'}
				<span class="text-text-muted text-sm">🔒</span>
			{:else}
				{catMeta?.icon ?? '🔬'}
			{/if}
		</div>

		<!-- Node info -->
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2">
				<h3
					class="text-sm font-semibold truncate
						   {status === 'completed'
						? 'text-bio-green'
						: status === 'locked'
							? 'text-text-muted'
							: 'text-text-primary'}"
				>
					{node.name}
				</h3>
			</div>

			<div class="flex items-center gap-2 mt-0.5">
				<span
					class="text-[10px] px-1.5 py-0.5 rounded font-medium"
					style="background-color: {catMeta?.color ?? '#888'}15; color: {catMeta?.color ?? '#888'};"
				>
					{catMeta?.name ?? node.category}
				</span>
				{#if status !== 'completed'}
					<span class="text-[10px] text-text-muted font-mono tabular-nums">
						{node.cost} RP
					</span>
				{/if}
			</div>
		</div>

		<!-- Status indicator / chevron -->
		<div class="shrink-0">
			{#if status === 'researching' && activeResearch}
				<div class="w-8 h-8 relative">
					<svg class="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
						<circle
							cx="16" cy="16" r="12"
							fill="none"
							stroke="var(--color-bg-tertiary)"
							stroke-width="3"
						/>
						<circle
							cx="16" cy="16" r="12"
							fill="none"
							stroke="var(--color-neural-purple)"
							stroke-width="3"
							stroke-linecap="round"
							stroke-dasharray="{2 * Math.PI * 12}"
							stroke-dashoffset="{2 * Math.PI * 12 * (1 - activeResearch.progress)}"
							class="transition-all duration-200"
						/>
					</svg>
					<span class="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-neural-purple tabular-nums">
						{Math.round(activeResearch.progress * 100)}
					</span>
				</div>
			{:else}
				<div class="text-text-muted/40 transition-transform duration-200 {isSelected ? 'rotate-90' : ''}">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
			{/if}
		</div>
	</div>
</button>
