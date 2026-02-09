/**
 * tutorialStore.ts — Tutorial system state management
 *
 * Tracks which step the new player is on and persists completion.
 * Steps:
 *   0 = "Tap Nuclear Reactor to start production" (highlight tier card)
 *   1 = "Great! Watch the progress bar fill up"
 *   2 = "You earned cash! Buy more reactors to earn faster"
 *   3 = "Hire a Chief to automate production"
 *   4 = "Unlock new divisions as you grow"
 *   5 = "Check Research for permanent upgrades"
 *   6 = complete (done)
 */

import { writable, get } from 'svelte/store';
import { gameState } from './gameState';
import { eventBus } from '$lib/engine/EventBus';

export const TUTORIAL_STEPS = [
	{
		id: 'tap-reactor',
		title: 'Start Producing',
		message: 'Tap the Nuclear Reactor to start a production cycle!',
		target: 'tier-card-0',
		position: 'above' as const,
		hint: '👆 Tap the reactor',
		autoAdvance: true,
	},
	{
		id: 'watch-progress',
		title: 'Great!',
		message: 'Watch the progress bar fill up — cash incoming!',
		target: 'tier-card-0',
		position: 'above' as const,
		hint: '⏳ Waiting for payout...',
		autoAdvance: true,
	},
	{
		id: 'buy-more',
		title: 'Nice! 💰',
		message: 'Buy more reactors to earn faster.',
		target: 'tier-buy-0',
		position: 'above' as const,
		hint: '👆 Tap Build',
		autoAdvance: true,
	},
	{
		id: 'hire-chief',
		title: 'Automate It',
		message: 'Hire a Chief to run production automatically — even while you\'re away!',
		target: 'chief-card',
		position: 'below' as const,
		hint: null,
		autoAdvance: false,
	},
	{
		id: 'unlock-divisions',
		title: 'Expand',
		message: 'Unlock new divisions — Rockets, Manufacturing, AI & more — as you grow!',
		target: null,
		position: 'center' as const,
		hint: null,
		autoAdvance: false,
	},
	{
		id: 'check-research',
		title: 'Research',
		message: 'Check the Research tab for permanent upgrades. Go build! 🚀',
		target: 'tab-research',
		position: 'above' as const,
		hint: null,
		autoAdvance: false,
	},
] as const;

export const TOTAL_STEPS = TUTORIAL_STEPS.length;

export interface TutorialState {
	active: boolean;
	step: number;
	completed: boolean;
}

function createTutorialStore() {
	const { subscribe, set, update } = writable<TutorialState>({
		active: false,
		step: 0,
		completed: false,
	});

	return {
		subscribe,

		/** Start tutorial for new players (totalTaps === 0 and no units owned) */
		tryStart() {
			const state = get(gameState);
			const isNew =
				state.stats.totalTaps === 0 &&
				state.divisions.teslaenergy.tiers.every((t) => t.count === 0);

			// Check localStorage for previous completion
			try {
				if (localStorage.getItem('tech_tycoon_tutorial_done') === '1') {
					set({ active: false, step: 0, completed: true });
					return;
				}
			} catch {
				// Storage unavailable — proceed
			}

			if (isNew) {
				set({ active: true, step: 0, completed: false });
			} else {
				set({ active: false, step: 0, completed: true });
			}
		},

		/** Advance to the next step */
		nextStep() {
			update((s) => {
				if (!s.active) return s;
				const next = s.step + 1;
				if (next >= TOTAL_STEPS) {
					try {
						localStorage.setItem('tech_tycoon_tutorial_done', '1');
					} catch { /* ignore */ }
					return { active: false, step: TOTAL_STEPS, completed: true };
				}
				return { ...s, step: next };
			});
		},

		/** Skip / dismiss the entire tutorial */
		skip() {
			update(() => {
				try {
					localStorage.setItem('tech_tycoon_tutorial_done', '1');
				} catch {
					// ignore
				}
				return { active: false, step: TOTAL_STEPS, completed: true };
			});
		},

		/** Restart the tutorial from scratch */
		restart() {
			try {
				localStorage.removeItem('tech_tycoon_tutorial_done');
			} catch { /* ignore */ }
			set({ active: true, step: 0, completed: false });
		},

		/** Complete the tutorial (final step dismissed) */
		complete() {
			try {
				localStorage.setItem('tech_tycoon_tutorial_done', '1');
			} catch {
				// ignore
			}
			set({ active: false, step: TOTAL_STEPS, completed: true });
		},

		/** Force-set a specific step (for auto-advance triggers) */
		goToStep(step: number) {
			update((s) => {
				if (!s.active) return s;
				if (step >= TOTAL_STEPS) {
					return { active: false, step: TOTAL_STEPS, completed: true };
				}
				return { ...s, step };
			});
		},
	};
}

export const tutorialStore = createTutorialStore();

/**
 * Set up EventBus listeners to auto-advance tutorial steps.
 * Returns cleanup function.
 */
export function initTutorialListeners(): () => void {
	const cleanups: (() => void)[] = [];

	// Step 0 → 1: Player taps to start production
	cleanups.push(
		eventBus.on('production:started', (data) => {
			const ts = get(tutorialStore);
			if (!ts.active) return;
			if (data.division === 'teslaenergy' && data.tier === 0 && ts.step === 0) {
				tutorialStore.nextStep(); // → step 1 (watch progress)
			}
		})
	);

	// Step 1 → 2: Production completes
	cleanups.push(
		eventBus.on('production:complete', (data) => {
			const ts = get(tutorialStore);
			if (!ts.active) return;
			if (data.division === 'teslaenergy' && data.tier === 0 && ts.step === 1) {
				tutorialStore.nextStep(); // → step 2 (buy more)
			}
		})
	);

	// Step 2 → 3: Player buys more reactors
	cleanups.push(
		eventBus.on('upgrade:purchased', (data) => {
			const ts = get(tutorialStore);
			if (!ts.active) return;
			if (data.division === 'teslaenergy' && data.tier === 0 && ts.step === 2) {
				tutorialStore.nextStep(); // → step 3 (hire chief)
			}
		})
	);

	// Step 3 → 4: Player hires chief
	cleanups.push(
		eventBus.on('chief:hired', (data) => {
			const ts = get(tutorialStore);
			if (!ts.active) return;
			if (data.division === 'teslaenergy' && ts.step === 3) {
				tutorialStore.nextStep(); // → step 4 (unlock divisions)
			}
		})
	);

	return () => {
		for (const cleanup of cleanups) cleanup();
	};
}
