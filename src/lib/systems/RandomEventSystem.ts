/**
 * RandomEventSystem.ts — Random events that pop up during gameplay
 * Events fire every 2-5 minutes, offering choices that apply timed buffs or instant effects.
 */

import { get } from 'svelte/store';
import { gameState } from '$lib/stores/gameState';
import {
	pendingEvent,
	addBuff,
	activeBuffs,
	hasActiveBuff,
	tickBuffs,
	addNotification,
	type EventChoice,
	type ActiveBuff,
} from '$lib/stores/eventStore';
import { eventBus } from '$lib/engine/EventBus';

// ─── Event Definitions ──────────────────────────────────────────────────────

interface EventDef {
	id: string;
	title: string;
	icon: string;
	description: string;
	color: string;
	/** Timer for the modal in ms (0 = wait forever) */
	timerMs: number;
	/** Return choices based on current state. Empty = unavoidable event (auto-apply). */
	choices: () => EventChoice[];
	/** For unavoidable events — called automatically */
	autoApply?: () => void;
	/** Condition check — skip this event if false */
	condition?: () => boolean;
}

const DIVISION_NAMES: Record<string, string> = {
	teslaenergy: 'Energy',
	spacex: 'Rockets',
	tesla: 'Manufacturing',
	ai: 'AI',
	tunnels: 'Tunnels',
	robotics: 'Robotics',
};

function getUnlockedDivisions(): string[] {
	const s = get(gameState);
	return (['teslaenergy', 'tesla', 'spacex', 'ai', 'tunnels', 'robotics'] as const).filter(
		(id) => s.divisions[id].unlocked
	);
}

