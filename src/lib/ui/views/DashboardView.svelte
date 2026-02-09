<script lang="ts">
	import { gameState, type DivisionState } from '$lib/stores/gameState';
	import { DIVISIONS, type DivisionMeta } from '$lib/divisions';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';
	import { calculateRevenue, calculateProductionTime } from '$lib/systems/ProductionSystem';
	import { activeTab } from '$lib/stores/navigation';
	import SmoothProgressBar from '$lib/ui/SmoothProgressBar.svelte';
	import { getCycleDurationMs } from '$lib/systems/ProductionSystem';
	import SynergyPanel from '$lib/ui/SynergyPanel.svelte';

	// Division ordering for display
	const divisionIds = ['teslaenergy', 'spacex', 'tesla'] as const;

	let state = $derived($gameState);
	let prestigeCount = $derived(state.prestigeCount);
	let colonyTech = $derived(state.colonyTech);

	// Calculate per-division income/s
	function getDivisionIncomePerSec(divMeta: DivisionMeta, divState: DivisionState): number {
		if (!divState.unlocked) return 0;
		let totalPerSec = 0;
		for (let i = 0; i < divState.tiers.length; i++) {
			const tier = divState.tiers[i];
			if (!tier.unlocked || tier.count === 0) continue;
			const tierData = divMeta.tiers[i];
			if (!tierData) continue;
			const revenue = calculateRevenue(tierData.config, tier.count, tier.level);
			const prodTimeMs = calculateProductionTime(tierData.config, divState.chiefLevel);
			totalPerSec += (revenue / prodTimeMs) * 1000;
		}
		return totalPerSec;
	}

	// Calculate totals
	let divisionData = $derived(
		divisionIds.map((id) => {
			const meta = DIVISIONS[id]!;
			const divState = state.divisions[id];
			const incomePerSec = getDivisionIncomePerSec(meta, divState);
			const totalOwned = divState.tiers.reduce((sum, t) => sum + t.count, 0);
			const unlockedTiers = divState.tiers.filter((t) => t.unlocked).length;
			// Find the most active tier (highest progress if producing)
			const activeTier = divState.tiers.find((t) => t.producing && t.unlocked);
			return { id, meta, divState, incomePerSec, totalOwned, unlockedTiers, activeTier };
		})
	);

	let totalIncomePerSec = $derived(
		divisionData.reduce((sum, d) => sum + d.incomePerSec, 0)
	);

	let totalTiersOwned = $derived(
		divisionData.reduce((sum, d) => sum + d.totalOwned, 0)
	);

	let powerBalance = $derived(state.powerGenerated - state.powerConsumed);
	let prestigeMultiplier = $derived(1 + colonyTech * 0.03);

	function navigateToDivision(divId: string) {
		activeTab.set(divId);
	}
</script>

