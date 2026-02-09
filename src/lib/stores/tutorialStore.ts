/**
 * tutorialStore.ts — Tutorial system state management
 *
 * Tracks which step the new player is on and persists completion.
 * Steps:
 *   0 = welcome message
 *   1 = point to Energy tab
 *   2 = buy first Solar Panel
 *   3 = tap to start production
 *   4 = explain progress bar & payout
 *   5 = buy more units
 *   6 = mention Chief hire mechanic
 *   7 = other divisions locked until earn enough
 *   8 = complete (done)
 */

import { writable, get } from 'svelte/store';
import { gameState } from './gameState';
import { eventBus } from '$lib/engine/EventBus';

export const TUTORIAL_STEPS = [
	{
		id: 'welcome',
		title: 'Welcome, Visionary',
		message:
			"Build an empire from solar panels to Mars rockets. The goal: make humanity multiplanetary. Let's get started.",
		target: null, // no highlight, centered modal
		position: 'center' as const,
	},
	{
		id: 'go-to-energy',
		title: 'Start Here',
		message: 'Tap the Energy tab below. Sustainable energy is the foundation — you need power for everything.',
		target: 'tab-teslaenergy',
		position: 'above' as const,
	},
	{
		id: 'buy-solar-panel',
		title: 'Build Your First Solar Panel',
		message: "Tap the Build button to buy your first Solar Panel. You've got $50 — it only costs $4.",
		target: 'tier-buy-0',
		position: 'above' as const,
	},
	{
		id: 'tap-to-produce',
		title: 'Tap to Produce',
		message: 'Now tap the Solar Panel card to start a production cycle. Energy in, cash out!',
		target: 'tier-card-0',
		position: 'above' as const,
	},
	{
		id: 'explain-progress',
		title: 'Watch It Fill',
		message:
			"See the progress bar? When it fills up, you earn cash. The more panels you own, the bigger the payout.",
		target: 'tier-card-0',
		position: 'above' as const,
	},
	{
		id: 'buy-more',
		title: 'Scale Up',
		message: 'Buy more Nuclear Reactors to increase your revenue. More units = more cash per cycle.',
		target: 'tier-buy-0',
		position: 'above' as const,
	},
	{
		id: 'chief-hint',
		title: 'Hire a Chief',
		message:
			"See the Chief card above? Hire a Division Chief to automate production — no more tapping! They'll run things while you're away.",
		target: 'chief-card',
		position: 'below' as const,
	},
	{
		id: 'locked-divisions',
		title: 'Expand Your Empire',
		message:
			'Rockets and Manufacturing are locked for now. Earn more cash to unlock them. Each division has unique tiers, chiefs, and synergies. Go build!',
		target: null,
		position: 'center' as const,
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

	// When player navigates to teslaenergy tab: step 1 → 2
	// (handled by DivisionTabBar via tutorialStore.nextStep)

	// When player buys first solar panel (upgrade:purchased on teslaenergy tier 0): step 2 → 3
	cleanups.push(
		eventBus.on('upgrade:purchased', (data) => {
			const ts = get(tutorialStore);
			if (!ts.active) return;
			if (data.division === 'teslaenergy' && data.tier === 0 && ts.step === 2) {
				tutorialStore.nextStep(); // → step 3 (tap to produce)
			}
			// Step 5 → 6: buy more units
			if (data.division === 'teslaenergy' && data.tier === 0 && ts.step === 5) {
				tutorialStore.nextStep(); // → step 6 (chief hint)
			}
		})
	);

	// When player taps to start production: step 3 → 4
	cleanups.push(
		eventBus.on('production:started', (data) => {
			const ts = get(tutorialStore);
			if (!ts.active) return;
			if (data.division === 'teslaenergy' && data.tier === 0 && ts.step === 3) {
				tutorialStore.nextStep(); // → step 4 (explain progress)
			}
		})
	);

	// When production completes: step 4 → 5
	cleanups.push(
		eventBus.on('production:complete', (data) => {
			const ts = get(tutorialStore);
			if (!ts.active) return;
			if (data.division === 'teslaenergy' && data.tier === 0 && ts.step === 4) {
				tutorialStore.nextStep(); // → step 5 (buy more)
			}
		})
	);

	return () => {
		for (const cleanup of cleanups) cleanup();
	};
}
