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
const MAX_VISIBLE = 3;

/** Auto-incrementing ID */
let nextId = 0;

/** Track setTimeout handles so we can cancel on manual dismiss */
const timerMap = new Map<number, ReturnType<typeof setTimeout>>();

/** The reactive store */
export const toasts = writable<Toast[]>([]);

/**
 * Push a new toast. Oldest toasts are evicted if at max capacity.
 * Deduplicates by title — if a toast with the same title exists, skip.
 */
export function addToast(
	type: ToastType,
	icon: string,
	title: string,
	message: string,
	opts?: { color?: string; durationMs?: number }
): void {
	// Deduplicate: skip if a toast with the same title is already visible
	const current = get(toasts);
	if (current.some((t) => t.title === title)) return;

	const toast: Toast = {
		id: ++nextId,
		type,
		icon,
		title,
		message,
		color: opts?.color,
		durationMs: opts?.durationMs ?? 4500,
		createdAt: Date.now(),
	};

	toasts.update((list) => {
		const next = [...list, toast];
		// Evict oldest if over capacity — also clean up their timers
		if (next.length > MAX_VISIBLE) {
			const evicted = next.slice(0, next.length - MAX_VISIBLE);
			for (const e of evicted) {
				const h = timerMap.get(e.id);
				if (h != null) { clearTimeout(h); timerMap.delete(e.id); }
			}
			return next.slice(next.length - MAX_VISIBLE);
		}
		return next;
	});

	// Auto-dismiss after duration
	const handle = setTimeout(() => {
		timerMap.delete(toast.id);
		dismissToast(toast.id);
	}, toast.durationMs);
	timerMap.set(toast.id, handle);
}

/**
 * Remove a toast by id, cancelling its auto-dismiss timer.
 */
export function dismissToast(id: number): void {
	const handle = timerMap.get(id);
	if (handle != null) { clearTimeout(handle); timerMap.delete(id); }
	toasts.update((list) => list.filter((t) => t.id !== id));
}

/**
 * Clear all toasts and cancel all timers.
 */
export function clearToasts(): void {
	for (const h of timerMap.values()) clearTimeout(h);
	timerMap.clear();
	toasts.set([]);
}

// ─── EventBus Listeners ─────────────────────────────────────────────────────

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

	// NOTE: No toast for regular production:complete — too spammy
	// Cash flow is shown in the resource bar and tier cards instead

	// Chief hired — only first hire (automation unlocked), skip upgrades
	unsubs.push(
		eventBus.on('chief:hired', (data) => {
			if (data.level === 1) {
				const divName = getDivisionName(data.division);
				const color = getDivisionColor(data.division);
				addToast('success', '👔', `${divName} Chief Hired!`, 'Production is now automated.', { color, durationMs: 4000 });
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

	// Synergy discovered — removed (too frequent)

	// Bottleneck hit
	unsubs.push(
		eventBus.on('bottleneck:hit', (data) => {
			const color = getDivisionColor(data.division);
			addToast('warning', '⚠️', 'Bottleneck!', `${getDivisionName(data.division)}: ${data.description}`, { color, durationMs: 5000 });
		})
	);

	// Tier unlocked — removed (too frequent, shown in news ticker instead)

	// Division unlocked
	unsubs.push(
		eventBus.on('division:unlocked', (data) => {
			const divName = getDivisionName(data.division);
			const color = getDivisionColor(data.division);
			addToast('achievement', '🏢', `${divName} Unlocked!`, 'A new division is ready for business.', { color, durationMs: 5000 });
		})
	);

	// Bottleneck resolved — removed (routine, shown in news ticker instead)

	// Prestige complete
	unsubs.push(
		eventBus.on('prestige:complete', (data) => {
			addToast('achievement', '🪐', 'Colony Launched!', `Earned ${data.visionEarned} Colony Tech. Total: ${data.totalVision}`, { color: '#FFCC44', durationMs: 6000 });
		})
	);

	return () => {
		for (const unsub of unsubs) unsub();
	};
}
