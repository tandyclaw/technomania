<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { DIVISIONS } from '$lib/divisions';
	import { formatCurrency } from '$lib/engine/BigNumber';

	let state = $derived($gameState);
	let hidden = $state(false);

	// Generate messages based on game state
	let messages = $derived(generateMessages(state));

	function generateMessages(s: typeof state): string[] {
		const msgs: string[] = [];

		// Tips (always available)
		msgs.push('TIP: Hire chiefs to automate production while you\'re away');
		msgs.push('TIP: Synergies between divisions boost revenue — unlock more divisions!');
		msgs.push('TIP: Pull down on the dashboard to save your game');

		// Dynamic messages based on state
		const totalTiers = Object.values(s.divisions).reduce(
			(sum, d) => sum + d.tiers.reduce((s2, t) => s2 + t.count, 0), 0
		);

		if (totalTiers > 0) {
			msgs.push(`EMPIRE UPDATE: Your company now operates ${totalTiers} production units across all divisions`);
		}

		if (s.stats.totalTaps > 100) {
			msgs.push(`BREAKING: CEO has personally overseen ${s.stats.totalTaps.toLocaleString()} production cycles`);
		}

		if (s.cash > 1_000_000) {
			msgs.push(`MARKETS: Tech stocks surge as your empire crosses ${formatCurrency(s.cash)} in net worth`);
		}

		if (s.researchPoints > 100) {
			msgs.push(`SCIENCE: Your R&D labs have accumulated ${Math.floor(s.researchPoints).toLocaleString()} research points`);
		}

		// Division-specific messages
		for (const [divId, divState] of Object.entries(s.divisions)) {
			const meta = DIVISIONS[divId];
			if (!meta || !divState.unlocked) continue;

			const totalOwned = divState.tiers.reduce((sum: number, t) => sum + t.count, 0);
			if (totalOwned > 50) {
				msgs.push(`INDUSTRY: Your ${meta.name} division now operates ${totalOwned} units — analysts are impressed`);
			}

			if (divState.chiefLevel > 0) {
				msgs.push(`HR: ${meta.name} division chief (Lv.${divState.chiefLevel}) reports record automation efficiency`);
			}

			// Tier-specific flavor
			const tier0 = divState.tiers[0];
			if (tier0 && tier0.count >= 100) {
				msgs.push(`MILESTONE: Your fleet of ${tier0.count} ${meta.tiers[0]?.name ?? 'units'} reaches a new record`);
			}
		}

		if (s.divisions.spacex.unlocked) {
			const rockets = s.divisions.spacex.tiers.reduce((sum, t) => sum + t.count, 0);
			if (rockets > 10) {
				msgs.push(`SPACE: ${rockets} active rocket systems — orbital dominance within reach`);
			}
		}

		if (s.marsColony.progress > 0 && !s.marsColony.completed) {
			msgs.push(`COLONY: Mars colony progress at ${s.marsColony.progress.toFixed(1)}% — humanity edges closer to the stars`);
		}

		if (s.marsColony.completed) {
			msgs.push('BREAKING: Mars colony successfully established — a new era for humanity begins');
		}

		if (s.prestigeCount > 0) {
			msgs.push(`HISTORY: ${s.prestigeCount} colonies launched across the solar system`);
		}

		if (s.activeSynergies.length > 0) {
			msgs.push(`SYNERGY: ${s.activeSynergies.length} active cross-division synergies boosting your empire`);
		}

		if (s.stats.highestIncomePerSec > 10000) {
			msgs.push(`RECORD: Peak income of ${formatCurrency(s.stats.highestIncomePerSec)}/s — Wall Street is watching`);
		}

		if (s.treasury.btcOwned > 0) {
			msgs.push('CRYPTO: Your Bitcoin holdings draw attention from institutional investors');
		}

		if (s.ngPlusLevel > 0) {
			msgs.push(`MULTIVERSE: Timeline #${s.ngPlusLevel + 1} — the laws of economics are... different here`);
		}

		return msgs;
	}

	// Cycle through messages
	let tickerText = $derived(messages.join('   ●   '));
</script>

{#if !hidden && messages.length > 0}
	<div class="relative overflow-hidden bg-bg-secondary/60 border-b border-white/5">
		<div class="flex items-center">
			<span class="shrink-0 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-solar-gold bg-solar-gold/10 border-r border-white/5">
				📰 News
			</span>
			<div class="flex-1 overflow-hidden py-1.5">
				<div class="ticker-scroll whitespace-nowrap text-xs text-text-secondary">
					{tickerText}
				</div>
			</div>
			<button
				onclick={() => hidden = true}
				class="shrink-0 px-2 py-1.5 text-text-muted hover:text-text-secondary transition-colors"
				aria-label="Dismiss news ticker"
			>
				<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
					<path d="M2 2L10 10M10 2L2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				</svg>
			</button>
		</div>
	</div>
{/if}

<style>
	.ticker-scroll {
		display: inline-block;
		padding-left: 100%;
		animation: ticker-slide 60s linear infinite;
	}

	@keyframes ticker-slide {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-100%);
		}
	}

	.ticker-scroll:hover {
		animation-play-state: paused;
	}
</style>
