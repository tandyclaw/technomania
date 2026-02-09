<script lang="ts">
	import { floatingTexts } from '$lib/stores/floatingTextStore';
	import { gameState } from '$lib/stores/gameState';

	let enabled = $derived($gameState.settings.floatingTextEnabled);
</script>

{#if enabled}
	{#each $floatingTexts as ft (ft.id)}
		<div class="floating-text fixed z-[70] pointer-events-none text-bio-green font-bold text-sm font-mono"
			style="left: 50%; top: 40%;">
			{ft.text}
		</div>
	{/each}
{/if}

<style>
	.floating-text {
		animation: floatUp 1.2s ease-out forwards;
		text-shadow: 0 1px 4px rgba(0,0,0,0.5);
	}

	@keyframes floatUp {
		0% {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
		70% {
			opacity: 0.8;
		}
		100% {
			opacity: 0;
			transform: translateX(-50%) translateY(-60px);
		}
	}
</style>
