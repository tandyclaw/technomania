<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { DIVISIONS } from '$lib/divisions';
	import {
		getTotalWorkers,
		getAllocatedWorkers,
		getFreeWorkers,
		getWorkersForDivision,
		getWorkerBonusPercent,
		allocateWorker,
		deallocateWorker,
		autoAllocateEven,
		autoAllocateByRevenue,
		autoAllocateSmart,
	} from '$lib/systems/WorkerSystem';

	const divisionIds = ['teslaenergy', 'spacex', 'tesla', 'ai', 'tunnels', 'robotics'] as const;

	let state = $derived($gameState);
	let totalWorkers = $derived(getTotalWorkers(state));
	let allocated = $derived(getAllocatedWorkers(state));
	let free = $derived(getFreeWorkers(state));
	let bonusPerWorker = $derived(getWorkerBonusPercent());

	let divisions = $derived(
		divisionIds
			.filter((id) => state.divisions[id]?.unlocked)
			.map((id) => ({
				id,
				meta: DIVISIONS[id]!,
				workers: getWorkersForDivision(state, id),
				bonus: getWorkersForDivision(state, id) * bonusPerWorker,
			}))
	);

	let showTooltip = $state(false);
</script>

<div class="bg-bg-secondary/40 rounded-xl border border-white/5 p-4 space-y-3">
	<div class="flex items-center justify-between">
		<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
			<span>👷</span> Workers
			<!-- Info tooltip toggle -->
			<button
				onclick={() => showTooltip = !showTooltip}
				class="w-4 h-4 rounded-full bg-bg-tertiary/60 text-[10px] text-text-muted flex items-center justify-center hover:text-text-secondary transition-colors"
				title="What do workers do?"
			>?</button>
		</h2>
		<span class="text-xs font-mono tabular-nums text-text-muted">
			{free}/{totalWorkers} free
		</span>
	</div>

	<!-- Tooltip -->
	{#if showTooltip}
		<div class="bg-bg-tertiary/60 rounded-lg p-3 text-[11px] text-text-secondary space-y-1 border border-white/5">
			<p><strong>Workers</strong> boost division efficiency. Each worker assigned gives <span class="text-bio-green font-bold">+{bonusPerWorker}%</span> revenue &amp; speed to that division.</p>
			<p class="text-text-muted">You earn more workers as your total cash earned grows (1 per $1M, up to 100). Use strategies below to auto-assign them.</p>
		</div>
	{/if}

	<!-- Worker pool bar -->
	<div class="w-full h-2 bg-bg-tertiary/40 rounded-full overflow-hidden">
		<div
			class="h-full rounded-full transition-all duration-300 bg-electric-blue"
			style="width: {totalWorkers > 0 ? (allocated / totalWorkers) * 100 : 0}%;"
		></div>
	</div>

	<!-- Division allocations -->
	<div class="space-y-2">
		{#each divisions as div (div.id)}
			<div class="flex items-center gap-2">
				<span class="text-base shrink-0">{div.meta.icon}</span>
				<div class="flex-1 min-w-0">
					<span class="text-xs text-text-primary truncate block">{div.meta.name}</span>
					<span class="text-[10px] text-text-muted">+{bonusPerWorker}%/worker</span>
				</div>
				{#if div.bonus > 0}
					<span class="text-[10px] font-semibold text-bio-green shrink-0">+{div.bonus}%</span>
				{/if}
				<div class="flex items-center gap-1.5 shrink-0">
					<button
						onclick={() => deallocateWorker(div.id)}
						disabled={div.workers <= 0}
						class="w-9 h-9 rounded-lg bg-bg-tertiary/60 text-text-secondary text-sm font-bold
							   flex items-center justify-center transition-all active:scale-90 touch-manipulation
							   disabled:opacity-30 disabled:cursor-not-allowed
							   sm:w-7 sm:h-7 sm:text-xs sm:rounded-md"
					>−</button>
					<span class="text-xs font-mono tabular-nums w-6 text-center text-text-primary">{div.workers}</span>
					<button
						onclick={() => allocateWorker(div.id)}
						disabled={free <= 0}
						class="w-9 h-9 rounded-lg bg-bg-tertiary/60 text-text-secondary text-sm font-bold
							   flex items-center justify-center transition-all active:scale-90 touch-manipulation
							   disabled:opacity-30 disabled:cursor-not-allowed
							   sm:w-7 sm:h-7 sm:text-xs sm:rounded-md"
					>+</button>
				</div>
			</div>
		{/each}
	</div>

	<!-- Auto-allocate buttons -->
	<div class="flex gap-2">
		<button
			onclick={autoAllocateEven}
			class="flex-1 py-2 px-3 rounded-lg bg-bg-tertiary/60 text-[11px] font-semibold text-text-secondary
				   transition-all active:scale-95 touch-manipulation hover:bg-bg-tertiary"
			title="Distribute workers equally across all unlocked divisions"
		>
			⚖️ Even
		</button>
		<button
			onclick={autoAllocateByRevenue}
			class="flex-1 py-2 px-3 rounded-lg bg-bg-tertiary/60 text-[11px] font-semibold text-text-secondary
				   transition-all active:scale-95 touch-manipulation hover:bg-bg-tertiary"
			title="Allocate proportional to division revenue"
		>
			📈 Revenue
		</button>
		<button
			onclick={autoAllocateSmart}
			class="flex-1 py-2 px-3 rounded-lg bg-electric-blue/15 text-[11px] font-semibold text-electric-blue
				   transition-all active:scale-95 touch-manipulation hover:bg-electric-blue/25 border border-electric-blue/20"
			title="Maximize total income by assigning workers where they have the highest ROI"
		>
			🧠 Smart
		</button>
	</div>
</div>
