/**
 * floatingTextStore.ts — Floating "+$X" text on production complete (T070)
 */

import { writable } from 'svelte/store';

export interface FloatingText {
	id: number;
	text: string;
	divisionId: string;
	tierIndex: number;
}

let nextId = 0;

export const floatingTexts = writable<FloatingText[]>([]);

export function addFloatingText(text: string, divisionId: string, tierIndex: number) {
	const id = ++nextId;
	const entry: FloatingText = { id, text, divisionId, tierIndex };
	floatingTexts.update(list => [...list, entry]);
	// Remove after animation completes
	setTimeout(() => {
		floatingTexts.update(list => list.filter(f => f.id !== id));
	}, 1200);
}
