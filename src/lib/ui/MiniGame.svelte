<script lang="ts">
	import {
		miniGameState,
		miniGameTap,
		updateCharge,
		releaseCharge,
		miniGameTypeChar,
		dismissMiniGame,
	} from '$lib/systems/MiniGameSystem';

	let state = $derived($miniGameState);
	let game = $derived(state.game);

	// Charge animation frame loop
	let chargeAnimFrame: number | null = $state(null);
	let lastChargeTime = $state(0);
	let holding = $state(false);

	function startCharge() {
		if (state.result !== 'none') return;
		holding = true;
		lastChargeTime = performance.now();
		function loop(now: number) {
			if (!holding) return;
			const delta = now - lastChargeTime;
			lastChargeTime = now;
			updateCharge(delta);
			chargeAnimFrame = requestAnimationFrame(loop);
		}
		chargeAnimFrame = requestAnimationFrame(loop);
	}

	function stopCharge() {
		holding = false;
		if (chargeAnimFrame) {
			cancelAnimationFrame(chargeAnimFrame);
			chargeAnimFrame = null;
		}
		releaseCharge();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!state.active || !game) return;
		if (game.type === 'hack-mainframe' && state.result === 'none') {
			if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
				miniGameTypeChar(e.key);
			}
		}
	}

	function formatMs(ms: number): string {
		return (Math.max(0, ms) / 1000).toFixed(1);
	}

	let chargeColor = $derived.by(() => {
		const lvl = state.chargeLevel;
		if (lvl >= 90) return 'bg-bio-green';
		if (lvl >= 70) return 'bg-solar-gold';
		return 'bg-electric-blue';
	});

	let resultEmoji = $derived(state.result === 'success' ? '🎉' : '💥');
	let resultTitle = $derived.by(() => {
		if (state.result === 'success') {
			if (game?.type === 'launch-window') return 'LAUNCH SUCCESSFUL!';
			if (game?.type === 'power-surge') return 'SURGE CAPTURED!';
			return 'SYSTEM HACKED!';
		}
		return 'MISSION SCRUBBED';
	});
	let resultSubtitle = $derived(
		state.result === 'success'
			? 'Buff applied! 🔥'
			: 'Next window in 10 minutes.'
	);
</script>

<svelte:window onkeydown={handleKeydown} />

