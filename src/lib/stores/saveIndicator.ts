/**
 * saveIndicator.ts — Reactive store for save status UI feedback
 */

import { writable } from 'svelte/store';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const saveStatus = writable<SaveStatus>('idle');

let resetTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Flash the save indicator — shows "saving" then "saved" then fades
 */
export function flashSaveIndicator(status: 'saved' | 'error' = 'saved'): void {
	if (resetTimer) clearTimeout(resetTimer);
	saveStatus.set(status);
	resetTimer = setTimeout(() => {
		saveStatus.set('idle');
	}, 2000);
}