const EVENT_DEFS: EventDef[] = [
	// 1. Government Solar Subsidy
	{
		id: 'solar_subsidy',
		title: 'Government Solar Subsidy',
		icon: '☀️',
		description: 'The government is offering renewable energy incentives. How do you capitalize?',
		color: '#FFCC44',
		timerMs: 20000,
		condition: () => get(gameState).divisions.teslaenergy.unlocked,
		choices: () => [
			{
				label: '+50% Energy Revenue (60s)',
				icon: '⚡',
				description: 'Boost Energy revenue for a full minute.',
				action: () => {
					addBuff({
						id: 'solar_subsidy',
						name: 'Solar Subsidy',
						icon: '☀️',
						durationMs: 60000,
						effect: '+50% Energy revenue',
						color: 'text-solar-gold',
					});
				},
			},
			{
				label: 'Cash Grant',
				icon: '💰',
				description: 'Take a one-time cash bonus instead.',
				action: () => {
					const bonus = Math.max(get(gameState).cash * 0.1, 5000);
					gameState.update((s) => ({ ...s, cash: s.cash + bonus }));
				},
			},
		],
	},
	// 2. Rocket Contract
	{
		id: 'spacex_contract',
		title: 'Government Launch Contract',
		icon: '🛰️',
		description: 'NASA wants to partner on a launch contract. Pick your reward.',
		color: '#4488FF',
		timerMs: 20000,
		condition: () => get(gameState).divisions.spacex.unlocked,
		choices: () => [
			{
				label: 'Free Launches (30s)',
				icon: '🚀',
				description: 'All Rockets production costs waived for 30 seconds.',
				action: () => {
					addBuff({
						id: 'free_launches',
						name: 'Free Launches',
						icon: '🚀',
						durationMs: 30000,
						effect: 'Free Rockets production',
						color: 'text-electric-blue',
					});
				},
			},
			{
				label: 'Bonus Research',
				icon: '🔬',
				description: 'Gain a chunk of research points.',
				action: () => {
					const bonus = Math.max(50, Math.floor(get(gameState).researchPoints * 0.25));
					gameState.update((s) => ({ ...s, researchPoints: s.researchPoints + bonus }));
				},
			},
		],
	},
	// 3. AI Breakthrough
	{
		id: 'ai_breakthrough',
		title: 'AI Breakthrough!',
		icon: '🧠',
		description: 'Your AI lab has made a stunning discovery!',
		color: '#9944FF',
		timerMs: 20000,
		condition: () => get(gameState).divisions.ai.unlocked,
		choices: () => [
			{
				label: 'Skip Research',
				icon: '⏩',
				description: 'Instantly complete current research project.',
				action: () => {
					gameState.update((s) => {
						if (!s.activeResearch) return s;
						const completedId = s.activeResearch.id;
						return {
							...s,
							activeResearch: null,
							unlockedResearch: [...s.unlockedResearch, completedId],
						};
					});
				},
			},
			{
				label: '2x AI Speed (60s)',
				icon: '⚡',
				description: 'Double AI division production speed.',
				action: () => {
					addBuff({
						id: 'ai_speed',
						name: 'AI Overdrive',
						icon: '🧠',
						durationMs: 60000,
						effect: '2x AI speed',
						color: 'text-neural-purple',
					});
				},
			},
		],
	},
	// 4. Tunnel Collapse (unavoidable bad event)
	{
		id: 'tunnel_collapse',
		title: 'Tunnel Collapse!',
		icon: '💥',
		description: 'A section of tunnel has collapsed. Production is impacted while crews repair.',
		color: '#FF4444',
		timerMs: 0,
		condition: () => get(gameState).divisions.tunnels.unlocked,
		choices: () => [],
		autoApply: () => {
			addBuff({
				id: 'tunnel_collapse',
				name: 'Tunnel Collapse',
				icon: '💥',
				durationMs: 30000,
				effect: '-10% Tunnel production',
				color: 'text-rocket-red',
			});
		},
	},
	// 5. Viral Tweet
	{
		id: 'viral_tweet',
		title: 'Viral Tweet! 🐦',
		icon: '🐦',
		description: 'Your company tweeted something and it went mega-viral. Revenue is spiking!',
		color: '#44DDFF',
		timerMs: 0,
		choices: () => [],
		autoApply: () => {
			addBuff({
				id: 'viral_tweet',
				name: 'Viral Tweet',
				icon: '🐦',
				durationMs: 15000,
				effect: '3x all revenue',
				color: 'text-sky-cyan',
			});
		},
	},
	// 6. Regulatory Review
	{
		id: 'regulatory_review',
		title: 'Regulatory Review',
		icon: '📋',
		description: 'Government regulators are auditing one of your divisions. Pick which one takes the hit.',
		color: '#FF8844',
		timerMs: 15000,
		choices: () => {
			const divs = getUnlockedDivisions();
			return divs.slice(0, 3).map((divId) => ({
				label: `Slow ${DIVISION_NAMES[divId]}`,
				icon: '🐌',
				description: `${DIVISION_NAMES[divId]} runs at 50% speed for 45s.`,
				action: () => {
					addBuff({
						id: `regulatory_${divId}`,
						name: `${DIVISION_NAMES[divId]} Audit`,
						icon: '📋',
						durationMs: 45000,
						effect: `${DIVISION_NAMES[divId]} -50% speed`,
						color: 'text-tunnel-orange',
					});
				},
			}));
		},
	},
	// 7. Celebrity Endorsement
	{
		id: 'celebrity_endorsement',
		title: 'Celebrity Endorsement!',
		icon: '⭐',
		description: 'A major celebrity wants to endorse one of your divisions!',
		color: '#FFCC44',
		timerMs: 20000,
		choices: () => {
			const divs = getUnlockedDivisions();
			return divs.slice(0, 3).map((divId) => ({
				label: `Boost ${DIVISION_NAMES[divId]}`,
				icon: '🎯',
				description: `2x ${DIVISION_NAMES[divId]} revenue for 2 minutes.`,
				action: () => {
					addBuff({
						id: `celebrity_${divId}`,
						name: `${DIVISION_NAMES[divId]} Endorsed`,
						icon: '⭐',
						durationMs: 120000,
						effect: `2x ${DIVISION_NAMES[divId]} revenue`,
						color: 'text-solar-gold',
					});
				},
			}));
		},
	},
	// 8. Crypto Crash
	{
		id: 'crypto_crash',
		title: 'Crypto Market Crash',
		icon: '📉',
		description: 'Markets are in freefall! Quick, what do you do?',
		color: '#FF4444',
		timerMs: 15000,
		choices: () => [
			{
				label: 'Buy the Dip',
				icon: '💎',
				description: 'Spend 10% cash for a potential 2x return later.',
				action: () => {
					const cost = get(gameState).cash * 0.1;
					gameState.update((s) => ({ ...s, cash: s.cash - cost }));
					// Delayed payoff
					setTimeout(() => {
						gameState.update((s) => ({ ...s, cash: s.cash + cost * 2 }));
						// notification removed — too frequent
					}, 30000);
				},
			},
			{
				label: 'Play it Safe',
				icon: '🛡️',
				description: 'Do nothing and weather the storm.',
				action: () => {
					// No effect
				},
			},
		],
	},
	// 9. Power Surge
	{
		id: 'power_surge',
		title: 'Power Grid Surge!',
		icon: '⚡',
		description: 'A massive solar flare boosted your energy grid!',
		color: '#44FF88',
		timerMs: 0,
		condition: () => get(gameState).divisions.teslaenergy.unlocked,
		choices: () => [],
		autoApply: () => {
			addBuff({
				id: 'power_surge',
				name: 'Power Surge',
				icon: '⚡',
				durationMs: 45000,
				effect: '+100% power generation',
				color: 'text-bio-green',
			});
		},
	},
	// 10. Supply Chain Issues
	{
		id: 'supply_chain',
		title: 'Supply Chain Disruption',
		icon: '🚢',
		description: 'Global shipping delays are affecting production costs.',
		color: '#FF8844',
		timerMs: 0,
		choices: () => [],
		autoApply: () => {
			addBuff({
				id: 'supply_chain',
				name: 'Supply Chain Issues',
				icon: '🚢',
				durationMs: 40000,
				effect: '-20% all revenue',
				color: 'text-tunnel-orange',
			});
		},
	},
	// 11. Talent Acquisition
	{
		id: 'talent_acquisition',
		title: 'Top Talent Available!',
		icon: '🎓',
		description: 'A brilliant engineer is available. Where do you assign them?',
		color: '#44DDFF',
		timerMs: 20000,
		choices: () => {
			const divs = getUnlockedDivisions();
			return divs.slice(0, 3).map((divId) => ({
				label: `Assign to ${DIVISION_NAMES[divId]}`,
				icon: '👨‍🔬',
				description: `+30% ${DIVISION_NAMES[divId]} speed for 90s.`,
				action: () => {
					addBuff({
						id: `talent_${divId}`,
						name: `${DIVISION_NAMES[divId]} Talent`,
						icon: '🎓',
						durationMs: 90000,
						effect: `+30% ${DIVISION_NAMES[divId]} speed`,
						color: 'text-sky-cyan',
					});
				},
			}));
		},
	},
	// 12. Mars Discovery
	{
		id: 'mars_discovery',
		title: 'Mars Rover Discovery!',
		icon: '🔴',
		description: 'Your rover found something interesting on Mars. Investors are excited!',
		color: '#FF8844',
		timerMs: 0,
		choices: () => [],
		autoApply: () => {
			const bonus = Math.max(get(gameState).cash * 0.15, 10000);
			gameState.update((s) => ({ ...s, cash: s.cash + bonus }));
		},
	},
	// 13. Tax Break
	{
		id: 'tax_break',
		title: 'Corporate Tax Break',
		icon: '🏛️',
		description: 'New tax legislation benefits tech companies!',
		color: '#44FF88',
		timerMs: 0,
		choices: () => [],
		autoApply: () => {
			addBuff({
				id: 'tax_break',
				name: 'Tax Break',
				icon: '🏛️',
				durationMs: 90000,
				effect: '+25% all revenue',
				color: 'text-bio-green',
			});
		},
	},
	// 14. Sabotage Attempt
	{
		id: 'sabotage',
		title: 'Industrial Sabotage!',
		icon: '🕵️',
		description: 'A competitor tried to sabotage your operations!',
		color: '#FF4444',
		timerMs: 15000,
		choices: () => [
			{
				label: 'Beef Up Security',
				icon: '🔒',
				description: 'Spend cash but prevent all damage.',
				action: () => {
					const cost = Math.max(get(gameState).cash * 0.05, 1000);
					gameState.update((s) => ({ ...s, cash: s.cash - cost }));
				},
			},
			{
				label: 'Take the Hit',
				icon: '😤',
				description: 'Save money but lose some production temporarily.',
				action: () => {
					addBuff({
						id: 'sabotage_damage',
						name: 'Sabotage Damage',
						icon: '🕵️',
						durationMs: 30000,
						effect: '-15% all production',
						color: 'text-rocket-red',
					});
				},
			},
		],
	},
	// 15. Innovation Award
	{
		id: 'innovation_award',
		title: 'Innovation Award! 🏆',
		icon: '🏆',
		description: 'Your company won a prestigious innovation award!',
		color: '#FFCC44',
		timerMs: 0,
		choices: () => [],
		autoApply: () => {
			const rpBonus = Math.max(25, Math.floor(get(gameState).researchPoints * 0.15));
			const cashBonus = Math.max(get(gameState).cash * 0.05, 2000);
			gameState.update((s) => ({
				...s,
				cash: s.cash + cashBonus,
				researchPoints: s.researchPoints + rpBonus,
			}));
		},
	},
	// 16. CEO Goes on Podcast
	{
		id: 'podcast_appearance',
		title: 'CEO Podcast Appearance',
		icon: '🎙️',
		description: 'You went on a 3-hour podcast. The internet is buzzing.',
		color: '#9944FF',
		timerMs: 0,
		choices: () => [],
		autoApply: () => {
			addBuff({
				id: 'podcast_hype',
				name: 'Podcast Hype',
				icon: '🎙️',
				durationMs: 60000,
				effect: '2x all revenue',
				color: 'text-neural-purple',
			});
		},
	},
	// 17. Investor Confidence
	{
		id: 'investor_confidence',
		title: 'Investor Confidence Boost',
		icon: '📈',
		description: 'Wall Street analysts upgraded your stock!',
		color: '#44FF88',
		timerMs: 20000,
		choices: () => [
			{
				label: 'Cash Injection',
				icon: '💰',
				description: 'Get a large one-time cash boost.',
				action: () => {
					const bonus = Math.max(get(gameState).cash * 0.2, 15000);
					gameState.update((s) => ({ ...s, cash: s.cash + bonus }));
				},
			},
			{
				label: 'Long-term Growth',
				icon: '📊',
				description: '+10% all revenue for 3 minutes.',
				action: () => {
					addBuff({
						id: 'investor_growth',
						name: 'Investor Boost',
						icon: '📈',
						durationMs: 180000,
						effect: '+10% all revenue',
						color: 'text-bio-green',
					});
				},
			},
		],
	},
];

