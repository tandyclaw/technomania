/**
 * SoundManager.ts — Web Audio API sound effects for game events
 *
 * Uses synthesized tones (no audio files needed). Each sound is a short
 * sequence of oscillator/gain nodes that play and self-destruct.
 *
 * Respects the sfxEnabled setting in game state.
 *
 * Sounds:
 * - tap: short click/pop on production start
 * - kaching: coin/cash register on production complete
 * - whoosh: swoosh on tier unlock
 * - fanfare: triumphant chord on division unlock
 */

import { get } from 'svelte/store';
import { gameState } from '$lib/stores/gameState';
import { eventBus } from '$lib/engine/EventBus';

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
	if (typeof window === 'undefined') return null;
	if (!audioCtx) {
		try {
			audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
		} catch {
			console.warn('[SoundManager] Web Audio API not available');
			return null;
		}
	}
	// Resume if suspended (autoplay policy)
	if (audioCtx.state === 'suspended') {
		audioCtx.resume().catch(() => {});
	}
	return audioCtx;
}

function isSfxEnabled(): boolean {
	return get(gameState).settings.sfxEnabled;
}

/**
 * Play a short "tap/click" sound — production started
 */
function playTap(): void {
	if (!isSfxEnabled()) return;
	const ctx = getContext();
	if (!ctx) return;

	const now = ctx.currentTime;

	// Short click: high-freq burst
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = 'sine';
	osc.frequency.setValueAtTime(800, now);
	osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);
	gain.gain.setValueAtTime(0.15, now);
	gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.start(now);
	osc.stop(now + 0.1);
}

/**
 * Play a "ka-ching" coin sound — production complete / cash earned
 */
function playKaching(): void {
	if (!isSfxEnabled()) return;
	const ctx = getContext();
	if (!ctx) return;

	const now = ctx.currentTime;

	// Two-note rising chime
	const osc1 = ctx.createOscillator();
	const gain1 = ctx.createGain();
	osc1.type = 'sine';
	osc1.frequency.setValueAtTime(1200, now);
	gain1.gain.setValueAtTime(0.12, now);
	gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
	osc1.connect(gain1);
	gain1.connect(ctx.destination);
	osc1.start(now);
	osc1.stop(now + 0.16);

	const osc2 = ctx.createOscillator();
	const gain2 = ctx.createGain();
	osc2.type = 'sine';
	osc2.frequency.setValueAtTime(1600, now + 0.06);
	gain2.gain.setValueAtTime(0.001, now);
	gain2.gain.linearRampToValueAtTime(0.14, now + 0.07);
	gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
	osc2.connect(gain2);
	gain2.connect(ctx.destination);
	osc2.start(now + 0.06);
	osc2.stop(now + 0.26);
}

/**
 * Play a "whoosh" sweep — tier unlocked
 */
function playWhoosh(): void {
	if (!isSfxEnabled()) return;
	const ctx = getContext();
	if (!ctx) return;

	const now = ctx.currentTime;

	// Filtered noise sweep using oscillator as approximation
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = 'sawtooth';
	osc.frequency.setValueAtTime(200, now);
	osc.frequency.exponentialRampToValueAtTime(1500, now + 0.15);
	osc.frequency.exponentialRampToValueAtTime(100, now + 0.35);
	gain.gain.setValueAtTime(0.001, now);
	gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
	gain.gain.setValueAtTime(0.08, now + 0.12);
	gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

	// Low-pass filter for whoosh character
	const filter = ctx.createBiquadFilter();
	filter.type = 'lowpass';
	filter.frequency.setValueAtTime(600, now);
	filter.frequency.linearRampToValueAtTime(3000, now + 0.15);
	filter.frequency.linearRampToValueAtTime(400, now + 0.35);
	filter.Q.setValueAtTime(2, now);

	osc.connect(filter);
	filter.connect(gain);
	gain.connect(ctx.destination);
	osc.start(now);
	osc.stop(now + 0.4);
}

/**
 * Play a "fanfare" — division unlocked
 */
function playFanfare(): void {
	if (!isSfxEnabled()) return;
	const ctx = getContext();
	if (!ctx) return;

	const now = ctx.currentTime;

	// Three-note ascending major chord (C-E-G)
	const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
	const delays = [0, 0.1, 0.2];
	const duration = 0.35;

	notes.forEach((freq, i) => {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = 'triangle';
		osc.frequency.setValueAtTime(freq, now + delays[i]);
		gain.gain.setValueAtTime(0.001, now);
		gain.gain.linearRampToValueAtTime(0.12, now + delays[i] + 0.02);
		gain.gain.setValueAtTime(0.12, now + delays[i] + duration * 0.6);
		gain.gain.exponentialRampToValueAtTime(0.001, now + delays[i] + duration);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(now + delays[i]);
		osc.stop(now + delays[i] + duration + 0.01);
	});

	// Final high shimmer
	const shimmer = ctx.createOscillator();
	const shimmerGain = ctx.createGain();
	shimmer.type = 'sine';
	shimmer.frequency.setValueAtTime(1046.5, now + 0.35); // C6
	shimmerGain.gain.setValueAtTime(0.001, now);
	shimmerGain.gain.linearRampToValueAtTime(0.1, now + 0.37);
	shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
	shimmer.connect(shimmerGain);
	shimmerGain.connect(ctx.destination);
	shimmer.start(now + 0.35);
	shimmer.stop(now + 0.72);
}

/**
 * Map of sound names to play functions, for manual triggering
 */
export const sounds = {
	tap: playTap,
	kaching: playKaching,
	whoosh: playWhoosh,
	fanfare: playFanfare,
} as const;

export type SoundName = keyof typeof sounds;

/**
 * Play a sound by name
 */
export function playSound(name: SoundName): void {
	sounds[name]?.();
}

// --- EventBus wiring ---

let unsubscribers: (() => void)[] = [];

/**
 * Wire up sound effects to game events via EventBus.
 * Call once when the game initializes. Returns a cleanup function.
 */
export function initSoundListeners(): () => void {
	// Clean up any existing listeners first
	cleanupSoundListeners();

	unsubscribers = [
		eventBus.on('production:started', () => {
			playTap();
		}),
		eventBus.on('production:complete', () => {
			playKaching();
		}),
		eventBus.on('tier:unlocked', () => {
			playWhoosh();
		}),
		eventBus.on('division:unlocked', () => {
			playFanfare();
		}),
	];

	return cleanupSoundListeners;
}

function cleanupSoundListeners(): void {
	for (const unsub of unsubscribers) {
		unsub();
	}
	unsubscribers = [];
}
