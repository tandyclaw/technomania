<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { formatNumber } from '$lib/engine/BigNumber';
	import { TECH_TREE, TECH_TREE_MAP, CATEGORY_META } from '$lib/data/techTree';
	import {
		getNodeStatus,
		canResearch,
		startResearch,
		cancelResearch,
		calculateRPPerSecond,
		type NodeStatus,
	} from '$lib/systems/ResearchSystem';
	import ResearchNodeCard from '$lib/ui/ResearchNodeCard.svelte';

	let rp = $derived($gameState.researchPoints);
	let activeResearch = $derived($gameState.activeResearch);
	let unlockedResearch = $derived($gameState.unlockedResearch);
	let rpPerSec = $derived(calculateRPPerSecond($gameState));

	// Selected node for detail panel
	let selectedNodeId = $state<string | null>(null);
	let selectedNode = $derived(selectedNodeId ? TECH_TREE_MAP[selectedNodeId] ?? null : null);
	let selectedStatus = $derived(
		selectedNode ? getNodeStatus(selectedNode, unlockedResearch, activeResearch) : 'locked' as NodeStatus
	);
	let selectedCanStart = $derived(
		selectedNode ? canResearch(selectedNode, unlockedResearch, rp, activeResearch) : false
	);

	// Active research node data
	let activeNode = $derived(activeResearch ? TECH_TREE_MAP[activeResearch.id] ?? null : null);

	// Filter state
	let filterCategory = $state<string | null>(null);

	// Filtered and sorted nodes
	let filteredNodes = $derived(() => {
		let nodes = [...TECH_TREE];
		if (filterCategory) {
			nodes = nodes.filter((n) => n.category === filterCategory);
		}
		// Sort: completed last, available first, then locked
		const statusOrder: Record<NodeStatus, number> = {
			researching: 0,
			available: 1,
			locked: 2,
			completed: 3,
		};
		nodes.sort((a, b) => {
			const sa = getNodeStatus(a, unlockedResearch, activeResearch);
			const sb = getNodeStatus(b, unlockedResearch, activeResearch);
			return statusOrder[sa] - statusOrder[sb];
		});
		return nodes;
	});

	let completedCount = $derived(unlockedResearch.length);
	let totalCount = $derived(TECH_TREE.length);

	// Unique categories for filter
	const categories = [...new Set(TECH_TREE.map((n) => n.category))];

	function handleSelectNode(nodeId: string) {
		selectedNodeId = selectedNodeId === nodeId ? null : nodeId;
	}

	function handleStartResearch() {
		if (selectedNode && selectedCanStart) {
			startResearch(selectedNode.id);
			selectedNodeId = null;
		}
	}

	function handleCancelResearch() {
		cancelResearch();
	}

	function formatTime(ms: number): string {
		const totalSec = Math.ceil(ms / 1000);
		if (totalSec < 60) return `${totalSec}s`;
		const min = Math.floor(totalSec / 60);
		const sec = totalSec % 60;
		return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
	}
</script>

