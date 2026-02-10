/**
 * MiniGameSystem.ts — Mini-game triggers and state management
 *
 * Three mini-games:
 * 1. Launch Window (tap rapidly)
 * 2. Power Surge (hold & release at 100%)
 * 3. Hack the Mainframe (quick-type code sequence)
 *
 * Wired into EventBus for game event triggers.
 */

import { writable, get } from 'svelte/store';
// eventBus no longer needed — mini-games are purely timer-based
import { addBuff } from '$lib/stores/eventStore';
import { triggerParticle } from '$lib/stores/particleStore';

// ─── Types ───────────────────────────────────────────────────────────────────

export type MiniGameType = 'launch-window' | 'power-surge' | 'hack-mainframe';

export interface MiniGameConfig {
	type: MiniGameType;
	title: string;
	subtitle: string;
	icon: string;
	/** Duration of the challenge in ms */
	durationMs: number;
}

export interface MiniGameState {
	active: boolean;
	game: MiniGameConfig | null;
	/** 0-1 progress toward goal */
	progress: number;
	/** Time remaining in ms */
	remainingMs: number;
	/** Type-specific data */
	tapCount: number;
	chargeLevel: number;
	codeSequence: string;
	codeInput: string;
	result: 'none' | 'success' | 'failure';
}

// ─── Configs ─────────────────────────────────────────────────────────────────

const MINI_GAMES: MiniGameConfig[] = [
	{
		type: 'launch-window',
		title: 'LAUNCH WINDOW!',
		subtitle: 'Tap 20 times in 5 seconds for 2× Rocket revenue!',
		icon: '🚀',
		durationMs: 5000,
	},
	{
		type: 'power-surge',
		title: 'POWER SURGE!',
		subtitle: 'Hold to charge — release at exactly 100% for 3× Energy revenue!',
		icon: '⚡',
		durationMs: 4000,
	},
	{
		type: 'hack-mainframe',
		title: 'HACK THE MAINFRAME!',
		subtitle: 'Type the code sequence for an AI speed boost!',
		icon: '💻',
		durationMs: 8000,
	},
];

const LAUNCH_TAP_GOAL = 20;
const CHARGE_CYCLE_MS = 3000; // full cycle period
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ2345679';

function generateCode(length: number): string {
	let code = '';
	for (let i = 0; i < length; i++) {
		code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
	}
	return code;
}

// ─── Store ───────────────────────────────────────────────────────────────────

function createDefaultState(): MiniGameState {
	return {
		active: false,
		game: null,
		progress: 0,
		remainingMs: 0,
		tapCount: 0,
		chargeLevel: 0,
		codeSequence: '',
		codeInput: '',
		result: 'none',
	};
}

export const miniGameState = writable<MiniGameState>(createDefaultState());

// ─── Timing ──────────────────────────────────────────────────────────────────

/** Time until next mini-game trigger (ms). Fixed 5 min cadence. */
let nextTriggerMs = 5 * 60 * 1000; // First one at 5 min of gameplay
/** Cooldown after failure (5 min) */
const FAILURE_COOLDOWN_MS = 5 * 60 * 1000;
let onCooldown = false;

/** Fixed interval between mini-games: every 5 minutes of active play */
const MINI_GAME_INTERVAL_MS = 5 * 60 * 1000;

// ─── Public API ──────────────────────────────────────────────────────────────

/** Start a specific mini-game */
export function triggerMiniGame(type?: MiniGameType): void {
	const state = get(miniGameState);
	if (state.active) return; // already playing

	const config = type
		? MINI_GAMES.find((g) => g.type === type)!
		: MINI_GAMES[Math.floor(Math.random() * MINI_GAMES.length)];

	const initial: MiniGameState = {
		active: true,
		game: config,
		progress: 0,
		remainingMs: config.durationMs,
		tapCount: 0,
		chargeLevel: 0,
		codeSequence: config.type === 'hack-mainframe' ? generateCode(6) : '',
		codeInput: '',
		result: 'none',
	};

	miniGameState.set(initial);
}

/** Handle a tap in Launch Window mini-game */
export function miniGameTap(): void {
	miniGameState.update((s) => {
		if (!s.active || s.game?.type !== 'launch-window') return s;
		const newCount = s.tapCount + 1;
		const progress = Math.min(newCount / LAUNCH_TAP_GOAL, 1);
		if (newCount >= LAUNCH_TAP_GOAL) {
			completeMiniGame(true);
			return { ...s, tapCount: newCount, progress: 1, result: 'success' };
		}
		return { ...s, tapCount: newCount, progress };
	});
}

