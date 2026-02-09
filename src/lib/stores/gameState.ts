/**
 * gameState.ts — Central game state using Svelte 5 runes
 * Reactive state with save/load integration
 */

import { writable } from 'svelte/store';

export interface TierState {
	unlocked: boolean;
	count: number;
	level: number;
	producing: boolean;
	progress: number; // 0-1
}

export interface BottleneckState {
	id: string;
	active: boolean;
	severity: number; // 0-1
	resolved: boolean;
	/** Timestamp (ms) when the "wait it out" timer was started, 0 = not waiting */
	waitStartedAt?: number;
}

export interface DivisionState {
	unlocked: boolean;
	tiers: TierState[];
	chiefLevel: number; // 0 = no chief, 1-6 = automation tiers
	bottlenecks: BottleneckState[];
}

export interface GameStats {
	totalTaps: number;
	totalCashEarned: number;
	totalResearchCompleted: number;
	playTimeMs: number;
	sessionsPlayed: number;
}

export interface GameSettings {
	musicEnabled: boolean;
	sfxEnabled: boolean;
	notificationsEnabled: boolean;
	offlineProgressEnabled: boolean;
}

export interface LaunchLogEntry {
	ts: number;
	tier: number;
	name: string;
	units: number;
}

export interface FlavorStats {
	launchLog: LaunchLogEntry[];
	productionLog: LaunchLogEntry[];
}

export interface CryptoState {
	btcPrice: number;
	btcOwned: number;
	btcPriceHistory: number[];
	totalInvested: number; // Total USD spent buying BTC (for P&L calculation)

	// DOGE meme coin
	dogePrice: number;
	dogeOwned: number;
	dogePriceHistory: number[];
	dogeTotalInvested: number;
	/** Active "Elon Tweet" pump event — remaining duration in ms, 0 = none */
	elonTweetPumpMs: number;
	/** Multiplier applied by the current Elon Tweet pump */
	elonTweetMultiplier: number;
}

export interface GameState {
	version: number;
	lastSaved: number;
	lastPlayed: number;

	// Currencies
	cash: number;
	researchPoints: number;
	influence: number;
	foundersVision: number;

	// Power
	powerGenerated: number; // MW
	powerConsumed: number; // MW

	// Synergies — IDs of currently active synergies
	activeSynergies: string[];

	// Divisions
	divisions: {
		spacex: DivisionState;
		tesla: DivisionState;
		teslaenergy: DivisionState;
	};

	// Research
	unlockedResearch: string[];
	activeResearch: { id: string; progress: number } | null;

	// Flavor mechanics (T024, T028)
	flavorStats: FlavorStats;

	// Crypto Treasury
	crypto: CryptoState;

	// Prestige
	prestigeCount: number;
	totalValueEarned: number;

	// Meta
	achievements: string[];
	stats: GameStats;
	settings: GameSettings;
}

export function createDefaultState(): GameState {
	return {
		version: 1,
		lastSaved: Date.now(),
		lastPlayed: Date.now(),

		cash: 25,
		researchPoints: 0,
		influence: 0,
		foundersVision: 0,

		powerGenerated: 0,
		powerConsumed: 0,

		activeSynergies: [],

		flavorStats: {
			launchLog: [],
			productionLog: [],
		},

		divisions: {
			spacex: createDefaultDivision(6),
			tesla: createDefaultDivision(6),
			teslaenergy: createDefaultDivision(6)
		},

		unlockedResearch: [],
		activeResearch: null,

		crypto: {
			btcPrice: 42_000,
			btcOwned: 0,
			btcPriceHistory: [42_000],
			totalInvested: 0,

			dogePrice: 0.08,
			dogeOwned: 0,
			dogePriceHistory: [0.08],
			dogeTotalInvested: 0,
			elonTweetPumpMs: 0,
			elonTweetMultiplier: 1,
		},

		prestigeCount: 0,
		totalValueEarned: 0,

		achievements: [],
		stats: {
			totalTaps: 0,
			totalCashEarned: 0,
			totalResearchCompleted: 0,
			playTimeMs: 0,
			sessionsPlayed: 0
		},
		settings: {
			musicEnabled: true,
			sfxEnabled: true,
			notificationsEnabled: true,
			offlineProgressEnabled: true
		}
	};
}

function createDefaultDivision(tierCount: number): DivisionState {
	const tiers: TierState[] = [];
	for (let i = 0; i < tierCount; i++) {
		tiers.push({
			unlocked: i === 0, // Only first tier unlocked
			count: 0,
			level: 0,
			producing: false,
			progress: 0
		});
	}
	return {
		unlocked: false,
		tiers,
		chiefLevel: 0,
		bottlenecks: []
	};
}

// Create the writable store
export const gameState = writable<GameState>(createDefaultState());
