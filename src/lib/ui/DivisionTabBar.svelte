<script lang="ts">
	import { activeTab } from '$lib/stores/navigation';

	interface Division {
		id: string;
		name: string;
		shortName: string;
		icon: string;
		color: string;
	}

	const divisions: Division[] = [
		{ id: 'dashboard', name: 'Dashboard', shortName: 'Home', icon: '📊', color: '#e8ecf1' },
		{ id: 'helios', name: 'Helios Power', shortName: 'Helios', icon: '☀️', color: '#FFCC44' },
		{ id: 'apex', name: 'Apex Rocketry', shortName: 'Apex', icon: '🚀', color: '#FF4444' },
		{ id: 'volt', name: 'Volt Motors', shortName: 'Volt', icon: '🔋', color: '#4488FF' },
		{ id: 'research', name: 'Research', shortName: 'R&D', icon: '🔬', color: '#9944FF' },
	];
</script>

<nav
	class="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-md border-t border-white/5"
	style="padding-bottom: env(safe-area-inset-bottom, 0px);"
>
	<div class="flex items-stretch justify-around max-w-2xl mx-auto">
		{#each divisions as div}
			{@const isActive = $activeTab === div.id}
			<button
				onclick={() => activeTab.set(div.id)}
				class="group relative flex flex-col items-center justify-center gap-0.5
					   py-2 px-1 min-w-[60px] flex-1
					   transition-all duration-200
					   active:scale-90 touch-manipulation"
				aria-label={div.name}
				aria-current={isActive ? 'page' : undefined}
			>
				<!-- Active indicator -->
				{#if isActive}
					<div
						class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full transition-all duration-300"
						style="background-color: {div.color};"
					></div>
				{/if}

				<!-- Icon -->
				<span
					class="text-xl leading-none transition-transform duration-200"
					class:scale-110={isActive}
				>
					{div.icon}
				</span>

				<!-- Label -->
				<span
					class="text-[10px] font-medium leading-none transition-colors duration-200"
					class:text-text-muted={!isActive}
					style={isActive ? `color: ${div.color};` : ''}
				>
					{div.shortName}
				</span>
			</button>
		{/each}
	</div>
</nav>
