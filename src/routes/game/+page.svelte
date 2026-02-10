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
		stats: () => import('$lib/ui/views/StatsView.svelte'),
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
		{#await lazyViews[$activeTab]()}
			<div class="flex items-center justify-center py-20">
				<div class="text-center">
					<div class="loading-spinner mx-auto mb-3"></div>
					<p class="text-text-muted text-sm">Loading…</p>
				</div>
			</div>
		{:then mod}
			<mod.default />
		{:catch err}
			<div class="flex items-center justify-center py-20">
				<div class="text-center">
					<div class="text-3xl mb-2">⚠️</div>
					<p class="text-text-secondary text-sm mb-1">Failed to load view</p>
					<p class="text-text-muted text-xs">{err?.message ?? 'Unknown error'}</p>
				</div>
			</div>
		{/await}
	{:else}
		<DivisionView divisionId={$activeTab} />
	{/if}
</div>

<style>
	.view-container {
		animation: viewFadeIn 0.2s ease-out;
	}

	.loading-spinner {
		width: 24px;
		height: 24px;
		border: 2.5px solid rgba(255, 255, 255, 0.1);
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
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