<div class="dashboard space-y-5">
	<!-- Welcome header -->
	<div>
		<h1 class="text-xl font-bold text-text-primary">Tech Tycoon</h1>
		<p class="text-sm text-text-secondary mt-0.5">
			{#if prestigeCount > 0}
				Timeline #{prestigeCount + 1} · The next big bet
			{:else}
				Make life multi-planetary. One tap at a time.
			{/if}
		</p>
	</div>

	<!-- Total Income Banner -->
	<div
		class="relative overflow-hidden rounded-xl p-4 border border-white/5"
		style="background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(68, 136, 255, 0.08) 100%);"
	>
		<div class="relative z-10">
			<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">
				Total Income
			</div>
			<div class="text-2xl font-bold text-text-primary tabular-nums font-mono">
				{formatCurrency(totalIncomePerSec, 2)}<span class="text-sm text-text-secondary font-normal">/s</span>
			</div>
		</div>
		<!-- Subtle background glow -->
		{#if totalIncomePerSec > 0}
			<div
				class="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl"
				style="background: var(--color-bio-green);"
			></div>
		{/if}
	</div>

	<!-- Quick Stats Grid -->
	<div class="grid grid-cols-3 gap-2">
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-white/[0.03]">
			<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Tiers Owned</div>
			<div class="text-lg font-bold text-text-primary tabular-nums mt-0.5">
				{totalTiersOwned}
			</div>
		</div>
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-white/[0.03]">
			<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Power</div>
			<div class="text-lg font-bold tabular-nums mt-0.5"
				class:text-bio-green={powerBalance >= 0}
				class:text-rocket-red={powerBalance < 0}
			>
				{powerBalance >= 0 ? '+' : ''}{formatNumber(powerBalance, 1)}
				<span class="text-[10px] text-text-muted font-normal">MW</span>
			</div>
		</div>
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-white/[0.03]">
			<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Prestige</div>
			<div class="text-lg font-bold text-neural-purple tabular-nums mt-0.5">
				{#if colonyTech > 0}
					×{prestigeMultiplier.toFixed(1)}
				{:else}
					<span class="text-text-muted">—</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Synergies -->
	<SynergyPanel />

	<!-- Division Cards -->
	<div>
		<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
			Divisions
		</h2>
		<div class="space-y-2.5">
			{#each divisionData as div}
				{@const isUnlocked = div.divState.unlocked}
				<button
					onclick={() => navigateToDivision(div.id)}
					class="division-card group w-full text-left bg-bg-secondary/40 rounded-xl border border-white/5
						   hover:border-white/10 transition-all duration-200 overflow-hidden
						   active:scale-[0.98] touch-manipulation
						   {isUnlocked ? '' : 'opacity-50'}"
				>
					<div class="p-4">
						<div class="flex items-center gap-3">
							<!-- Division icon -->
							<div
								class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0
									   transition-transform duration-200 group-hover:scale-105"
								style="background-color: {div.meta.color}12; border: 1px solid {div.meta.color}20;"
							>
								{div.meta.icon}
							</div>

							<!-- Division info -->
							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between gap-2">
									<h3 class="font-semibold text-sm text-text-primary truncate">
										{div.meta.name}
									</h3>
									{#if isUnlocked && div.incomePerSec > 0}
										<span
											class="text-xs font-bold tabular-nums font-mono shrink-0"
											style="color: {div.meta.color};"
										>
											{formatCurrency(div.incomePerSec, 1)}/s
										</span>
									{/if}
								</div>

								<p class="text-xs text-text-muted truncate mt-0.5">
									{div.meta.description}
								</p>

								{#if isUnlocked}
									<!-- Stats row -->
									<div class="flex items-center gap-3 mt-1.5">
										<span class="text-[10px] text-text-muted">
											<span class="font-semibold text-text-secondary">{div.unlockedTiers}</span>/{div.divState.tiers.length} tiers
										</span>
										<span class="text-[10px] text-text-muted">
											<span class="font-semibold text-text-secondary">{div.totalOwned}</span> owned
										</span>
										{#if div.divState.chiefLevel > 0}
											<span class="text-[10px] font-semibold" style="color: {div.meta.color};">
												👔 Lv.{div.divState.chiefLevel}
											</span>
										{/if}
									</div>
								{:else}
									<div class="flex items-center gap-1.5 mt-1.5">
										<span class="text-[10px] text-text-muted">🔒 Locked</span>
									</div>
								{/if}
							</div>

							<!-- Chevron -->
							<div class="text-text-muted/40 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</div>
						</div>
					</div>

					<!-- Production progress bar at the bottom of the card -->
					{#if isUnlocked && div.activeTier}
						{@const tierIndex = div.divState.tiers.indexOf(div.activeTier)}
						{@const tierData = div.meta.tiers[tierIndex]}
						<div class="px-4 pb-2">
							<div
								class="w-full rounded-full overflow-hidden"
								style="height: 2px; background-color: var(--color-bg-tertiary);"
							>
								<SmoothProgressBar
									producing={div.activeTier.producing}
									progress={div.activeTier.progress}
									cycleDurationMs={tierData ? getCycleDurationMs(tierData.config, div.divState.chiefLevel) : 1000}
									color={div.meta.color}
								/>
							</div>
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Net Worth & Activity -->
	<div class="grid grid-cols-2 gap-2.5">
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-white/5">
			<div class="text-xs text-text-muted mb-1">Net Worth</div>
			<div class="text-lg font-bold text-text-primary tabular-nums font-mono">
				{formatCurrency(state.cash)}
			</div>
		</div>
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-white/5">
			<div class="text-xs text-text-muted mb-1">Research</div>
			<div class="text-lg font-bold text-text-primary tabular-nums font-mono">
				{formatNumber(state.researchPoints, 0)} <span class="text-xs text-text-muted font-normal">RP</span>
			</div>
		</div>
	</div>

	<!-- Activity feed placeholder -->
	<div>
		<h2 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
			Activity
		</h2>
		<div class="bg-bg-secondary/30 rounded-xl p-6 border border-white/5 text-center">
			<p class="text-sm text-text-muted">Start producing to see activity here</p>
		</div>
	</div>
</div>

<style>
	.division-card {
		-webkit-tap-highlight-color: transparent;
	}
</style>
