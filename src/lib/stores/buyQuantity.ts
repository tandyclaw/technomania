/**
 * buyQuantity.ts — Global buy quantity toggle (AdCap-style ×1/×10/×100/Max)
 * Persists in localStorage so it survives page reloads.
 */

import { writable } from 'svelte/store';

export type BuyQuantity = 1 | 10 | 100 | 'max';

const STORAGE_KEY = 'tech_tycoon_buy_qty';

function loadQuantity(): BuyQuantity {
	if (typeof window === 'undefined') return 1;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === '10') return 10;
		if (stored === '100') return 100;
		if (stored === 'max') return 'max';
	} catch {
		// ignore
	}
	return 1;
}

export const buyQuantity = writable<BuyQuantity>(loadQuantity());

// Persist changes to localStorage
buyQuantity.subscribe((qty) => {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, String(qty));
	} catch {
		// ignore
	}
});

/** Cycle to the next quantity mode */
export function cycleBuyQuantity(): void {
	buyQuantity.update((current) => {
		switch (current) {
			case 1: return 10;
			case 10: return 100;
			case 100: return 'max';
			case 'max': return 1;
			default: return 1;
		}
	});
}
