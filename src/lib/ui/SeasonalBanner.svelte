<script lang="ts">
	import { activeSeasonalEvent } from '$lib/systems/SeasonalEventSystem';

	let dismissed = $state(false);
</script>

{#if $activeSeasonalEvent && !dismissed}
	<div
		class="relative overflow-hidden rounded-xl mx-2 mb-2 p-3 bg-gradient-to-r {$activeSeasonalEvent.gradient} shadow-lg"
		role="banner"
	>
		<!-- Animated sparkle background -->
		<div class="absolute inset-0 opacity-20 pointer-events-none">
			{#each Array(6) as _, i}
				<div
					class="absolute rounded-full bg-white"
					style="
						width: {2 + Math.random() * 3}px;
						height: {2 + Math.random() * 3}px;
						top: {Math.random() * 100}%;
						left: {Math.random() * 100}%;
						animation: seasonalTwinkle {1.5 + Math.random() * 2}s ease-in-out {Math.random() * 2}s infinite;
					"
				></div>
			{/each}
		</div>

		<div class="relative flex items-start gap-3">
			<span class="text-2xl flex-shrink-0">{$activeSeasonalEvent.icon}</span>
			<div class="flex-1 min-w-0">
				<div class="font-bold text-white text-sm leading-tight">{$activeSeasonalEvent.name}</div>
				<div class="text-white/80 text-xs leading-snug mt-0.5 break-words">{$activeSeasonalEvent.description}</div>
				<div class="flex gap-2 mt-1">
					{#if $activeSeasonalEvent.revenueMultiplier > 1}
						<span class="text-[10px] bg-white/20 rounded-full px-2 py-0.5 text-white font-medium">
							💰 {$activeSeasonalEvent.revenueMultiplier}x Revenue
						</span>
					{/if}
					{#if $activeSeasonalEvent.speedMultiplier > 1}
						<span class="text-[10px] bg-white/20 rounded-full px-2 py-0.5 text-white font-medium">
							⚡ {$activeSeasonalEvent.speedMultiplier}x Speed
						</span>
					{/if}
				</div>
			</div>
			<button
				class="flex-shrink-0 text-white/60 hover:text-white transition-colors p-1"
				onclick={() => dismissed = true}
				aria-label="Dismiss seasonal event banner"
			>
				✕
			</button>
		</div>
	</div>
{/if}

<style>
	@keyframes seasonalTwinkle {
		0%, 100% { opacity: 0; transform: scale(0.5); }
		50% { opacity: 1; transform: scale(1); }
	}
</style>
