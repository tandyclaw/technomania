<script lang="ts">
	import { activeTab } from '$lib/stores/navigation';
	import DashboardView from '$lib/ui/views/DashboardView.svelte';
	import DivisionView from '$lib/ui/views/DivisionView.svelte';
</script>

{#key $activeTab}
	<div class="view-container" role="tabpanel" id="tab-panel-{$activeTab}">
		{#if $activeTab === 'dashboard'}
			<DashboardView />
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