<div class="space-y-4">
	<!-- Research header -->
	<div class="flex items-center gap-3">
		<div
			class="w-12 h-12 rounded-xl flex items-center justify-center text-3xl shrink-0 bg-neural-purple/15 border border-neural-purple/30"
		>
			🔬
		</div>
		<div class="flex-1">
			<h1 class="text-xl font-bold text-neural-purple">Research Lab</h1>
			<p class="text-xs text-text-secondary">
				{formatNumber(rp, 1)} RP · {completedCount}/{totalCount} completed
			</p>
		</div>
		<div class="text-right">
			<div class="text-xs text-text-muted">Earning</div>
			<div class="text-sm font-bold text-neural-purple tabular-nums font-mono">
				+{formatNumber(rpPerSec, 2)}<span class="text-xs text-text-muted font-normal">/s</span>
			</div>
		</div>
	</div>

	<!-- Active research banner -->
	{#if activeResearch && activeNode}
		<div class="bg-neural-purple/10 rounded-xl p-4 border border-neural-purple/20">
			<div class="flex items-center justify-between mb-2">
				<div class="flex items-center gap-2">
					<span class="text-sm">
						{CATEGORY_META[activeNode.category]?.icon ?? '🔬'}
					</span>
					<span class="text-sm font-semibold text-text-primary">{activeNode.name}</span>
				</div>
				<span class="text-xs text-neural-purple font-mono tabular-nums">
					{Math.round(activeResearch.progress * 100)}%
				</span>
			</div>
			<div class="h-2.5 bg-bg-tertiary/50 rounded-full overflow-hidden mb-2">
				<div
					class="h-full bg-neural-purple rounded-full transition-all duration-200"
					style="width: {activeResearch.progress * 100}%"
				></div>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-[10px] text-text-muted">
					~{formatTime(activeNode.timeMs * (1 - activeResearch.progress))} remaining
				</span>
				<button
					onclick={handleCancelResearch}
					class="text-[10px] text-rocket-red/70 hover:text-rocket-red transition-colors px-2 py-0.5 rounded"
				>
					Cancel (50% refund)
				</button>
			</div>
		</div>
	{/if}

	<!-- Category filters -->
	<div class="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
		<button
			onclick={() => (filterCategory = null)}
			class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
				   {filterCategory === null
				? 'bg-neural-purple/20 text-neural-purple border border-neural-purple/30'
				: 'bg-bg-secondary/40 text-text-muted border border-white/5 hover:text-text-secondary'}"
		>
			All
		</button>
		{#each categories as cat}
			{@const meta = CATEGORY_META[cat]}
			<button
				onclick={() => (filterCategory = filterCategory === cat ? null : cat)}
				class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
					   {filterCategory === cat
					? 'bg-neural-purple/20 text-neural-purple border border-neural-purple/30'
					: 'bg-bg-secondary/40 text-text-muted border border-white/5 hover:text-text-secondary'}"
			>
				{meta?.icon ?? '?'} {meta?.name ?? cat}
			</button>
		{/each}
	</div>

	<!-- Tech tree nodes -->
	<div class="space-y-2">
		{#each filteredNodes() as node (node.id)}
			{@const status = getNodeStatus(node, unlockedResearch, activeResearch)}
			{@const isSelected = selectedNodeId === node.id}
			<ResearchNodeCard
				{node}
				{status}
				{isSelected}
				onSelect={() => handleSelectNode(node.id)}
			/>

			<!-- Expanded detail panel -->
			{#if isSelected && selectedNode}
				<div
					class="rounded-xl border overflow-hidden animate-slideDown
						   {status === 'completed'
						? 'bg-bio-green/5 border-bio-green/15'
						: status === 'available'
							? 'bg-neural-purple/8 border-neural-purple/20'
							: 'bg-bg-secondary/30 border-white/5'}"
				>
					<div class="p-4 space-y-3">
						<!-- Description -->
						<p class="text-sm text-text-secondary">{selectedNode.description}</p>

						<!-- Effects list -->
						<div class="space-y-1.5">
							<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">
								Effects
							</div>
							{#each selectedNode.effects as effect}
								<div class="flex items-center gap-2 text-xs">
									<span class="text-bio-green">✦</span>
									<span class="text-text-secondary">{effect.description}</span>
								</div>
							{/each}
						</div>

						<!-- Prerequisites -->
						{#if selectedNode.prerequisites.length > 0}
							<div class="space-y-1.5">
								<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">
									Requires
								</div>
								<div class="flex flex-wrap gap-1.5">
									{#each selectedNode.prerequisites as prereqId}
										{@const prereq = TECH_TREE_MAP[prereqId]}
										{@const done = unlockedResearch.includes(prereqId)}
										<span
											class="px-2 py-0.5 rounded text-[10px] font-medium
												   {done
												? 'bg-bio-green/15 text-bio-green'
												: 'bg-bg-tertiary/40 text-text-muted'}"
										>
											{done ? '✓' : '○'} {prereq?.name ?? prereqId}
										</span>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Cost & time info -->
						<div class="flex items-center gap-4 text-xs text-text-muted pt-1">
							<span>🔬 {selectedNode.cost} RP</span>
							<span>⏱ {formatTime(selectedNode.timeMs)}</span>
						</div>

						<!-- Action button -->
						{#if status === 'available'}
							<button
								onclick={handleStartResearch}
								class="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
									   active:scale-[0.97] touch-manipulation
									   {selectedCanStart
									? 'bg-neural-purple/20 text-neural-purple border border-neural-purple/30 hover:bg-neural-purple/30'
									: 'bg-bg-tertiary/50 text-text-muted border border-white/5 cursor-not-allowed'}"
								disabled={!selectedCanStart}
							>
								{#if !selectedCanStart && activeResearch}
									Research in progress...
								{:else if !selectedCanStart}
									Not enough RP ({formatNumber(rp, 0)}/{selectedNode.cost})
								{:else}
									Start Research — {selectedNode.cost} RP
								{/if}
							</button>
						{:else if status === 'completed'}
							<div
								class="w-full py-2 rounded-xl text-sm font-semibold text-center
									   bg-bio-green/10 text-bio-green border border-bio-green/20"
							>
								✓ Completed
							</div>
						{:else if status === 'researching'}
							<div
								class="w-full py-2 rounded-xl text-sm font-semibold text-center
									   bg-neural-purple/10 text-neural-purple border border-neural-purple/20"
							>
								⏳ Researching...
							</div>
						{:else}
							<div
								class="w-full py-2 rounded-xl text-sm font-semibold text-center
									   bg-bg-tertiary/30 text-text-muted border border-white/5"
							>
								🔒 Prerequisites not met
							</div>
						{/if}
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Empty state -->
	{#if filteredNodes().length === 0}
		<div class="bg-bg-secondary/30 rounded-xl p-8 border border-white/5 text-center">
			<div class="text-4xl mb-3">🧪</div>
			<h2 class="text-base font-semibold text-text-primary mb-1">No Research Found</h2>
			<p class="text-sm text-text-muted">Try a different category filter.</p>
		</div>
	{/if}
</div>

<style>
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}

	.animate-slideDown {
		animation: slideDown 0.2s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
