<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { DIVISIONS } from '$lib/divisions';
	import {
		getTotalWorkers,
		getAllocatedWorkers,
		getFreeWorkers,
		getWorkersForDivision,
		allocateWorker,
		deallocateWorker,
		autoAllocateEven,
		autoAllocateByRevenue,
	} from '$lib/systems/WorkerSystem';

	const divisionIds = ['teslaenergy', 'spacex', 'tesla', 'ai', 'tunnels', 'robotics'] as const;

	let state = $derived($gameState);
	let totalWorkers = $derived(getTotalWorkers(state));
	let allocated = $derived(getAllocatedWorkers(state));
	let free = $derived(getFreeWorkers(state));

	let divisions = $derived(
		divisionIds
			.filter((id) => state.divisions[id]?.unlocked)
			.map((id) => ({
				id,
				meta: DIVISIONS[id]!,
				workers: getWorkersForDivision(state, id),
				bonus: getWorkersForDivision(state, id) * 2,
			}))
	);
</script>

<div class="bg-bg-secondary/40 rounded-xl border border-white/5 p-4 space-y-3">
	<div class="flex items-center justify-between">
		<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
			<span>👷</span> Workers
		</h2>
		<span class="text-xs font-mono tabular-nums text-text-muted">
			{free}/{totalWorkers} free
		</span>
	</div>

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
				<span class="text-xs text-text-primary flex-1 min-w-0 truncate">{div.meta.name}</span>
				{#if div.bonus > 0}
					<span class="text-[10px] font-semibold text-bio-green shrink-0">+{div.bonus}%</span>
				{/if}
				<div class="flex items-center gap-1 shrink-0">
					<button
						onclick={() => deallocateWorker(div.id)}
						disabled={div.workers <= 0}
						class="w-6 h-6 rounded-md bg-bg-tertiary/60 text-text-secondary text-xs font-bold
							   flex items-center justify-center transition-all active:scale-90 touch-manipulation
							   disabled:opacity-30 disabled:cursor-not-allowed"
					>−</button>
					<span class="text-xs font-mono tabular-nums w-6 text-center text-text-primary">{div.workers}</span>
					<button
						onclick={() => allocateWorker(div.id)}
						disabled={free <= 0}
						class="w-6 h-6 rounded-md bg-bg-tertiary/60 text-text-secondary text-xs font-bold
							   flex items-center justify-center transition-all active:scale-90 touch-manipulation
							   disabled:opacity-30 disabled:cursor-not-allowed"
					>+</button>
				</div>
			</div>
		{/each}
	</div>

	<!-- Auto-allocate buttons -->
	<div class="flex gap-2">
		<button
			onclick={autoAllocateEven}
			class="flex-1 py-1.5 px-3 rounded-lg bg-bg-tertiary/60 text-[11px] font-semibold text-text-secondary
				   transition-all active:scale-95 touch-manipulation hover:bg-bg-tertiary"
		>
			⚖️ Even
		</button>
		<button
			onclick={autoAllocateByRevenue}
			class="flex-1 py-1.5 px-3 rounded-lg bg-bg-tertiary/60 text-[11px] font-semibold text-text-secondary
				   transition-all active:scale-95 touch-manipulation hover:bg-bg-tertiary"
		>
			📈 By Revenue
		</button>
	</div>
</div>
