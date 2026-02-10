<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { DIVISIONS } from '$lib/divisions';
	import { formatCurrency } from '$lib/engine/BigNumber';
	import { eventBus } from '$lib/engine/EventBus';
	import { DIVISION_CHIEFS } from '$lib/systems/ChiefSystem';
	import { onMount, onDestroy } from 'svelte';
	import { notifications } from '$lib/stores/eventStore';

	let notifs = $derived($notifications);
	let hidden = $state(false);

	// ─── Event-driven news feed ──────────────────────────────────────────────
	// These are pushed in real-time as things happen in the game

	let eventNews: string[] = $state([]);
	const MAX_EVENT_NEWS = 20;

	function pushNews(headline: string) {
		eventNews = [headline, ...eventNews].slice(0, MAX_EVENT_NEWS);
	}

	onMount(() => {
		const unsubs = [
			eventBus.on('achievement:unlocked', (data) => {
				pushNews(`🏆 ACHIEVEMENT: "${data.name}" unlocked — ${data.description}`);
			}),
			eventBus.on('chief:hired', (data) => {
				const chief = DIVISION_CHIEFS[data.division];
				const meta = DIVISIONS[data.division];
				if (chief && meta) {
					if (data.level === 1) {
						pushNews(`HIRING: ${chief.name} joins as ${chief.title} for ${meta.name}`);
					} else {
						pushNews(`PROMOTION: ${chief.name} promoted to Level ${data.level} — ${meta.name} efficiency soars`);
					}
				}
			}),
			eventBus.on('research:complete', (data) => {
				pushNews(`SCIENCE: Research labs discover "${data.name}" — new possibilities unlocked`);
			}),
			eventBus.on('division:unlocked', (data) => {
				const meta = DIVISIONS[data.division];
				if (meta) {
					pushNews(`BREAKING: ${meta.name} division launched — analysts predict massive growth`);
				}
			}),
			eventBus.on('tier:unlocked', (data) => {
				const meta = DIVISIONS[data.division];
				if (meta) {
					const tierName = meta.tiers[data.tier]?.name ?? `Tier ${data.tier + 1}`;
					pushNews(`EXPANSION: ${meta.name} unveils new ${tierName} production line`);
				}
			}),
			eventBus.on('synergy:discovered', (data) => {
				const src = DIVISIONS[data.source]?.name ?? data.source;
				const tgt = DIVISIONS[data.target]?.name ?? data.target;
				pushNews(`SYNERGY: ${src} × ${tgt} collaboration discovered — ${data.bonus}`);
			}),
			eventBus.on('prestige:complete', (data) => {
				pushNews(`BREAKING: Colony #${data.totalVision} launched — humanity expands across the solar system`);
			}),
			eventBus.on('bottleneck:hit', (data) => {
				const meta = DIVISIONS[data.division];
				if (meta) {
					pushNews(`⚠️ ALERT: ${meta.name} hits ${data.type} bottleneck — ${data.description}`);
				}
			}),
			eventBus.on('bottleneck:resolved', (data) => {
				const meta = DIVISIONS[data.division];
				if (meta) {
					pushNews(`RESOLVED: ${meta.name} ${data.type} bottleneck cleared — production resumes`);
				}
			}),
		];

		return () => unsubs.forEach((fn) => fn());
	});

	// ─── Static tips ─────────────────────────────────────────────────────────

	const TIPS: string[] = [
		'TIP: Hire chiefs to automate production while you\'re away',
		'TIP: Synergies between divisions boost revenue — unlock more divisions!',
		'TIP: Pull down on the dashboard to save your game',
		'TIP: Upgrade tiers to multiply your income per unit',
		'TIP: Research new technologies to unlock powerful bonuses',
		'TIP: Watch for random events — choosing wisely gives huge buffs',
	];

	// ─── Snapshot-based news (re-derived each tick) ──────────────────────────

	// PERF: Snapshot news only needs to update every few seconds, not every tick.
	// Use a cached version that updates on a timer instead of deriving from state directly.
	let snapshotNews = $state<string[]>([]);
	let snapshotTimer: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		snapshotNews = generateSnapshotNews($gameState);
		snapshotTimer = setInterval(() => {
			snapshotNews = generateSnapshotNews($gameState);
		}, 5000);
	});

	onDestroy(() => {
		if (snapshotTimer) clearInterval(snapshotTimer);
	});

	function generateSnapshotNews(s: import('$lib/stores/gameState').GameState): string[] {
		const msgs: string[] = [];

		// Revenue milestones
		const incomePerSec = s.stats.highestIncomePerSec;
		if (incomePerSec > 0) {
			const thresholds = [100, 1000, 10_000, 100_000, 1_000_000, 1e9, 1e12];
			for (const t of thresholds) {
				if (incomePerSec >= t) {
					msgs.push(`MARKET: Revenue surges past ${formatCurrency(t)}/s across all divisions`);
				}
			}
		}

		// Division production milestones
		for (const [divId, divState] of Object.entries(s.divisions)) {
			const meta = DIVISIONS[divId];
			if (!meta || !divState.unlocked) continue;

			const totalOwned = divState.tiers.reduce((sum: number, t) => sum + t.count, 0);
			const milestones = [10, 25, 50, 100, 250, 500, 1000];
			for (const m of milestones) {
				if (totalOwned >= m && totalOwned < m * 2.5) {
					msgs.push(`BREAKING: ${meta.name} division just hit ${m} units!`);
					break;
				}
			}

			if (divState.chiefLevel > 0) {
				const chief = DIVISION_CHIEFS[divId];
				if (chief) {
					msgs.push(`HR: ${chief.name} (Lv.${divState.chiefLevel}) reports record ${meta.name} automation efficiency`);
				}
			}
		}

		// Cash milestones
		if (s.cash > 1_000_000) {
			msgs.push(`MARKETS: Tech stocks surge as empire crosses ${formatCurrency(s.cash)} in net worth`);
		}

		// Research points
		if (s.researchPoints > 100) {
			msgs.push(`SCIENCE: R&D labs have accumulated ${Math.floor(s.researchPoints).toLocaleString()} research points`);
		}

		// Mars colony
		if (s.marsColony.progress > 0 && !s.marsColony.completed) {
			msgs.push(`COLONY: Mars colony progress at ${s.marsColony.progress.toFixed(1)}% — humanity edges closer to the stars`);
		}
		if (s.marsColony.completed) {
			msgs.push('BREAKING: Mars colony successfully established — a new era for humanity begins');
		}

		// Rockets
		if (s.divisions.spacex.unlocked) {
			const rockets = s.divisions.spacex.tiers.reduce((sum, t) => sum + t.count, 0);
			if (rockets > 10) {
				msgs.push(`SPACE: ${rockets} active rocket systems — orbital dominance within reach`);
			}
		}

		// Synergies
		if (s.activeSynergies.length > 0) {
			msgs.push(`SYNERGY: ${s.activeSynergies.length} active cross-division synergies boosting the empire`);
		}

		// Prestige
		if (s.prestigeCount > 0) {
			msgs.push(`HISTORY: ${s.prestigeCount} colonies launched across the solar system`);
		}

		// Bitcoin
		if (s.treasury.btcOwned > 0) {
			msgs.push('CRYPTO: Bitcoin holdings draw attention from institutional investors');
		}

		// NG+
		if (s.ngPlusLevel > 0) {
			msgs.push(`MULTIVERSE: Timeline #${s.ngPlusLevel + 1} — the laws of economics are... different here`);
		}

		// Tap milestone
		if (s.stats.totalTaps > 100) {
			msgs.push(`BREAKING: CEO has personally overseen ${s.stats.totalTaps.toLocaleString()} production cycles`);
		}

		return msgs;
	}

	// ─── Notification-sourced news (events that already fired) ───────────────

	let notifNews = $derived(
		notifs
			.filter((n) => n.type === 'event')
			.slice(0, 5)
			.map((n) => `EVENT: ${n.title} — ${n.message}`)
	);

	// ─── Combine all sources, weighted toward dynamic content ────────────────

	// PERF: Select tips once, not every derived re-evaluation (Math.random in $derived is non-deterministic)
	let selectedTips = $state(TIPS.slice(0, 2));

	let messages = $derived(buildTickerMessages());

	function buildTickerMessages(): string[] {
		const dynamic = [...eventNews, ...notifNews, ...snapshotNews];

		if (dynamic.length === 0) {
			// No game activity yet — show tips only
			return TIPS;
		}

		// Deduplicate
		const seen = new Set<string>();
		const deduped: string[] = [];
		for (const msg of dynamic) {
			if (!seen.has(msg)) {
				seen.add(msg);
				deduped.push(msg);
			}
		}

		return [...deduped, ...selectedTips];
	}

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
