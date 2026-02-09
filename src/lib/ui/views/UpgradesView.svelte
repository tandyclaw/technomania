<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { formatCurrency } from '$lib/engine/BigNumber';
	import { ALL_UPGRADES, isUpgradeAvailable, isUpgradePurchased, purchaseUpgrade, type UpgradeCategory } from '$lib/systems/UpgradeSystem';

	let gs = $derived($gameState);
	let cash = $derived(gs.cash);

	let selectedCategory = $state<UpgradeCategory | 'all'>('all');

	const categories: { id: UpgradeCategory | 'all'; label: string; icon: string }[] = [
		{ id: 'all', label: 'All', icon: '📋' },
		{ id: 'speed', label: 'Speed', icon: '⚡' },
		{ id: 'revenue', label: 'Revenue', icon: '💰' },
		{ id: 'cost', label: 'Cost', icon: '🏷️' },
	];

	let filteredUpgrades = $derived(
		selectedCategory === 'all'
			? ALL_UPGRADES
			: ALL_UPGRADES.filter(u => u.category === selectedCategory)
	);

	let availableUpgrades = $derived(
		filteredUpgrades.filter(u => !isUpgradePurchased(u.id, gs) && isUpgradeAvailable(u, gs))
	);

	let lockedUpgrades = $derived(
		filteredUpgrades.filter(u => !isUpgradePurchased(u.id, gs) && !isUpgradeAvailable(u, gs))
	);

	let purchasedUpgradesList = $derived(
		filteredUpgrades.filter(u => isUpgradePurchased(u.id, gs))
	);

	let totalPurchased = $derived((gs.purchasedUpgrades ?? []).length);

	function handleBuy(upgradeId: string) {
		purchaseUpgrade(upgradeId);
	}

	function getCategoryColor(cat: UpgradeCategory): string {
		switch (cat) {
			case 'speed': return '#4488FF';
			case 'revenue': return '#22C55E';
			case 'cost': return '#FFCC44';
		}
	}

	function getCategoryIcon(cat: UpgradeCategory): string {
		switch (cat) {
			case 'speed': return '⚡';
			case 'revenue': return '💰';
			case 'cost': return '🏷️';
		}
	}
</script>

<div class="space-y-5">
	<!-- Header -->
	<div>
		<h1 class="text-xl font-bold text-text-primary flex items-center gap-2">
			<span>🔧</span> Upgrades
		</h1>
		<p class="text-sm text-text-secondary mt-0.5">
			One-time boosts. {totalPurchased}/{ALL_UPGRADES.length} purchased.
		</p>
	</div>

	<!-- Category Tabs -->
	<div class="flex gap-2">
		{#each categories as cat}
			<button
				onclick={() => selectedCategory = cat.id}
				class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
					   {selectedCategory === cat.id ? 'bg-white/10 text-text-primary' : 'bg-bg-secondary/40 text-text-muted hover:text-text-secondary'}"
			>
				<span>{cat.icon}</span>
				{cat.label}
			</button>
		{/each}
	</div>

	<!-- Available Upgrades -->
	{#if availableUpgrades.length > 0}
		<div class="space-y-2">
			<div class="text-xs text-text-muted uppercase tracking-wider font-medium">Available</div>
			{#each availableUpgrades as upgrade}
				{@const canAfford = cash >= upgrade.cost}
				{@const color = getCategoryColor(upgrade.category)}
				<div class="bg-bg-secondary/60 rounded-xl p-3.5 border border-white/[0.03] flex items-center gap-3">
					<div class="text-2xl shrink-0">{getCategoryIcon(upgrade.category)}</div>
					<div class="flex-1 min-w-0">
						<div class="text-sm font-semibold text-text-primary truncate">{upgrade.name}</div>
						<div class="text-xs text-text-muted mt-0.5">{upgrade.description}</div>
					</div>
					<button
						onclick={() => handleBuy(upgrade.id)}
						disabled={!canAfford}
						class="shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 touch-manipulation
							   disabled:opacity-40 disabled:cursor-not-allowed"
						style="background-color: {canAfford ? color + '15' : 'var(--color-bg-tertiary)'};
							   color: {canAfford ? color : 'var(--color-text-muted)'};
							   border: 1px solid {canAfford ? color + '25' : 'transparent'};"
					>
						{formatCurrency(upgrade.cost)}
					</button>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Locked Upgrades -->
	{#if lockedUpgrades.length > 0}
		<div class="space-y-2">
			<div class="text-xs text-text-muted uppercase tracking-wider font-medium">🔒 Locked</div>
			{#each lockedUpgrades as upgrade}
				<div class="bg-bg-secondary/30 rounded-xl p-3.5 border border-white/[0.02] opacity-50 flex items-center gap-3">
					<div class="text-2xl shrink-0">🔒</div>
					<div class="flex-1 min-w-0">
						<div class="text-sm font-semibold text-text-muted truncate">{upgrade.name}</div>
						<div class="text-xs text-text-muted/70 mt-0.5">
							{#if upgrade.requiresTierCount}
								Requires {upgrade.requiresTierCount.count}× tier {upgrade.requiresTierCount.tierIndex + 1} in {upgrade.requiresTierCount.divisionId}
							{:else if upgrade.requiresMilestone}
								Requires milestone: {upgrade.requiresMilestone.threshold} units
							{:else}
								Requirements not met
							{/if}
						</div>
					</div>
					<span class="text-xs text-text-muted font-mono shrink-0">{formatCurrency(upgrade.cost)}</span>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Purchased -->
	{#if purchasedUpgradesList.length > 0}
		<div class="space-y-2">
			<div class="text-xs text-text-muted uppercase tracking-wider font-medium">✅ Purchased</div>
			{#each purchasedUpgradesList as upgrade}
				{@const color = getCategoryColor(upgrade.category)}
				<div class="bg-bg-secondary/30 rounded-xl p-3 border border-white/[0.02] flex items-center gap-3">
					<div class="text-xl shrink-0">✅</div>
					<div class="flex-1 min-w-0">
						<div class="text-sm font-semibold text-text-secondary truncate">{upgrade.name}</div>
						<div class="text-xs mt-0.5" style="color: {color};">{upgrade.description}</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if availableUpgrades.length === 0 && lockedUpgrades.length === 0 && purchasedUpgradesList.length === 0}
		<div class="text-center py-8 text-text-muted">
			<div class="text-3xl mb-2">🔧</div>
			<p class="text-sm">No upgrades in this category yet.</p>
		</div>
	{/if}
</div>
