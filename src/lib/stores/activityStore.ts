/**
 * activityStore.ts — Activity feed for the dashboard (T066)
 * Stores last 20 events: purchases, unlocks, milestones, achievements
 */

import { writable } from 'svelte/store';
import { eventBus } from '$lib/engine/EventBus';
import { DIVISIONS } from '$lib/divisions';
import { formatCurrency } from '$lib/engine/BigNumber';
import { addFloatingText } from '$lib/stores/floatingTextStore';

export interface ActivityEntry {
	id: number;
	icon: string;
	description: string;
	timestamp: number;
}

const MAX_ENTRIES = 20;
let nextId = 0;

export const activityFeed = writable<ActivityEntry[]>([]);

function addEntry(icon: string, description: string) {
	const entry: ActivityEntry = {
		id: ++nextId,
		icon,
		description,
		timestamp: Date.now(),
	};
	activityFeed.update(list => {
		const next = [entry, ...list];
		return next.length > MAX_ENTRIES ? next.slice(0, MAX_ENTRIES) : next;
	});
}

function divName(id: string): string {
	return DIVISIONS[id]?.name ?? id;
}
function tierName(divId: string, tier: number): string {
	return DIVISIONS[divId]?.tiers[tier]?.name ?? `Tier ${tier + 1}`;
}

export function initActivityListeners(): () => void {
	const unsubs: (() => void)[] = [];

	unsubs.push(eventBus.on('production:complete', (d) => {
		addEntry('💰', `${tierName(d.division, d.tier)} produced ${formatCurrency(d.amount)}`);
		addFloatingText(`+${formatCurrency(d.amount)}`, d.division, d.tier);
	}));
	unsubs.push(eventBus.on('tier:unlocked', (d) => {
		addEntry('🔓', `${tierName(d.division, d.tier)} unlocked`);
	}));
	unsubs.push(eventBus.on('division:unlocked', (d) => {
		addEntry('🏢', `${divName(d.division)} division unlocked!`);
	}));
	unsubs.push(eventBus.on('chief:hired', (d) => {
		addEntry('👔', `${divName(d.division)} Chief ${d.level === 1 ? 'hired' : `upgraded to Lv.${d.level}`}`);
	}));
	unsubs.push(eventBus.on('research:complete', (d) => {
		addEntry('🔬', `Research complete: ${d.name}`);
	}));
	unsubs.push(eventBus.on('synergy:discovered', (d) => {
		addEntry('🔗', `Synergy: ${divName(d.source)} ↔ ${divName(d.target)}`);
	}));
	unsubs.push(eventBus.on('bottleneck:resolved', (d) => {
		addEntry('✅', `Bottleneck resolved: ${d.type} (${divName(d.division)})`);
	}));
	unsubs.push(eventBus.on('achievement:unlocked', (d) => {
		addEntry('🏆', `Achievement: ${d.name}`);
	}));
	unsubs.push(eventBus.on('prestige:complete', (d) => {
		addEntry('🚀', `IPO complete! Earned ${d.visionEarned} Vision`);
	}));

	return () => { for (const u of unsubs) u(); };
}