// ─── Event System State ─────────────────────────────────────────────────────

/** Time between events: 2-5 minutes (in ms) */
const MIN_INTERVAL_MS = 2 * 60 * 1000;
const MAX_INTERVAL_MS = 5 * 60 * 1000;

let accumulatedMs = 0;
let nextEventMs = randomInterval();
let recentEventIds: string[] = [];

function randomInterval(): number {
	return MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
}

function pickEvent(): EventDef | null {
	// Filter to eligible events (not recently fired, condition met)
	const eligible = EVENT_DEFS.filter((e) => {
		if (recentEventIds.includes(e.id)) return false;
		if (e.condition && !e.condition()) return false;
		return true;
	});
	if (eligible.length === 0) return null;
	return eligible[Math.floor(Math.random() * eligible.length)];
}

function fireEvent(def: EventDef): void {
	// Track recently fired
	recentEventIds.push(def.id);
	if (recentEventIds.length > 5) recentEventIds.shift();

	const choices = def.choices();

	if (choices.length === 0 && def.autoApply) {
		// Unavoidable event — apply immediately, show as notification
		def.autoApply();
		return;
	}

	// Wrap choice actions to also add notification
	const wrappedChoices = choices.map((c) => ({
		...c,
		action: () => {
			c.action();
			// notification removed — too frequent
		},
	}));

	// Show modal
	pendingEvent.set({
		id: def.id,
		title: def.title,
		icon: def.icon,
		description: def.description,
		choices: wrappedChoices,
		timerMs: def.timerMs,
		remainingMs: def.timerMs,
		color: def.color,
	});
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Tick the random event system. Call from the game loop.
 */
export function tickRandomEvents(deltaMs: number): void {
	// Also tick active buffs
	tickBuffs(deltaMs);

	// Tick pending event timer
	const current = get(pendingEvent);
	if (current && current.timerMs > 0) {
		const remaining = current.remainingMs - deltaMs;
		if (remaining <= 0) {
			// Auto-pick first choice on timeout
			if (current.choices.length > 0) {
				current.choices[0].action();
			}
			pendingEvent.set(null);
		} else {
			pendingEvent.update((e) => (e ? { ...e, remainingMs: remaining } : null));
		}
	}

	// Don't accumulate while a modal is showing
	if (current) return;

	accumulatedMs += deltaMs;
	if (accumulatedMs >= nextEventMs) {
		accumulatedMs = 0;
		nextEventMs = randomInterval();
		const event = pickEvent();
		if (event) fireEvent(event);
	}
}

/**
 * Get the revenue multiplier from active buffs.
 * Called by ProductionEngine to modify revenue.
 */
export function getBuffRevenueMultiplier(divisionId?: string): number {
	const buffs: ActiveBuff[] = get(activeBuffs);
	let mult = 1;

	for (const b of buffs) {
		switch (b.id) {
			case 'viral_tweet':
				mult *= 3;
				break;
			case 'podcast_hype':
				mult *= 2;
				break;
			case 'tax_break':
				mult *= 1.25;
				break;
			case 'investor_growth':
				mult *= 1.1;
				break;
			case 'supply_chain':
				mult *= 0.8;
				break;
			case 'sabotage_damage':
				mult *= 0.85;
				break;
			case 'solar_subsidy':
				if (divisionId === 'teslaenergy') mult *= 1.5;
				break;
		}

		// Free launches buff — 2x revenue for Rockets division
		if (b.id === 'free_launches' && divisionId === 'spacex') mult *= 2;

		// Division-specific celebrity/talent buffs
		if (divisionId) {
			if (b.id === `celebrity_${divisionId}`) mult *= 2;
			if (b.id === `regulatory_${divisionId}`) mult *= 0.5;
		}
	}

	return mult;
}

/**
 * Get speed multiplier for a division from active buffs.
 */
export function getBuffSpeedMultiplier(divisionId?: string): number {
	const buffs: ActiveBuff[] = get(activeBuffs);
	let mult = 1;

	for (const b of buffs) {
		if (b.id === 'ai_speed' && divisionId === 'ai') mult *= 2;
		if (b.id === 'tunnel_collapse' && divisionId === 'tunnels') mult *= 0.9;
		if (b.id === 'power_surge' && divisionId === 'teslaenergy') mult *= 2;
		if (divisionId && b.id === `talent_${divisionId}`) mult *= 1.3;
	}

	return mult;
}

/**
 * Wire up EventBus listeners for notifications.
 */
export function initRandomEventListeners(): () => void {
	const unsubs: (() => void)[] = [];

	// Only rare events get notifications: division unlocks and colony/prestige launches
	unsubs.push(
		eventBus.on('division:unlocked', (data) => {
			const name = DIVISION_NAMES[data.division] ?? data.division;
			addNotification('milestone', '🏢', `${name} Unlocked!`, 'A new division is ready for business.');
		})
	);

	unsubs.push(
		eventBus.on('prestige:complete', (data) => {
			addNotification('milestone', '🪐', 'Colony Launched!', `Earned ${data.visionEarned} Colony Tech.`);
		})
	);

	return () => unsubs.forEach((fn) => fn());
}

/**
 * Reset event system state (for prestige/hard reset).
 */
export function resetRandomEvents(): void {
	accumulatedMs = 0;
	nextEventMs = randomInterval();
	recentEventIds = [];
	pendingEvent.set(null);
}
