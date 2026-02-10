<script lang="ts">
	import { gameState, type GameState } from '$lib/stores/gameState';
	import { DIVISIONS } from '$lib/divisions';
	import { formatCurrency } from '$lib/engine/BigNumber';
	import { getPlanetInfo } from '$lib/systems/PrestigeSystem';
	import { getDivisionTrueIncomePerSec } from '$lib/engine/ProductionEngine';

	interface ShareCardProps {
		/** The milestone type that triggered this card */
		milestone: 'colony' | 'billion' | 'all-divisions' | 'prestige' | 'custom';
		/** Optional custom headline */
		headline?: string;
		/** Called when user wants to close the card */
		onClose: () => void;
	}

	let { milestone, headline, onClose }: ShareCardProps = $props();

	let gs = $derived($gameState);
	let copied = $state(false);

	// Derived stats
	let planet = $derived(getPlanetInfo(gs.prestigeCount));
	let playTimeMs = $derived(gs.stats.playTimeMs);
	let playTimeStr = $derived(formatPlayTime(playTimeMs));
	let divisionsUnlocked = $derived(
		Object.values(gs.divisions).filter(d => d.unlocked).length
	);
	let coloniesLaunched = $derived(gs.stats.totalPrestiges);
	let colonyProgress = $derived(gs.marsColony?.progress ?? 0);
	let netWorth = $derived(gs.cash + gs.stats.totalCashEarned);

	let totalIncomePerSec = $derived(computeTotalIncomePerSec(gs));

	function computeTotalIncomePerSec(state: GameState): number {
		let total = 0;
		for (const id of Object.keys(state.divisions)) {
			total += getDivisionTrueIncomePerSec(state, id);
		}
		return total;
	}

	function formatPlayTime(ms: number): string {
		const hours = Math.floor(ms / 3600000);
		const minutes = Math.floor((ms % 3600000) / 60000);
		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	}

	// Fun taglines based on game state
	function pickTagline(): string {
		if (headline) return headline;
		if (milestone === 'colony') return `I just colonized ${planet.name}!`;
		if (milestone === 'billion') return `I hit $1B/s income!`;
		if (milestone === 'all-divisions') return `I unlocked all 5 divisions!`;
		if (milestone === 'prestige') return `I launched a new colony!`;

		// Fun dynamic taglines for "custom" / share progress
		if (colonyProgress > 0 && colonyProgress < 100) return `${Math.round(colonyProgress)}% to Mars Colony!`;
		if (gs.marsColony?.completed) return `Mars is mine. What's next?`;
		if (totalIncomePerSec >= 1e12) return `I'm making ${formatCurrency(totalIncomePerSec)}/s in Moonshot!`;
		if (totalIncomePerSec >= 1e9) return `Billionaire status achieved 💰`;
		if (totalIncomePerSec >= 1e6) return `From zero to ${formatCurrency(totalIncomePerSec)}/s!`;
		if (divisionsUnlocked >= 5) return `All 5 divisions unlocked. Empire mode.`;
		if (coloniesLaunched > 0) return `${coloniesLaunched} ${coloniesLaunched === 1 ? 'colony' : 'colonies'} launched and counting!`;
		if (divisionsUnlocked >= 3) return `Building an empire, ${divisionsUnlocked} divisions deep`;
		return `I'm making ${formatCurrency(totalIncomePerSec)}/s in Moonshot!`;
	}

	let milestoneHeadline = $derived(pickTagline());

	let shareText = $derived(
		`🚀 ${milestoneHeadline} in Moonshot!\n` +
		`${playTimeStr} | ${formatCurrency(totalIncomePerSec)}/s income | ${divisionsUnlocked} divisions` +
		(coloniesLaunched > 0 ? ` | ${coloniesLaunched} colonies` : '') +
		(colonyProgress > 0 && colonyProgress < 100 ? ` | ${Math.round(colonyProgress)}% to Mars` : '') +
		`\nPlay free: https://moonshot.game`
	);

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(shareText);
			copied = true;
			setTimeout(() => { copied = false; }, 2000);
		} catch {
			// Fallback
			const textarea = document.createElement('textarea');
			textarea.value = shareText;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			copied = true;
			setTimeout(() => { copied = false; }, 2000);
		}
	}

	// Active divisions for display
	let activeDivisions = $derived(
		Object.entries(gs.divisions)
			.filter(([, d]) => d.unlocked)
			.map(([id]) => DIVISIONS[id])
			.filter((d): d is NonNullable<typeof d> => !!d)
	);
