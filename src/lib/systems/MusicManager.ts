/**
 * MusicManager.ts — Procedural ambient music via Web Audio API
 *
 * Generates calm, evolving background music using oscillators + filters.
 * Different moods per planet stage. Crossfades on prestige. Starts muted.
 */

import { get } from 'svelte/store';
import { gameState } from '$lib/stores/gameState';

export type MusicMood = 'earth' | 'mars' | 'deepSpace';

interface OscConfig {
	type: OscillatorType;
	freq: number;
	detune?: number;
	gain: number;
}

interface MoodConfig {
	oscillators: OscConfig[];
	filterFreq: number;
	filterQ: number;
	lfoRate: number;
	lfoDepth: number;
	reverbWet: number;
}

const MOOD_CONFIGS: Record<MusicMood, MoodConfig> = {
	earth: {
		oscillators: [
			{ type: 'sine', freq: 220, gain: 0.12 },
			{ type: 'triangle', freq: 330, detune: 5, gain: 0.06 },
			{ type: 'sine', freq: 440, detune: -3, gain: 0.04 },
		],
		filterFreq: 800,
		filterQ: 1,
		lfoRate: 0.15,
		lfoDepth: 30,
		reverbWet: 0.3,
	},
	mars: {
		oscillators: [
			{ type: 'triangle', freq: 146.83, gain: 0.1 },
			{ type: 'sine', freq: 196, detune: -8, gain: 0.07 },
			{ type: 'sine', freq: 293.66, detune: 12, gain: 0.04 },
		],
		filterFreq: 500,
		filterQ: 2,
		lfoRate: 0.08,
		lfoDepth: 20,
		reverbWet: 0.5,
	},
	deepSpace: {
		oscillators: [
			{ type: 'sine', freq: 110, gain: 0.08 },
			{ type: 'sine', freq: 164.81, detune: 7, gain: 0.05 },
			{ type: 'triangle', freq: 261.63, detune: -5, gain: 0.03 },
		],
		filterFreq: 350,
		filterQ: 3,
		lfoRate: 0.04,
		lfoDepth: 15,
		reverbWet: 0.8,
	},
};

/** Map prestige count to mood */
export function getMoodForPlanet(prestigeCount: number): MusicMood {
	if (prestigeCount === 0) return 'earth';
	if (prestigeCount === 1) return 'mars';
	return 'deepSpace';
}

interface ActiveTrack {
	oscillators: OscillatorNode[];
	gains: GainNode[];
	lfo: OscillatorNode;
	lfoGain: GainNode;
	filter: BiquadFilterNode;
	masterGain: GainNode;
	convolver: ConvolverNode | null;
	wetGain: GainNode;
	dryGain: GainNode;
	mood: MusicMood;
}

let audioCtx: AudioContext | null = null;
let currentTrack: ActiveTrack | null = null;
let isPlaying = false;
let currentMood: MusicMood | null = null;

function getContext(): AudioContext | null {
	if (typeof window === 'undefined') return null;
	if (!audioCtx) {
		try {
			audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
		} catch {
			return null;
		}
	}
	if (audioCtx.state === 'suspended') {
		audioCtx.resume().catch(() => {});
	}
	return audioCtx;
}

/** Create a simple impulse response for reverb */
function createImpulseResponse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
	const sampleRate = ctx.sampleRate;
	const length = sampleRate * duration;
	const buffer = ctx.createBuffer(2, length, sampleRate);
	for (let ch = 0; ch < 2; ch++) {
		const data = buffer.getChannelData(ch);
		for (let i = 0; i < length; i++) {
			data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
		}
	}
	return buffer;
}

function buildTrack(ctx: AudioContext, mood: MusicMood, volume: number): ActiveTrack {
	const config = MOOD_CONFIGS[mood];
	const masterGain = ctx.createGain();
	masterGain.gain.setValueAtTime(0, ctx.currentTime); // start silent for crossfade

	// Filter
	const filter = ctx.createBiquadFilter();
	filter.type = 'lowpass';
	filter.frequency.setValueAtTime(config.filterFreq, ctx.currentTime);
	filter.Q.setValueAtTime(config.filterQ, ctx.currentTime);

	// LFO for filter modulation
	const lfo = ctx.createOscillator();
	const lfoGain = ctx.createGain();
	lfo.type = 'sine';
	lfo.frequency.setValueAtTime(config.lfoRate, ctx.currentTime);
	lfoGain.gain.setValueAtTime(config.lfoDepth, ctx.currentTime);
	lfo.connect(lfoGain);
	lfoGain.connect(filter.frequency);
	lfo.start();

	// Reverb (convolver)
	let convolver: ConvolverNode | null = null;
	const wetGain = ctx.createGain();
	const dryGain = ctx.createGain();
	wetGain.gain.setValueAtTime(config.reverbWet, ctx.currentTime);
	dryGain.gain.setValueAtTime(1 - config.reverbWet, ctx.currentTime);

	try {
		convolver = ctx.createConvolver();
		convolver.buffer = createImpulseResponse(ctx, 2.5, 3);
		filter.connect(convolver);
		convolver.connect(wetGain);
	} catch {
		// If convolver fails, route all to dry
		wetGain.gain.setValueAtTime(0, ctx.currentTime);
		dryGain.gain.setValueAtTime(1, ctx.currentTime);
	}

	filter.connect(dryGain);
	wetGain.connect(masterGain);
	dryGain.connect(masterGain);
	masterGain.connect(ctx.destination);

	// Oscillators
	const oscillators: OscillatorNode[] = [];
	const gains: GainNode[] = [];

	for (const oscCfg of config.oscillators) {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = oscCfg.type;
		osc.frequency.setValueAtTime(oscCfg.freq, ctx.currentTime);
		if (oscCfg.detune) osc.detune.setValueAtTime(oscCfg.detune, ctx.currentTime);
		gain.gain.setValueAtTime(oscCfg.gain, ctx.currentTime);
		osc.connect(gain);
		gain.connect(filter);
		osc.start();
		oscillators.push(osc);
		gains.push(gain);
	}

	// Set master volume
	masterGain.gain.setValueAtTime(0, ctx.currentTime);

	return { oscillators, gains, lfo, lfoGain, filter, masterGain, convolver, wetGain, dryGain, mood };
}

