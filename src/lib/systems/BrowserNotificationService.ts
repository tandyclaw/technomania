/**
 * BrowserNotificationService.ts — Browser Notification API integration
 * Sends notifications when tab is backgrounded for idle income, contract completion, achievements.
 * Rate-limited to max 1 notification per 5 minutes. Respects user toggle in localStorage.
 */

import { get } from 'svelte/store';
import { gameState } from '$lib/stores/gameState';
import { eventBus } from '$lib/engine/EventBus';
import { formatCurrency } from '$lib/engine/BigNumber';
import { getDivisionTrueIncomePerSec } from '$lib/engine/ProductionEngine';

const STORAGE_KEY = 'tech-tycoon-browser-notifications';
const MIN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const IDLE_NOTIFY_DELAY_MS = 3 * 60 * 1000; // 3 minutes after tab hidden

let lastNotificationTime = 0;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let tabHidden = false;
let cleanups: (() => void)[] = [];

/** Check if browser notifications are enabled by user preference */
export function isBrowserNotificationsEnabled(): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem(STORAGE_KEY) === 'true';
}

/** Set browser notification preference */
export function setBrowserNotificationsEnabled(enabled: boolean): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, String(enabled));
	if (enabled) {
		requestPermissionIfNeeded();
		startListening();
	} else {
		stopListening();
		clearIdleTimer();
	}
}

/** Request Notification permission if not already granted */
export async function requestPermissionIfNeeded(): Promise<boolean> {
	if (typeof window === 'undefined' || !('Notification' in window)) return false;
	if (Notification.permission === 'granted') return true;
	if (Notification.permission === 'denied') return false;
	const result = await Notification.requestPermission();
	return result === 'granted';
}

/** Can we actually send notifications? */
function canNotify(): boolean {
	if (typeof window === 'undefined' || !('Notification' in window)) return false;
	if (Notification.permission !== 'granted') return false;
	if (!isBrowserNotificationsEnabled()) return false;
	return true;
}

/** Rate-limited notification sender */
function sendNotification(title: string, body: string, icon?: string): void {
	if (!canNotify()) return;
	const now = Date.now();
	if (now - lastNotificationTime < MIN_INTERVAL_MS) return;
	lastNotificationTime = now;
	try {
		new Notification(title, { body, icon: icon ?? '/favicon.png', tag: 'moonshot-idle' });
	} catch {
		// Silent fail — some browsers block in certain contexts
	}
}

/** Calculate current income/sec from game state */
function calculateIncomePerSec(): number {
	const state = get(gameState);
	let total = 0;
	for (const divId of ['teslaenergy', 'tesla', 'spacex', 'ai', 'robotics'] as const) {
		total += getDivisionTrueIncomePerSec(state, divId);
	}
	return total;
}

function clearIdleTimer(): void {
	if (idleTimer !== null) {
		clearTimeout(idleTimer);
		idleTimer = null;
	}
}

function onVisibilityChange(): void {
	if (document.hidden) {
		tabHidden = true;
		clearIdleTimer();
		if (canNotify()) {
			idleTimer = setTimeout(() => {
				if (!document.hidden && !tabHidden) return;
				const income = calculateIncomePerSec();
				if (income > 0) {
					const earned = income * (IDLE_NOTIFY_DELAY_MS / 1000);
					sendNotification(
						'🚀 Moonshot',
						`Your divisions are producing! Come collect ${formatCurrency(earned)}+`
					);
				}
			}, IDLE_NOTIFY_DELAY_MS);
		}
	} else {
		tabHidden = false;
		clearIdleTimer();
	}
}

function onContractCompleted(data: { id: string; reward?: number }): void {
	if (!tabHidden) return;
	const rewardText = data.reward ? ` Reward: ${formatCurrency(data.reward)}` : '';
	sendNotification('📋 Contract Complete!', `A contract has been fulfilled!${rewardText}`);
}

function onAchievementUnlocked(data: { id: string; name: string; description: string }): void {
	if (!tabHidden) return;
	sendNotification('🏆 Achievement Unlocked!', `${data.name} — ${data.description}`);
}

/** Start listening to events and visibility changes */
function startListening(): void {
	// Avoid double-registering
	stopListening();

	if (typeof document === 'undefined') return;

	document.addEventListener('visibilitychange', onVisibilityChange);
	const unsub1 = eventBus.on('contract:completed', onContractCompleted);
	const unsub2 = eventBus.on('achievement:unlocked', onAchievementUnlocked);

	cleanups = [
		() => document.removeEventListener('visibilitychange', onVisibilityChange),
		unsub1,
		unsub2,
	];
}

/** Stop all listeners */
function stopListening(): void {
	clearIdleTimer();
	for (const fn of cleanups) fn();
	cleanups = [];
}

/** Initialize on app start — call from layout */
export function initBrowserNotifications(): () => void {
	if (isBrowserNotificationsEnabled()) {
		startListening();
	}
	return () => stopListening();
}