{#if state.active && game}
	<!-- Full-screen overlay -->
	<div class="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 backdrop-blur-sm">
		<div class="w-full max-w-sm mx-4 text-center">
			{#if state.result === 'none'}
				<!-- Active game UI -->
				<div class="mb-4 text-5xl animate-bounce">{game.icon}</div>
				<h2 class="text-2xl font-black text-solar-gold mb-1 tracking-tight">{game.title}</h2>
				<p class="text-sm text-text-secondary mb-6">{game.subtitle}</p>

				<!-- Timer bar -->
				<div class="w-full h-2 rounded-full bg-bg-tertiary mb-6 overflow-hidden">
					<div
						class="h-full rounded-full bg-rocket-red transition-all duration-100 ease-linear"
						style="width: {(state.remainingMs / game.durationMs) * 100}%"
					></div>
				</div>
				<p class="text-xs text-text-muted font-mono mb-6">{formatMs(state.remainingMs)}s</p>

				{#if game.type === 'launch-window'}
					<!-- Tap target -->
					<button
						onclick={miniGameTap}
						class="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-rocket-red to-tunnel-orange
							   flex items-center justify-center text-6xl
							   active:scale-90 transition-transform duration-75
							   shadow-lg shadow-rocket-red/30 touch-manipulation select-none"
					>
						🚀
					</button>
					<p class="mt-4 text-lg font-bold text-text-primary">
						<span class="text-solar-gold text-3xl font-mono tabular-nums">{state.tapCount}</span>
						<span class="text-text-muted"> / 20</span>
					</p>
					<!-- Progress dots -->
					<div class="flex justify-center gap-1 mt-3 flex-wrap max-w-[200px] mx-auto">
						{#each Array(20) as _, i}
							<div
								class="w-2.5 h-2.5 rounded-full transition-all duration-100"
								class:bg-solar-gold={i < state.tapCount}
								class:scale-125={i === state.tapCount - 1}
								class:bg-bg-tertiary={i >= state.tapCount}
							></div>
						{/each}
					</div>

				{:else if game.type === 'power-surge'}
					<!-- Charge meter -->
					<div class="w-48 mx-auto mb-4">
						<div class="relative w-full h-48 rounded-xl border-2 border-white/10 bg-bg-tertiary overflow-hidden">
							<!-- Fill -->
							<div
								class="absolute bottom-0 left-0 right-0 transition-all duration-75 {chargeColor}"
								style="height: {state.chargeLevel}%"
							></div>
							<!-- 90% line (success zone) -->
							<div class="absolute left-0 right-0 border-t-2 border-dashed border-bio-green/60" style="bottom: 90%"></div>
							<div class="absolute right-1 text-[10px] text-bio-green font-mono" style="bottom: 89%">90%</div>
							<!-- Percentage label -->
							<div class="absolute inset-0 flex items-center justify-center">
								<span class="text-3xl font-black text-white drop-shadow-lg font-mono">
									{Math.round(state.chargeLevel)}%
								</span>
							</div>
						</div>
					</div>
					<!-- Hold button -->
					<button
						onpointerdown={startCharge}
						onpointerup={stopCharge}
						onpointerleave={stopCharge}
						class="w-40 h-16 mx-auto rounded-2xl font-bold text-lg touch-manipulation select-none
							   {holding
								? 'bg-solar-gold text-bg-primary scale-95'
								: 'bg-bg-secondary text-solar-gold border-2 border-solar-gold/40'}
							   transition-all duration-100"
					>
						{holding ? '⚡ CHARGING...' : 'HOLD TO CHARGE'}
					</button>
					<p class="text-xs text-text-muted mt-3">Release in the green zone (90-100%)</p>

				{:else if game.type === 'hack-mainframe'}
					<!-- Code sequence display -->
					<div class="bg-bg-secondary rounded-xl p-4 mb-4 border border-white/10">
						<p class="text-xs text-text-muted mb-2 font-mono">TARGET SEQUENCE:</p>
						<div class="flex justify-center gap-1.5">
							{#each state.codeSequence.split('') as char, i}
								<div
									class="w-10 h-12 rounded-lg flex items-center justify-center text-xl font-mono font-bold
										   transition-all duration-150
										   {i < state.codeInput.length
											? 'bg-bio-green/20 text-bio-green border border-bio-green/40'
											: i === state.codeInput.length
												? 'bg-solar-gold/10 text-solar-gold border-2 border-solar-gold/60 scale-110'
												: 'bg-bg-tertiary text-text-secondary border border-white/5'}"
								>
									{char}
								</div>
							{/each}
						</div>
					</div>
					<!-- Virtual keyboard for mobile -->
					<div class="grid grid-cols-7 gap-1 max-w-[320px] mx-auto">
						{#each 'ABCDEFGHJKLMNPQRSTUVWXYZ2345679'.split('') as key}
							<button
								onclick={() => miniGameTypeChar(key)}
								class="h-10 rounded-lg bg-bg-secondary text-text-primary font-mono font-bold text-sm
									   active:bg-solar-gold active:text-bg-primary transition-colors
									   touch-manipulation select-none border border-white/5"
							>
								{key}
							</button>
						{/each}
					</div>
					<p class="text-xs text-text-muted mt-3">Type the sequence (or use keyboard)</p>
				{/if}

			{:else}
				<!-- Result screen -->
				<div class="text-6xl mb-4 {state.result === 'success' ? 'animate-bounce' : ''}">{resultEmoji}</div>
				<h2 class="text-2xl font-black mb-2 tracking-tight
						   {state.result === 'success' ? 'text-bio-green' : 'text-rocket-red'}">
					{resultTitle}
				</h2>
				<p class="text-sm text-text-secondary mb-8">{resultSubtitle}</p>
				<button
					onclick={dismissMiniGame}
					class="px-8 py-3 rounded-xl font-bold text-bg-primary bg-solar-gold
						   active:scale-95 transition-transform touch-manipulation"
				>
					Continue
				</button>
			{/if}
		</div>
	</div>
{/if}
