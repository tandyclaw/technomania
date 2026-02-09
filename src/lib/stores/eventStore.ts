/**
 * eventStore.ts — Stores for random events, active buffs, and notification center
 */

import { writable, derived, get } from 'svelte/store';

// ─── Buff System ─────────────────────────────────────────────────────────────

export interface ActiveBuff {
	id: string;
	name: string;
	icon: string;
	/** Remaining duration in ms */
	remainingMs: number;
	/** Total duration for progress display */
	totalMs: number;
	/** Effect descriptor for tooltip */
	effect: string;
	/** Color class */
	color: string;
}

export const activeBuffs = writable<ActiveBuff[]>([]);

export function addBuff(buff: Omit<ActiveBuff, 'remainingMs'> & { durationMs: number }): void {
	activeBuffs.update((list) => {
		// Replace existing buff with same id
		const filtered = list.filter((b) => b.id !== buff.id);
		return [
			...filtered,
			{
				id: buff.id,
				name: buff.name,
				icon: buff.icon,
				remainingMs: buff.durationMs,
				totalMs: buff.durationMs,
				effect: buff.effect,
				color: buff.color,
			},
		];
	});
}

export function tickBuffs(deltaMs: number): void {
	activeBuffs.update((list) => {
		const updated = list
			.map((b) => ({ ...b, remainingMs: b.remainingMs - deltaMs }))
			.filter((b) => b.remainingMs > 0);
		return updated;
	});
}

export function getActiveBuff(id: string): ActiveBuff | undefined {
	return get(activeBuffs).find((b) => b.id === id);
}

export function hasActiveBuff(id: string): boolean {
	return get(activeBuffs).some((b) => b.id === id);
}

// ─── Pending Event (modal) ──────────────────────────────────────────────────

export interface EventChoice {
	label: string;
	icon: string;
	description: string;
	action: () => void;
}

export interface PendingEvent {
	id: string;
	title: string;
	icon: string;
	description: string;
	choices: EventChoice[];
	/** Auto-dismiss timer in ms, 0 = no auto-dismiss */
	timerMs: number;
	remainingMs: number;
	color: string;
}

export const pendingEvent = writable<PendingEvent | null>(null);

export function dismissEvent(): void {
	pendingEvent.set(null);
}

// ─── Notification Center ────────────────────────────────────────────────────

export type NotificationType = 'event' | 'achievement' | 'milestone' | 'info';

export interface Notification {
	id: number;
	type: NotificationType;
	icon: string;
	title: string;
	message: string;
	timestamp: number;
	read: boolean;
}

let notifId = 0;
const MAX_NOTIFICATIONS = 50;

export const notifications = writable<Notification[]>([]);
export const unreadCount = derived(notifications, ($n) => $n.filter((n) => !n.read).length);

export function addNotification(type: NotificationType, icon: string, title: string, message: string): void {
	notifications.update((list) => {
		const next = [
			{
				id: ++notifId,
				type,
				icon,
				title,
				message,
				timestamp: Date.now(),
				read: false,
			},
			...list,
		];
		if (next.length > MAX_NOTIFICATIONS) return next.slice(0, MAX_NOTIFICATIONS);
		return next;
	});
}

export function markAllRead(): void {
	notifications.update((list) => list.map((n) => ({ ...n, read: true })));
}

export function clearNotifications(): void {
	notifications.set([]);
}