function fadeIn(track: ActiveTrack, volume: number, duration = 4): void {
	const ctx = audioCtx;
	if (!ctx) return;
	const now = ctx.currentTime;
	track.masterGain.gain.cancelScheduledValues(now);
	track.masterGain.gain.setValueAtTime(track.masterGain.gain.value, now);
	track.masterGain.gain.linearRampToValueAtTime(volume, now + duration);
}

function fadeOut(track: ActiveTrack, duration = 4, thenDestroy = true): void {
	const ctx = audioCtx;
	if (!ctx) return;
	const now = ctx.currentTime;
	track.masterGain.gain.cancelScheduledValues(now);
	track.masterGain.gain.setValueAtTime(track.masterGain.gain.value, now);
	track.masterGain.gain.linearRampToValueAtTime(0, now + duration);

	if (thenDestroy) {
		setTimeout(() => destroyTrack(track), (duration + 0.5) * 1000);
	}
}

function destroyTrack(track: ActiveTrack): void {
	try {
		for (const osc of track.oscillators) {
			osc.stop();
			osc.disconnect();
		}
		track.lfo.stop();
		track.lfo.disconnect();
		track.lfoGain.disconnect();
		track.filter.disconnect();
		track.masterGain.disconnect();
		track.wetGain.disconnect();
		track.dryGain.disconnect();
		track.convolver?.disconnect();
		for (const g of track.gains) g.disconnect();
	} catch {
		// ignore cleanup errors
	}
}

// --- Public API ---

export function startMusic(): void {
	const state = get(gameState);
	if (!state.settings.musicEnabled) return;
	const ctx = getContext();
	if (!ctx) return;

	const mood = getMoodForPlanet(state.prestigeCount);
	const volume = state.settings.musicVolume ?? 0.5;

	if (currentTrack && currentMood === mood) {
		// Already playing this mood, just ensure faded in
		fadeIn(currentTrack, volume);
		isPlaying = true;
		return;
	}

	// Crossfade if mood changed
	if (currentTrack) {
		fadeOut(currentTrack, 4, true);
	}

	currentTrack = buildTrack(ctx, mood, volume);
	currentMood = mood;
	fadeIn(currentTrack, volume, 4);
	isPlaying = true;
}

export function stopMusic(): void {
	if (currentTrack) {
		fadeOut(currentTrack, 2, true);
		currentTrack = null;
		currentMood = null;
	}
	isPlaying = false;
}

export function setMusicVolume(volume: number): void {
	if (!currentTrack || !audioCtx) return;
	const now = audioCtx.currentTime;
	currentTrack.masterGain.gain.cancelScheduledValues(now);
	currentTrack.masterGain.gain.setValueAtTime(currentTrack.masterGain.gain.value, now);
	currentTrack.masterGain.gain.linearRampToValueAtTime(volume, now + 0.1);
}

export function setMusicEnabled(enabled: boolean): void {
	if (enabled) {
		startMusic();
	} else {
		stopMusic();
	}
}

/** Call when prestige happens to crossfade to new mood */
export function onPrestige(): void {
	if (!isPlaying) return;
	const state = get(gameState);
	if (!state.settings.musicEnabled) return;
	const mood = getMoodForPlanet(state.prestigeCount);
	if (mood === currentMood) return;

	const ctx = getContext();
	if (!ctx) return;

	const volume = state.settings.musicVolume ?? 0.5;

	// Crossfade
	if (currentTrack) {
		fadeOut(currentTrack, 4, true);
	}
	currentTrack = buildTrack(ctx, mood, volume);
	currentMood = mood;
	fadeIn(currentTrack, volume, 4);
}

// --- Page Visibility ---

let visibilityHandler: (() => void) | null = null;

export function initMusicSystem(): () => void {
	// Page Visibility API
	visibilityHandler = () => {
		if (document.hidden) {
			if (currentTrack && isPlaying) {
				fadeOut(currentTrack, 0.5, false);
			}
		} else {
			if (isPlaying) {
				const state = get(gameState);
				if (state.settings.musicEnabled && currentTrack) {
					const vol = state.settings.musicVolume ?? 0.5;
					fadeIn(currentTrack, vol, 1);
				}
			}
		}
	};
	document.addEventListener('visibilitychange', visibilityHandler);

	// Start if enabled
	const state = get(gameState);
	if (state.settings.musicEnabled) {
		startMusic();
	}

	return () => {
		if (visibilityHandler) {
			document.removeEventListener('visibilitychange', visibilityHandler);
			visibilityHandler = null;
		}
		stopMusic();
	};
}