</script>

<!-- Backdrop -->
<div
	class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] px-4"
	role="dialog"
	aria-modal="true"
>
	<div class="max-w-sm w-full space-y-3">
		<!-- Screenshot-friendly card -->
		<div class="share-card bg-gradient-to-br from-[#0a0e1a] to-[#1a1040] rounded-2xl p-5 border border-white/10 text-center relative overflow-hidden">
			<!-- Background glow -->
			<div class="absolute inset-0 opacity-20 pointer-events-none" style="background: radial-gradient(circle at 50% 30%, {planet.color}40, transparent 70%);"></div>

			<div class="relative z-10">
				<div class="text-4xl mb-2">{planet.emoji}</div>
				<h2 class="text-lg font-bold text-white mb-1">{milestoneHeadline}</h2>
				<p class="text-xs text-white/50 mb-4 font-medium tracking-wider uppercase">Moonshot</p>

				<div class="grid grid-cols-2 gap-2 mb-4">
					<div class="bg-white/5 rounded-xl p-2.5">
						<div class="text-[10px] text-white/40 uppercase tracking-wider">Income/s</div>
						<div class="text-sm font-bold text-bio-green font-mono tabular-nums">{formatCurrency(totalIncomePerSec)}</div>
					</div>
					<div class="bg-white/5 rounded-xl p-2.5">
						<div class="text-[10px] text-white/40 uppercase tracking-wider">Net Worth</div>
						<div class="text-sm font-bold text-solar-gold font-mono tabular-nums">{formatCurrency(netWorth)}</div>
					</div>
					<div class="bg-white/5 rounded-xl p-2.5">
						<div class="text-[10px] text-white/40 uppercase tracking-wider">Divisions</div>
						<div class="text-sm font-bold text-electric-blue font-mono tabular-nums">{divisionsUnlocked}/6</div>
					</div>
					<div class="bg-white/5 rounded-xl p-2.5">
						<div class="text-[10px] text-white/40 uppercase tracking-wider">Colonies</div>
						<div class="text-sm font-bold text-neural-purple font-mono tabular-nums">{coloniesLaunched}</div>
					</div>
					<div class="bg-white/5 rounded-xl p-2.5">
						<div class="text-[10px] text-white/40 uppercase tracking-wider">Mars Colony</div>
						<div class="text-sm font-bold font-mono tabular-nums" class:text-bio-green={gs.marsColony?.completed} class:text-white={!gs.marsColony?.completed}>
							{gs.marsColony?.completed ? '✓ Done' : `${Math.round(colonyProgress)}%`}
						</div>
					</div>
					<div class="bg-white/5 rounded-xl p-2.5">
						<div class="text-[10px] text-white/40 uppercase tracking-wider">Play Time</div>
						<div class="text-sm font-bold text-white font-mono tabular-nums">{playTimeStr}</div>
					</div>
				</div>

				<!-- Division icons row -->
				{#if activeDivisions.length > 0}
					<div class="flex justify-center gap-2 mb-3">
						{#each activeDivisions as div}
							<span class="text-lg" title={div.name}>{div.icon}</span>
						{/each}
					</div>
				{/if}

				<div class="text-[10px] text-white/30">moonshot.game</div>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="flex gap-2">
			<button
				onclick={copyToClipboard}
				class="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all active:scale-95 touch-manipulation
					   {copied ? 'bg-bio-green/20 text-bio-green border border-bio-green/30' : 'bg-electric-blue text-white'}"
			>
				{copied ? '✓ Copied!' : '📋 Copy for Sharing'}
			</button>
			<button
				onclick={onClose}
				class="py-3 px-4 rounded-xl bg-bg-tertiary text-text-secondary font-semibold text-sm
					   transition-all active:scale-95 touch-manipulation"
			>
				Close
			</button>
		</div>
		<p class="text-[10px] text-text-muted text-center">
			Screenshot the card above, or copy text for Twitter/social
		</p>
	</div>
</div>
