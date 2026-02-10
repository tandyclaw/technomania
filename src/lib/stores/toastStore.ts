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
