<script lang="ts">
	import { activeTab } from '$lib/stores/navigation';

	interface TabItem {
		id: string;
		name: string;
		shortName: string;
		icon: string;
		color: string;
	}

	const tabs: TabItem[] = [
		{ id: 'dashboard', name: 'Dashboard', shortName: 'Home', icon: '📊', color: '#e8ecf1' },
		{ id: 'spacex', name: 'SpaceX', shortName: 'Rockets', icon: '🚀', color: '#FF4444' },
		{ id: 'tesla', name: 'Tesla', shortName: 'EVs', icon: '🔋', color: '#4488FF' },
		{ id: 'teslaenergy', name: 'Tesla Energy', shortName: 'Energy', icon: '☀️', color: '#FFCC44' },
		{ id: 'research', name: 'Research', shortName: 'Research', icon: '🔬', color: '#9944FF' },
		{ id: 'prestige', name: 'The IPO', shortName: 'IPO', icon: '🔔', color: '#9944FF' },
		{ id: 'settings', name: 'Settings', shortName: 'Settings', icon: '⚙️', color: '#8899aa' },
	];

	function handleTabClick(tabId: string) {
		activeTab.set(tabId);
	}
</script>

<nav
	class="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-md border-t border-white/5"
	style="padding-bottom: env(safe-area-inset-bottom, 0px);"
	aria-label="Division navigation"
>
	<div class="flex items-stretch justify-around max-w-2xl mx-auto">
		{#each tabs as tab}
			{@const isActive = $activeTab === tab.id}
			<button
				onclick={() => handleTabClick(tab.id)}
				class="tab-button group relative flex flex-col items-center justify-center gap-0.5
					   py-2 px-1 flex-1
					   transition-all duration-200
					   active:scale-90 touch-manipulation"
				aria-current={isActive ? 'page' : undefined}
				aria-label={tab.name}
				data-tutorial-id="tab-{tab.id}"
			>
				<!-- Active indicator line -->
				{#if isActive}
					<div
						class="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-full transition-all duration-300"
						style="background-color: {tab.color};"
					></div>
				{/if}

				<!-- Icon -->
				<span
					class="text-xl leading-none transition-transform duration-200"
					class:scale-110={isActive}
					aria-hidden="true"
				>
					{tab.icon}
				</span>

				<!-- Label -->
				<span
					class="text-[10px] font-medium leading-tight transition-colors duration-200"
					class:text-text-muted={!isActive}
					style={isActive ? `color: ${tab.color};` : ''}
				>
					{tab.shortName}
				</span>
			</button>
		{/each}
	</div>
</nav>

<style>
	/* Ensure minimum 44px touch target for accessibility */
	.tab-button {
		min-height: 52px;
		min-width: 64px;
	}
</style>
