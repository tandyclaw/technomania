/**
 * toastStore.ts — Reactive toast notification state
 * Manages a queue of toast messages displayed to the player.
 * Listens to EventBus events and creates toasts for key game moments.
 */

import { writable, get } from 'svelte/store';
import { eventBus } from '$lib/engine/EventBus';
import { formatCurrency } from '$lib/engine/BigNumber';
import { DIVISIONS } from '$lib/divisions';

export type ToastType = 'success' | 'info' | 'warning' | 'achievement' | 'synergy';

export interface Toast {
	id: number;
	type: ToastType;
	icon: string;
	title: string;
	message: string;
	color?: string;
	durationMs: number;
	createdAt: number;
}

/** Max toasts visible at once */
const MAX_VISIBLE = 4;

/** Auto-incrementing ID */
let nextId = 0;

/** The reactive store */
export const toasts = writable<Toast[]>([]);

/**
 * Push a new toast. Oldest toasts are evicted if at max capacity.
 */
export function addToast(
	type: ToastType,
	icon: string,
	title: string,
	message: string,
	opts?: { color?: string; durationMs?: number }
): void {
	const toast: Toast = {
		id: ++nextId,
		type,
		icon,
		title,
		message,
		color: opts?.color,
		durationMs: opts?.durationMs ?? 3000,
		createdAt: Date.now(),
	};

	toasts.update((list) => {
		const next = [...list, toast];
		// Evict oldest if over capacity
		if (next.length > MAX_VISIBLE) {
			return next.slice(next.length - MAX_VISIBLE);
		}
		return next;
	});

	// Auto-dismiss after duration
	setTimeout(() => {
		dismissToast(toast.id);
	}, toast.durationMs);
}

/**
 * Remove a toast by id
 */
export function dismissToast(id: number): void {
	toasts.update((list) => list.filter((t) => t.id !== id));
}

/**
 * Clear all toasts
 */
export function clearToasts(): void {
	toasts.set([]);
}

// ─── EventBus Listeners ─────────────────────────────────────────────────────

/** Throttle: don't spam production toasts — batch them */
let productionBatch: { division: string; tier: number; amount: number }[] = [];
let productionBatchTimer: ReturnType<typeof setTimeout> | null = null;
const PRODUCTION_BATCH_MS = 800;

function getDivisionName(divId: string): string {
	return DIVISIONS[divId]?.name ?? divId;
}

function getDivisionColor(divId: string): string {
	return DIVISIONS[divId]?.color ?? '#4488FF';
}

function getTierName(divId: string, tierIndex: number): string {
	return DIVISIONS[divId]?.tiers[tierIndex]?.name ?? `Tier ${tierIndex + 1}`;
}

/**
 * Wire up EventBus → toasts. Call once at app startup.
 */
