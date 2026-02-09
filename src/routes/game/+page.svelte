<script lang="ts">
	import { activeTab } from '$lib/stores/navigation';
	import DashboardView from '$lib/ui/views/DashboardView.svelte';
	import DivisionView from '$lib/ui/views/DivisionView.svelte';
	import ResearchView from '$lib/ui/views/ResearchView.svelte';
	import PrestigeView from '$lib/ui/views/PrestigeView.svelte';
	import SettingsView from '$lib/ui/views/SettingsView.svelte';
	import TreasuryView from '$lib/ui/views/TreasuryView.svelte';
	import AchievementsView from '$lib/ui/views/AchievementsView.svelte';
	import UpgradesView from '$lib/ui/views/UpgradesView.svelte';
	import ContractsView from '$lib/ui/views/ContractsView.svelte';
</script>

{#key $activeTab}
	<div class="view-container">
		{#if $activeTab === 'dashboard'}
			<DashboardView />
		{:else if $activeTab === 'research'}
			<ResearchView />
		{:else if $activeTab === 'prestige'}
			<PrestigeView />
		{:else if $activeTab === 'upgrades'}
			<UpgradesView />
		{:else if $activeTab === 'treasury'}
			<TreasuryView />
		{:else if $activeTab === 'achievements'}
			<AchievementsView />
		{:else if $activeTab === 'settings'}
			<SettingsView />
		{:else}
			<DivisionView divisionId={$activeTab} />
		{/if}
	</div>
{/key}

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
