<script lang="ts">
	/**
	 * ProductionRatePanel.svelte — Manufacturing production rate display
	 *
	 * Shows vehicles/week counter, total vehicles produced, and a mini log.
	 * Displayed on the Manufacturing division screen.
	 */
	import { gameState } from '$lib/stores/gameState';
	import {
		getVehiclesThisWeek,
		getTotalVehiclesProduced,
		getRecentProduction,
		getDefaultFlavorStats,
	} from '$lib/systems/FlavorMechanics';

	let { color = '#4488FF' }: { color?: string } = $props();

	let stats = $derived($gameState.flavorStats ?? getDefaultFlavorStats());
	let vehiclesThisWeek = $derived(getVehiclesThisWeek(stats));
	let totalVehicles = $derived(getTotalVehiclesProduced(stats));
	let recentProduction = $derived(getRecentProduction(stats, 5));

	function formatTimeAgo(ts: number): string {
		const diffMs = Date.now() - ts;
		const diffSec = Math.floor(diffMs / 1000);
		if (diffSec < 60) return `${diffSec}s ago`;
		const diffMin = Math.floor(diffSec / 60);
		if (diffMin < 60) return `${diffMin}m ago`;
		const diffHr = Math.floor(diffMin / 60);
		return `${diffHr}h ago`;
	}
</script>

<div
	class="rounded-xl border overflow-hidden"
	style="background-color: {color}08; border-color: {color}20;"
>
	<div class="p-3">
		<!-- Header -->
		<div class="flex items-center gap-2 mb-2.5">
			<span class="text-base">🏭</span>
			<h3 class="text-xs font-bold uppercase tracking-wider" style="color: {color};">
				Production Rate
			</h3>
		</div>

		<!-- Stats row -->
		<div class="grid grid-cols-2 gap-2 mb-3">
			<div class="bg-black/20 rounded-lg p-2 text-center">
				<div class="text-[10px] text-text-muted uppercase tracking-wider">This Week</div>
				<div class="text-lg font-bold tabular-nums" style="color: {color};">
					{vehiclesThisWeek}
				</div>
				<div class="text-[9px] text-text-muted">vehicles</div>
			</div>
			<div class="bg-black/20 rounded-lg p-2 text-center">
				<div class="text-[10px] text-text-muted uppercase tracking-wider">All Time</div>
				<div class="text-lg font-bold tabular-nums text-text-primary">
					{totalVehicles}
				</div>
				<div class="text-[9px] text-text-muted">total produced</div>
			</div>
		</div>

		<!-- Recent production log -->
		{#if recentProduction.length > 0}
			<div class="space-y-1">
				<div class="text-[10px] text-text-muted uppercase tracking-wider mb-1">
					Recent Production
				</div>
				{#each recentProduction as entry (entry.ts)}
					<div class="flex items-center justify-between px-2 py-1 rounded bg-black/10 text-[11px]">
						<span class="text-text-secondary">
							<span style="color: {color};">●</span> {entry.name}
							<span class="text-text-muted">×{entry.units}</span>
						</span>
						<span class="text-text-muted text-[10px] tabular-nums">
							{formatTimeAgo(entry.ts)}
						</span>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-[11px] text-text-muted text-center py-2 italic">
				No vehicles produced yet. Start building!
			</div>
		{/if}
	</div>
</div>