export function initToastListeners(): () => void {
	const unsubs: (() => void)[] = [];

	// Production complete — batched to avoid spam
	unsubs.push(
		eventBus.on('production:complete', (data) => {
			productionBatch.push(data);
			if (!productionBatchTimer) {
				productionBatchTimer = setTimeout(() => {
					flushProductionBatch();
					productionBatchTimer = null;
				}, PRODUCTION_BATCH_MS);
			}
		})
	);

	// Chief hired
	unsubs.push(
		eventBus.on('chief:hired', (data) => {
			const divName = getDivisionName(data.division);
			const color = getDivisionColor(data.division);
			if (data.level === 1) {
				addToast('success', '👔', `${divName} Chief Hired!`, 'Production is now automated.', { color, durationMs: 4000 });
			} else {
				addToast('info', '⬆️', `Chief Upgraded`, `${divName} chief is now Lv.${data.level}`, { color });
			}
		})
	);

	// Power shortage
	unsubs.push(
		eventBus.on('power:shortage', (data) => {
			addToast('warning', '⚡', 'Power Shortage!', `Need ${data.needed.toFixed(1)} MW, only ${data.available.toFixed(1)} MW available.`, { color: '#FF8844', durationMs: 5000 });
		})
	);

	// Achievement unlocked
	unsubs.push(
		eventBus.on('achievement:unlocked', (data) => {
			addToast('achievement', '🏆', data.name, data.description, { color: '#FFCC44', durationMs: 5000 });
		})
	);

	// Synergy discovered
	unsubs.push(
		eventBus.on('synergy:discovered', (data) => {
			addToast('synergy', '🔗', 'Synergy Discovered!', `${getDivisionName(data.source)} ↔ ${getDivisionName(data.target)}: ${data.bonus}`, { color: '#9944FF', durationMs: 5000 });
		})
	);

	// Bottleneck hit
	unsubs.push(
		eventBus.on('bottleneck:hit', (data) => {
			const color = getDivisionColor(data.division);
			addToast('warning', '⚠️', 'Bottleneck!', `${getDivisionName(data.division)}: ${data.description}`, { color, durationMs: 5000 });
		})
	);

	// Tier unlocked
	unsubs.push(
		eventBus.on('tier:unlocked', (data) => {
			const divName = getDivisionName(data.division);
			const tierName = getTierName(data.division, data.tier);
			const color = getDivisionColor(data.division);
			addToast('success', '🔓', `${tierName} Unlocked!`, `New ${divName} tier available.`, { color, durationMs: 4000 });
		})
	);

	// Division unlocked
	unsubs.push(
		eventBus.on('division:unlocked', (data) => {
			const divName = getDivisionName(data.division);
			const color = getDivisionColor(data.division);
			addToast('achievement', '🏢', `${divName} Unlocked!`, 'A new division is ready for business.', { color, durationMs: 5000 });
		})
	);

	// Bottleneck resolved
	unsubs.push(
		eventBus.on('bottleneck:resolved', (data) => {
			const color = getDivisionColor(data.division);
			addToast('success', '✅', 'Bottleneck Resolved', `${getDivisionName(data.division)}: ${data.type} cleared!`, { color, durationMs: 4000 });
		})
	);

	// Prestige complete
	unsubs.push(
		eventBus.on('prestige:complete', (data) => {
			addToast('achievement', '🚀', 'IPO Complete!', `Earned ${data.visionEarned} Founder\'s Vision. Total: ${data.totalVision}`, { color: '#FFCC44', durationMs: 6000 });
		})
	);

	return () => {
		for (const unsub of unsubs) unsub();
		if (productionBatchTimer) {
			clearTimeout(productionBatchTimer);
			productionBatchTimer = null;
		}
		productionBatch = [];
	};
}

/**
 * Flush batched production events into a single (or grouped) toast
 */
function flushProductionBatch(): void {
	if (productionBatch.length === 0) return;

	// Group by division
	const byDivision = new Map<string, { totalAmount: number; tiers: Set<number> }>();
	for (const event of productionBatch) {
		const existing = byDivision.get(event.division);
		if (existing) {
			existing.totalAmount += event.amount;
			existing.tiers.add(event.tier);
		} else {
			byDivision.set(event.division, { totalAmount: event.amount, tiers: new Set([event.tier]) });
		}
	}

	// Only show toasts for larger payouts (avoid spamming tiny Solar Panel revenue)
	for (const [divId, group] of byDivision) {
		// Skip if total payout is very small (less than $10)
		if (group.totalAmount < 10) continue;

		const divName = getDivisionName(divId);
		const color = getDivisionColor(divId);
		const tierCount = group.tiers.size;
		const tierLabel = tierCount === 1
			? getTierName(divId, [...group.tiers][0])
			: `${tierCount} tiers`;

		addToast('success', '💰', `${divName}`, `${tierLabel} earned ${formatCurrency(group.totalAmount)}`, {
			color,
			durationMs: 2500,
		});
	}

	productionBatch = [];
}
