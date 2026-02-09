<script lang="ts">
	import { activeTab } from '$lib/stores/navigation';
	import { gameState } from '$lib/stores/gameState';
	import { ACHIEVEMENTS } from '$lib/systems/AchievementSystem';
	import { playSound } from '$lib/systems/SoundManager';

	let achievementCount = $derived($gameState.achievements.length);
	let totalAchievements = ACHIEVEMENTS.length;
	let newAchievements = $derived(achievementCount);

	interface TabItem {
		id: string;
		name: string;
		shortName: string;
		icon: string;
		color: string;
	}

	const mainTabs: TabItem[] = [
		{ id: 'dashboard', name: 'Dashboard', shortName: 'Home', icon: '📊', color: '#e8ecf1' },
		{ id: 'teslaenergy', name: 'Energy', shortName: 'Energy', icon: '☀️', color: '#FFCC44' },
		{ id: 'spacex', name: 'Rockets', shortName: 'Rockets', icon: '🚀', color: '#FF4444' },
		{ id: 'tesla', name: 'Manufacturing', shortName: 'Mfg', icon: '🏭', color: '#44AAFF' },
		{ id: 'ai', name: 'AI', shortName: 'AI', icon: '🤖', color: '#AA44FF' },
		{ id: 'tunnels', name: 'Tunnels', shortName: 'Tunnels', icon: '🚇', color: '#CC7744' },
		{ id: 'robotics', name: 'Robotics', shortName: 'Robots', icon: '🦾', color: '#FF6644' },
	];

	const moreTabs: TabItem[] = [
		{ id: 'contracts', name: 'Contracts', shortName: 'Contracts', icon: '📜', color: '#44DD88' },
		{ id: 'upgrades', name: 'Upgrades', shortName: 'Upgrades', icon: '🔧', color: '#FF8844' },
		{ id: 'treasury', name: 'Treasury', shortName: 'Treasury', icon: '🏦', color: '#44AA77' },
		{ id: 'research', name: 'Research', shortName: 'R&D', icon: '🔬', color: '#9944FF' },
		{ id: 'achievements', name: 'Achievements', shortName: 'Trophies', icon: '🏆', color: '#FFCC44' },
		{ id: 'prestige', name: 'New Colony', shortName: 'Colony', icon: '🪐', color: '#9944FF' },
		{ id: 'settings', name: 'Settings', shortName: 'Settings', icon: '⚙️', color: '#8899aa' },
	];

	// All tab IDs in the "more" menu
	const moreTabIds = new Set(moreTabs.map(t => t.id));

	let moreOpen = $state(false);

	// Is the active tab one of the "more" tabs?
	let isMoreActive = $derived(moreTabIds.has($activeTab));

	function handleTabClick(tabId: string) {
		moreOpen = false;
		if ($activeTab !== tabId) {
			playSound('tabWhoosh');
		}
		activeTab.set(tabId);
	}

	function toggleMore() {
		moreOpen = !moreOpen;
	}

	function handleBackdropClick() {
		moreOpen = false;
	}
</script>

<!-- More menu backdrop + popup -->
{#if moreOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-40"
		onclick={handleBackdropClick}
	></div>
	<div
		class="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+3.75rem)] left-1/2 -translate-x-1/2 z-50
			   w-[min(20rem,calc(100vw-2rem))] bg-bg-secondary border border-white/10 rounded-2xl shadow-2xl
			   p-2 more-popup"
	>
		{#each moreTabs as tab}
			{@const isActive = $activeTab === tab.id}
			<button
				onclick={() => handleTabClick(tab.id)}
				class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150
					   active:scale-[0.97] touch-manipulation
					   {isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'}"
			>
				<span class="text-xl leading-none relative" aria-hidden="true">
					{tab.icon}
					{#if tab.id === 'achievements' && newAchievements > 0 && !isActive}
						<span class="absolute -top-1 -right-2 min-w-[14px] h-[14px] rounded-full bg-solar-gold text-[8px] text-black font-bold flex items-center justify-center px-0.5">
							{newAchievements}
						</span>
					{/if}
				</span>
				<span
					class="text-sm font-medium"
					style="color: {isActive ? tab.color : 'var(--color-text-secondary)'};"
				>
					{tab.name}
				</span>
			</button>
		{/each}
	</div>
{/if}

<nav
	class="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-md border-t border-white/5"
	style="padding-bottom: env(safe-area-inset-bottom, 0px);"
	aria-label="Division navigation"
>
	<div class="flex items-stretch max-w-2xl mx-auto">
		{#each mainTabs as tab}
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
				{#if isActive}
					<div
						class="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-full transition-all duration-300"
						style="background-color: {tab.color};"
					></div>
				{/if}

				<span
					class="text-xl leading-none transition-transform duration-200"
					class:scale-110={isActive}
					aria-hidden="true"
				>
					{tab.icon}
				</span>

				<span
					class="text-[10px] font-medium leading-tight transition-colors duration-200"
					class:text-text-muted={!isActive}
					style={isActive ? `color: ${tab.color};` : ''}
				>
					{tab.shortName}
				</span>
			</button>
		{/each}

		<!-- More tab -->
		<button
			onclick={toggleMore}
			class="tab-button group relative flex flex-col items-center justify-center gap-0.5
				   py-2 px-1 flex-1
				   transition-all duration-200
				   active:scale-90 touch-manipulation"
			aria-label="More tabs"
		>
			{#if isMoreActive}
				<div
					class="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-full transition-all duration-300 bg-white/50"
				></div>
			{/if}

			<span
				class="text-xl leading-none transition-transform duration-200"
				class:scale-110={moreOpen || isMoreActive}
				aria-hidden="true"
			>
				⋯
			</span>

			<span
				class="text-[10px] font-medium leading-tight transition-colors duration-200"
				class:text-text-muted={!isMoreActive && !moreOpen}
				style={isMoreActive ? 'color: var(--color-text-primary);' : ''}
			>
				More
			</span>
		</button>
	</div>
</nav>

<style>
	.tab-button {
		min-height: 52px;
		min-width: 44px;
	}

	.more-popup {
		animation: moreSlideUp 0.15s ease-out;
	}

	@keyframes moreSlideUp {
		from {
			opacity: 0;
			transform: translate(-50%, 8px);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0);
		}
	}
</style>
