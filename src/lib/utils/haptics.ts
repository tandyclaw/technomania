import { get } from 'svelte/store';
import { gameState } from '$lib/stores/gameState';

function canVibrate(): boolean {
	return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

function vibrate(pattern: number | number[]) {
	if (!canVibrate()) return;
	const s = get(gameState);
	if (!s.settings.hapticEnabled) return;
	navigator.vibrate(pattern);
}

export function hapticTierPurchase() { vibrate(50); }
export function hapticProductionComplete() { vibrate([30, 50, 30]); }
export function hapticPrestige() { vibrate(200); }
export function hapticContractComplete() { vibrate([40, 60, 40, 60, 80]); }
export function hapticContractExpired() { vibrate([100, 50, 100]); }
