<script lang="ts">
	import { gameState, type GameState } from '$lib/stores/gameState';
	import { DIVISIONS } from '$lib/divisions';
	import { formatCurrency } from '$lib/engine/BigNumber';
	import { getPlanetInfo } from '$lib/systems/PrestigeSystem';
	import { calculateRevenue, calculateProductionTime } from '$lib/systems/ProductionSystem';

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

	let totalIncomePerSec = $derived(computeTotalIncomePerSec(gs));

	function computeTotalIncomePerSec(state: GameState): number {
		let total = 0;
		for (const [id, divState] of Object.entries(state.divisions)) {
			if (!divState.unlocked) continue;
			const meta = DIVISIONS[id];
			if (!meta) continue;
			for (let i = 0; i < divState.tiers.length; i++) {
				const tier = divState.tiers[i];
				if (!tier.unlocked || tier.count === 0) continue;
				const tierData = meta.tiers[i];
				if (!tierData) continue;
				const revenue = calculateRevenue(tierData.config, tier.count, tier.level);
				const prodTimeMs = calculateProductionTime(tierData.config, divState.chiefLevel);
				total += (revenue / prodTimeMs) * 1000;
			}
		}
		return total;
	}

	function formatPlayTime(ms: number): string {
		const hours = Math.floor(ms / 3600000);
		const minutes = Math.floor((ms % 3600000) / 60000);
		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	}

	let milestoneHeadline = $derived(
		headline ??
		(milestone === 'colony' ? `I just colonized ${planet.name}!` :
		 milestone === 'billion' ? `I hit $1B/s income!` :
		 milestone === 'all-divisions' ? `I unlocked all 6 divisions!` :
		 milestone === 'prestige' ? `I launched a new colony!` :
		 `Check out my progress!`)
	);

	let shareText = $derived(
		`🚀 ${milestoneHeadline} in Moonshot!\n` +
		`${playTimeStr} | ${formatCurrency(totalIncomePerSec)}/s income | ${divisionsUnlocked} divisions` +
		(coloniesLaunched > 0 ? ` | ${coloniesLaunched} colonies` : '') +
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
						<div class="text-[10px] text-white/40 uppercase tracking-wider">Time Played</div>
						<div class="text-sm font-bold text-white font-mono tabular-nums">{playTimeStr}</div>
					</div>
					<div class="bg-white/5 rounded-xl p-2.5">
						<div class="text-[10px] text-white/40 uppercase tracking-wider">Income/s</div>
						<div class="text-sm font-bold text-bio-green font-mono tabular-nums">{formatCurrency(totalIncomePerSec)}</div>
					</div>
					<div class="bg-white/5 rounded-xl p-2.5">
						<div class="text-[10px] text-white/40 uppercase tracking-wider">Divisions</div>
						<div class="text-sm font-bold text-electric-blue font-mono tabular-nums">{divisionsUnlocked}/6</div>
					</div>
					<div class="bg-white/5 rounded-xl p-2.5">
						<div class="text-[10px] text-white/40 uppercase tracking-wider">Colonies</div>
						<div class="text-sm font-bold text-solar-gold font-mono tabular-nums">{coloniesLaunched}</div>
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
