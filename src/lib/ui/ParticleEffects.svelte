<script lang="ts">
	import { particleEvents } from '$lib/stores/particleStore';

	let events = $derived($particleEvents);
</script>

{#if events.length > 0}
	<div class="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
		{#each events as event (event.id)}
			{#if event.type === 'confetti'}
				<div class="confetti-burst">
					{#each Array(30) as _, i}
						<div
							class="confetti-piece"
							style="
								--x: {Math.random() * 100}vw;
								--delay: {Math.random() * 0.3}s;
								--rotation: {Math.random() * 720 - 360}deg;
								--color: {['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D', '#C084FC', '#60A5FA'][i % 8]};
								--size: {4 + Math.random() * 6}px;
								--drift: {Math.random() * 60 - 30}px;
							"
						></div>
					{/each}
				</div>
			{:else if event.type === 'spark'}
				<div class="spark-burst" style="left: {event.x ?? 50}%; top: {event.y ?? 50}%;">
					{#each Array(8) as _, i}
						<div
							class="spark-piece"
							style="
								--angle: {(i / 8) * 360}deg;
								--dist: {15 + Math.random() * 20}px;
								--delay: {Math.random() * 0.1}s;
							"
						></div>
					{/each}
				</div>
			{/if}
		{/each}
	</div>
{/if}

<style>
	.confetti-piece {
		position: absolute;
		top: -10px;
		left: var(--x);
		width: var(--size);
		height: var(--size);
		background: var(--color);
		border-radius: 2px;
		animation: confettiFall 1.8s ease-out var(--delay) forwards;
	}

	@keyframes confettiFall {
		0% {
			opacity: 1;
			transform: translateY(0) translateX(0) rotate(0deg) scale(1);
		}
		100% {
			opacity: 0;
			transform: translateY(100vh) translateX(var(--drift)) rotate(var(--rotation)) scale(0.5);
		}
	}

	.spark-burst {
		position: absolute;
		transform: translate(-50%, -50%);
	}

	.spark-piece {
		position: absolute;
		width: 3px;
		height: 3px;
		background: #FFD93D;
		border-radius: 50%;
		box-shadow: 0 0 4px #FFD93D;
		animation: sparkFly 0.6s ease-out var(--delay) forwards;
	}

	@keyframes sparkFly {
		0% {
			opacity: 1;
			transform: rotate(var(--angle)) translateX(0) scale(1);
		}
		100% {
			opacity: 0;
			transform: rotate(var(--angle)) translateX(var(--dist)) scale(0);
		}
	}
</style>
