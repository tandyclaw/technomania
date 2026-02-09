<script lang="ts">
	import { activeTab } from '$lib/stores/navigation';
	import DashboardView from '$lib/ui/views/DashboardView.svelte';
	import DivisionView from '$lib/ui/views/DivisionView.svelte';
	import UpgradesView from '$lib/ui/views/UpgradesView.svelte';

	// Lazy-load views behind the "More" menu
	const lazyViews = {
		research: () => import('$lib/ui/views/ResearchView.svelte'),
		prestige: () => import('$lib/ui/views/PrestigeView.svelte'),
		treasury: () => import('$lib/ui/views/TreasuryView.svelte'),
		achievements: () => import('$lib/ui/views/AchievementsView.svelte'),
		contracts: () => import('$lib/ui/views/ContractsView.svelte'),
		settings: () => import('$lib/ui/views/SettingsView.svelte'),
	} as const;

	type LazyTab = keyof typeof lazyViews;
	const isLazyTab = (tab: string): tab is LazyTab => tab in lazyViews;
</script>

<!-- PERF: Removed {#key} wrapper — it was destroying and recreating the entire
     view subtree (including all TierCards) on every tab switch. The {#if}/{:else}
     blocks already handle showing the correct view. DivisionView gets divisionId
     as a prop so it naturally re-renders when the tab changes. -->
<div class="view-container">
	{#if $activeTab === 'dashboard'}
		<DashboardView />
	{:else if $activeTab === 'upgrades'}
		<UpgradesView />
	{:else if isLazyTab($activeTab)}
		{#await lazyViews[$activeTab]() then mod}
			<mod.default />
		{/await}
	{:else}
		<DivisionView divisionId={$activeTab} />
	{/if}
</div>

<style>
	.view-container {
		animation: viewFadeIn 0.2s ease-out;
	}

	@keyframes viewFadeIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