/** Update charge level for Power Surge (called on tick while holding) */
export function updateCharge(deltaMs: number): void {
	miniGameState.update((s) => {
		if (!s.active || s.game?.type !== 'power-surge') return s;
		// Charge oscillates 0→100→0 in a sawtooth wave
		const newCharge = (s.chargeLevel + (deltaMs / CHARGE_CYCLE_MS) * 200) % 200;
		// Convert sawtooth to triangle: 0→100→0
		const display = newCharge <= 100 ? newCharge : 200 - newCharge;
		return { ...s, chargeLevel: display, progress: display / 100 };
	});
}

/** Release charge in Power Surge */
export function releaseCharge(): void {
	const s = get(miniGameState);
	if (!s.active || s.game?.type !== 'power-surge') return;
	// Success if charge is 90-100%
	const success = s.chargeLevel >= 90;
	completeMiniGame(success);
	miniGameState.update((st) => ({
		...st,
		result: success ? 'success' : 'failure',
	}));
}

/** Handle code input for Hack the Mainframe */
export function miniGameTypeChar(char: string): void {
	miniGameState.update((s) => {
		if (!s.active || s.game?.type !== 'hack-mainframe') return s;
		const newInput = s.codeInput + char.toUpperCase();
		const progress = newInput.length / s.codeSequence.length;

		// Check if matches so far
		if (!s.codeSequence.startsWith(newInput)) {
			// Wrong char — reset input
			return { ...s, codeInput: '', progress: 0 };
		}

		if (newInput === s.codeSequence) {
			completeMiniGame(true);
			return { ...s, codeInput: newInput, progress: 1, result: 'success' };
		}

		return { ...s, codeInput: newInput, progress };
	});
}

/** Tick the mini-game timer */
export function tickMiniGame(deltaMs: number): void {
	if (!onCooldown) {
		nextTriggerMs -= deltaMs;
		if (nextTriggerMs <= 0) {
			nextTriggerMs = MINI_GAME_INTERVAL_MS;
			const s = get(miniGameState);
			if (!s.active) {
				triggerMiniGame();
			}
		}
	}

	const s = get(miniGameState);
	if (!s.active || s.result !== 'none') return;

	const newRemaining = s.remainingMs - deltaMs;
	if (newRemaining <= 0) {
		// Time's up — failure
		completeMiniGame(false);
		miniGameState.update((st) => ({ ...st, remainingMs: 0, result: 'failure' }));
		return;
	}

	miniGameState.update((st) => ({ ...st, remainingMs: newRemaining }));
}

/** Dismiss the result screen */
export function dismissMiniGame(): void {
	miniGameState.set(createDefaultState());
}

// ─── Internal ────────────────────────────────────────────────────────────────

function completeMiniGame(success: boolean): void {
	const s = get(miniGameState);
	if (!s.game) return;

	if (success) {
		// Apply buff based on game type
		switch (s.game.type) {
			case 'launch-window':
				addBuff({
					id: 'mini-launch-window',
					name: '2× Rockets',
					icon: '🚀',
					durationMs: 60_000,
					effect: '2× Rocket division revenue',
					color: 'text-rocket-red',
				});
				break;
			case 'power-surge':
				addBuff({
					id: 'mini-power-surge',
					name: '3× Energy',
					icon: '⚡',
					durationMs: 60_000,
					effect: '3× Energy division revenue',
					color: 'text-solar-gold',
				});
				break;
			case 'hack-mainframe':
				addBuff({
					id: 'mini-hack-mainframe',
					name: 'AI Boost',
					icon: '💻',
					durationMs: 90_000,
					effect: '2× AI production speed',
					color: 'text-neural-purple',
				});
				break;
		}
		triggerParticle('confetti');
		onCooldown = false;
	} else {
		onCooldown = true;
		nextTriggerMs = FAILURE_COOLDOWN_MS;
		// Cooldown clears on next successful trigger timer expiry
		setTimeout(() => {
			onCooldown = false;
		}, FAILURE_COOLDOWN_MS);
	}
}

// ─── EventBus Integration ────────────────────────────────────────────────────

/**
 * Initialize EventBus listeners to trigger mini-games from game events.
 * Returns cleanup function.
 */
/**
 * Initialize mini-game system. Mini-games trigger on a fixed 5-minute
 * cadence via tickMiniGame — no random event-based triggers.
 * Returns cleanup function (no-op since we use tick-based timing only).
 */
export function initMiniGameListeners(): () => void {
	return () => {};
}
