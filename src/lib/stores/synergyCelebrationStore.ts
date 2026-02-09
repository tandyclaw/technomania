/**
 * synergyCelebrationStore.ts — Manages the "SYNERGY DISCOVERED!" celebration modal
 *
 * Tracks which synergies have been celebrated so we only show the modal once per synergy.
 * Persisted via localStorage so celebrations don't repeat across sessions.
 */

import { writable, get } from 'svelte/store';
import type { Synergy } from '$lib/systems/SynergySystem';

const STORAGE_KEY = 'being_elon_celebrated_synergies';

interface CelebrationState {
	/** The synergy currently being celebrated (null = no modal shown) */
	activeSynergy: Synergy | null;
	/** Queue of synergies to celebrate (in case multiple activate at once) */
	queue: Synergy[];
}

export const celebrationState = writable<CelebrationState>({
	activeSynergy: null,
	queue: [],
});

/**
 * Get the set of already-celebrated synergy IDs from localStorage.
 */
function getCelebratedIds(): Set<string> {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			return new Set(JSON.parse(raw));
		}
	} catch {
		// ignore
	}
	return new Set();
}

/**
 * Mark a synergy as celebrated in localStorage.
 */
function markCelebrated(synergyId: string): void {
	try {
		const ids = getCelebratedIds();
		ids.add(synergyId);
		localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
	} catch {
		// ignore
	}
}

/**
 * Queue a synergy for celebration if it hasn't been celebrated before.
 * Returns true if it was queued.
 */
export function queueSynergyCelebration(synergy: Synergy): boolean {
	const celebrated = getCelebratedIds();
	if (celebrated.has(synergy.id)) return false;

	celebrationState.update((state) => {
		// Don't double-queue
		if (state.activeSynergy?.id === synergy.id) return state;
		if (state.queue.some((s) => s.id === synergy.id)) return state;

		if (!state.activeSynergy) {
			// Show immediately
			return { ...state, activeSynergy: synergy };
		} else {
			// Queue for later
			return { ...state, queue: [...state.queue, synergy] };
		}
	});

	return true;
}

/**
 * Dismiss the current celebration. If there's a queue, show the next one.
 */
export function dismissCelebration(): void {
	const state = get(celebrationState);
	if (state.activeSynergy) {
		markCelebrated(state.activeSynergy.id);
	}

	celebrationState.update((s) => {
		const next = s.queue.length > 0 ? s.queue[0] : null;
		const remainingQueue = s.queue.slice(1);
		return { activeSynergy: next, queue: remainingQueue };
	});
}

/**
 * Reset celebration tracking (e.g., on prestige/hard reset).
 */
export function resetCelebrations(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
	celebrationState.set({ activeSynergy: null, queue: [] });
}
