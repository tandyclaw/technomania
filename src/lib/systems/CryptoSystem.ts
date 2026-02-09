/**
 * CryptoSystem.ts — Bitcoin & DOGE treasury investment system
 *
 * BTC: Simulates price with volatile, cyclical movement:
 * - Sine wave base for cyclical swings
 * - Random noise overlay for realistic volatility
 * - Occasional "crashes" (-30-50%) and "moons" (+30-60%)
 * - Price updates every game tick, history stored for sparkline
 *
 * DOGE: Much cheaper, more volatile meme coin:
 * - Higher amplitude oscillations and noise
 * - "Elon Tweet" random event that pumps price 50-200% temporarily
 * - Price eventually decays back after tweet pump fades
 *
 * Portfolio tracking: buy/sell BTC and DOGE with game cash.
 */

import { get } from 'svelte/store';
import { gameState, type CryptoState } from '$lib/stores/gameState';
import { addToast } from '$lib/stores/toastStore';
import { formatCurrency } from '$lib/engine/BigNumber';

/** Base BTC price around which cycles oscillate */
const BASE_PRICE = 42_000;

/** Base DOGE price — much cheaper */
const DOGE_BASE_PRICE = 0.08;

/** Maximum price history entries to keep (for sparkline) */
const MAX_HISTORY = 120;

/** How often to record a new price point (ms) */
const PRICE_RECORD_INTERVAL_MS = 3_000;

/** How often to check for crash/moon events (ms) */
const EVENT_CHECK_INTERVAL_MS = 15_000;

/** Probability of a crash event per check */
const CRASH_PROBABILITY = 0.04;

/** Probability of a moon event per check */
const MOON_PROBABILITY = 0.04;

/** DOGE-specific event probabilities (higher volatility) */
const DOGE_CRASH_PROBABILITY = 0.06;
const DOGE_MOON_PROBABILITY = 0.06;

/** Elon Tweet pump probability per check */
const ELON_TWEET_PROBABILITY = 0.03;

/** Elon Tweet pump duration range (ms) */
const ELON_TWEET_MIN_DURATION_MS = 15_000;
const ELON_TWEET_MAX_DURATION_MS = 45_000;

/** Elon Tweet messages for toasts */
const ELON_TWEETS = [
	'One word: Doge 🐕',
	'Doge is the people\'s crypto 🚀',
	'Much wow, very currency',
	'Who let the Doge out 🐶',
	'Dogefather has spoken 🎩',
	'DOGE to the moon!! 🌙',
	'The future currency of Mars 🔴🐕',
	'*posts Shiba Inu meme*',
];

/** Internal accumulators (not saved — ephemeral per session) */
let priceRecordAccumulator = 0;
let eventCheckAccumulator = 0;

/** Seeded-ish phase offset so each game feels different */
let phaseOffset = Math.random() * Math.PI * 2;
let dogePhaseOffset = Math.random() * Math.PI * 2;

/**
 * Generate BTC price based on elapsed game time.
 * Uses layered sine waves + noise for realistic-feeling volatility.
 */
export function generateBtcPrice(gameTimeMs: number, currentPrice: number): number {
	const t = gameTimeMs / 1000; // seconds

	// Layer 1: Slow macro cycle (~5 min period), ±25% swing
	const macro = Math.sin((t / 300) * Math.PI * 2 + phaseOffset) * 0.25;

	// Layer 2: Medium cycle (~90s period), ±12% swing
	const medium = Math.sin((t / 90) * Math.PI * 2 + phaseOffset * 1.7) * 0.12;

	// Layer 3: Fast micro cycle (~20s period), ±5% swing
	const micro = Math.sin((t / 20) * Math.PI * 2 + phaseOffset * 3.1) * 0.05;

	// Layer 4: Random noise, ±3%
	const noise = (Math.random() - 0.5) * 0.06;

	// Combine all factors
	const factor = 1 + macro + medium + micro + noise;

	// Blend between formula price and current price for smooth transitions
	const formulaPrice = BASE_PRICE * factor;
	const blendedPrice = currentPrice * 0.85 + formulaPrice * 0.15;

	return Math.max(1000, blendedPrice); // Floor at $1,000
}

/**
 * Generate DOGE price based on elapsed game time.
 * More volatile than BTC — wider swings, faster cycles, more noise.
 */
export function generateDogePrice(gameTimeMs: number, currentPrice: number): number {
	const t = gameTimeMs / 1000;

	// Layer 1: Slow macro cycle (~3 min period), ±35% swing (more volatile than BTC)
	const macro = Math.sin((t / 180) * Math.PI * 2 + dogePhaseOffset) * 0.35;

	// Layer 2: Medium cycle (~45s period), ±20% swing
	const medium = Math.sin((t / 45) * Math.PI * 2 + dogePhaseOffset * 2.3) * 0.20;

	// Layer 3: Fast micro cycle (~10s period), ±10% swing
	const micro = Math.sin((t / 10) * Math.PI * 2 + dogePhaseOffset * 4.1) * 0.10;

	// Layer 4: Random noise, ±8% (more noisy than BTC)
	const noise = (Math.random() - 0.5) * 0.16;

	const factor = 1 + macro + medium + micro + noise;
	const formulaPrice = DOGE_BASE_PRICE * factor;
	const blendedPrice = currentPrice * 0.8 + formulaPrice * 0.2;

	return Math.max(0.001, blendedPrice); // Floor at $0.001
}

/**
 * Apply a crash event — sudden price drop
 */
function applyCrash(): number {
	const crashSeverity = 0.3 + Math.random() * 0.2; // 30-50% drop
	return 1 - crashSeverity;
}

/**
 * Apply a moon event — sudden price spike
 */
function applyMoon(): number {
	const moonSeverity = 0.3 + Math.random() * 0.3; // 30-60% rise
	return 1 + moonSeverity;
}

/**
 * Buy BTC with available cash.
 * @param usdAmount — amount of USD to spend
 * @returns true if purchase succeeded
 */
export function buyBtc(usdAmount: number): boolean {
	const state = get(gameState);
	if (usdAmount <= 0 || usdAmount > state.cash) return false;

	const crypto = state.crypto;
	const btcAmount = usdAmount / crypto.btcPrice;

	gameState.update((s) => ({
		...s,
		cash: s.cash - usdAmount,
		crypto: {
			...s.crypto,
			btcOwned: s.crypto.btcOwned + btcAmount,
			totalInvested: s.crypto.totalInvested + usdAmount,
		},
	}));

	addToast('success', '₿', 'Bought Bitcoin', `${btcAmount.toFixed(6)} BTC for ${formatCurrency(usdAmount)}`, {
		color: '#F7931A',
		durationMs: 3000,
	});

	return true;
}

/**
 * Sell BTC for cash.
 * @param btcAmount — amount of BTC to sell
 * @returns true if sale succeeded
 */
export function sellBtc(btcAmount: number): boolean {
	const state = get(gameState);
	if (btcAmount <= 0 || btcAmount > state.crypto.btcOwned) return false;

	const usdAmount = btcAmount * state.crypto.btcPrice;

	gameState.update((s) => ({
		...s,
		cash: s.cash + usdAmount,
		crypto: {
			...s.crypto,
			btcOwned: s.crypto.btcOwned - btcAmount,
		},
	}));

	addToast('success', '💵', 'Sold Bitcoin', `${btcAmount.toFixed(6)} BTC for ${formatCurrency(usdAmount)}`, {
		color: '#44FF88',
		durationMs: 3000,
	});

	return true;
}

/**
 * Sell all BTC holdings.
 */
export function sellAllBtc(): boolean {
	const state = get(gameState);
	if (state.crypto.btcOwned <= 0) return false;
	return sellBtc(state.crypto.btcOwned);
}

// ─── DOGE Buy/Sell ──────────────────────────────────────────────────────────

/**
 * Buy DOGE with available cash.
 */
export function buyDoge(usdAmount: number): boolean {
	const state = get(gameState);
	if (usdAmount <= 0 || usdAmount > state.cash) return false;

	const crypto = state.crypto;
	const dogeAmount = usdAmount / crypto.dogePrice;

	gameState.update((s) => ({
		...s,
		cash: s.cash - usdAmount,
		crypto: {
			...s.crypto,
			dogeOwned: s.crypto.dogeOwned + dogeAmount,
			dogeTotalInvested: s.crypto.dogeTotalInvested + usdAmount,
		},
	}));

	addToast('success', '🐕', 'Bought DOGE', `${formatDogeAmount(dogeAmount)} DOGE for ${formatCurrency(usdAmount)}`, {
		color: '#C2A633',
		durationMs: 3000,
	});

	return true;
}

/**
 * Sell DOGE for cash.
 */
export function sellDoge(dogeAmount: number): boolean {
	const state = get(gameState);
	if (dogeAmount <= 0 || dogeAmount > state.crypto.dogeOwned) return false;

	const usdAmount = dogeAmount * state.crypto.dogePrice;

	gameState.update((s) => ({
		...s,
		cash: s.cash + usdAmount,
		crypto: {
			...s.crypto,
			dogeOwned: s.crypto.dogeOwned - dogeAmount,
		},
	}));

	addToast('success', '💵', 'Sold DOGE', `${formatDogeAmount(dogeAmount)} DOGE for ${formatCurrency(usdAmount)}`, {
		color: '#44FF88',
		durationMs: 3000,
	});

	return true;
}

/**
 * Sell all DOGE holdings.
 */
export function sellAllDoge(): boolean {
	const state = get(gameState);
	if (state.crypto.dogeOwned <= 0) return false;
	return sellDoge(state.crypto.dogeOwned);
}

/**
 * Format DOGE amounts (can be very large numbers)
 */
function formatDogeAmount(amount: number): string {
	if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(2) + 'M';
	if (amount >= 1_000) return (amount / 1_000).toFixed(2) + 'K';
	return amount.toFixed(2);
}

// ─── Portfolio ──────────────────────────────────────────────────────────────

/**
 * Get BTC portfolio value in USD.
 */
export function getBtcPortfolioValue(crypto: CryptoState): number {
	return crypto.btcOwned * crypto.btcPrice;
}

/**
 * Get DOGE portfolio value in USD.
 */
export function getDogePortfolioValue(crypto: CryptoState): number {
	return crypto.dogeOwned * crypto.dogePrice;
}

/**
 * Get total portfolio value in USD.
 */
export function getPortfolioValue(crypto: CryptoState): number {
	return getBtcPortfolioValue(crypto) + getDogePortfolioValue(crypto);
}

/**
 * Get BTC profit/loss in USD.
 */
export function getBtcPnL(crypto: CryptoState): number {
	return getBtcPortfolioValue(crypto) - crypto.totalInvested;
}

/**
 * Get DOGE profit/loss in USD.
 */
export function getDogePnL(crypto: CryptoState): number {
	return getDogePortfolioValue(crypto) - crypto.dogeTotalInvested;
}

/**
 * Get total profit/loss in USD.
 */
export function getPortfolioPnL(crypto: CryptoState): number {
	return getPortfolioValue(crypto) - crypto.totalInvested - crypto.dogeTotalInvested;
}

/**
 * Tick the crypto system. Called from GameManager's game loop.
 * @param deltaMs — time elapsed since last tick
 */
export function tickCrypto(deltaMs: number): void {
	priceRecordAccumulator += deltaMs;
	eventCheckAccumulator += deltaMs;

	gameState.update((s) => {
		let newBtcPrice = s.crypto.btcPrice;
		let newDogePrice = s.crypto.dogePrice;
		let elonTweetPumpMs = s.crypto.elonTweetPumpMs;
		let elonTweetMultiplier = s.crypto.elonTweetMultiplier;
		const gameTimeMs = s.stats.playTimeMs;

		// Generate new prices every tick for smooth movement
		newBtcPrice = generateBtcPrice(gameTimeMs, newBtcPrice);
		newDogePrice = generateDogePrice(gameTimeMs, newDogePrice);

		// Apply Elon Tweet pump to DOGE if active
		if (elonTweetPumpMs > 0) {
			elonTweetPumpMs = Math.max(0, elonTweetPumpMs - deltaMs);
			newDogePrice *= elonTweetMultiplier;

			// When pump expires, reset multiplier
			if (elonTweetPumpMs <= 0) {
				elonTweetMultiplier = 1;
				setTimeout(() => {
					addToast('info', '📉', 'Tweet Hype Fading', 'The Elon Tweet pump is wearing off...', {
						color: '#C2A633',
						durationMs: 4000,
					});
				}, 0);
			}
		}

		// Check for crash/moon events periodically
		if (eventCheckAccumulator >= EVENT_CHECK_INTERVAL_MS) {
			eventCheckAccumulator = 0;

			// ── BTC Events ──
			const btcRoll = Math.random();
			if (btcRoll < CRASH_PROBABILITY) {
				const multiplier = applyCrash();
				newBtcPrice *= multiplier;
				setTimeout(() => {
					addToast('warning', '📉', 'BTC Crash!', `Price dropped to ${formatCurrency(newBtcPrice)}`, {
						color: '#FF4444',
						durationMs: 5000,
					});
				}, 0);
			} else if (btcRoll < CRASH_PROBABILITY + MOON_PROBABILITY) {
				const multiplier = applyMoon();
				newBtcPrice *= multiplier;
				setTimeout(() => {
					addToast('success', '🚀', 'BTC Moon!', `Price surged to ${formatCurrency(newBtcPrice)}`, {
						color: '#F7931A',
						durationMs: 5000,
					});
				}, 0);
			}

			// ── DOGE Events ──
			const dogeRoll = Math.random();
			if (dogeRoll < ELON_TWEET_PROBABILITY && elonTweetPumpMs <= 0) {
				// Elon Tweet pump! 50-200% price increase
				const pumpMultiplier = 1.5 + Math.random() * 1.5; // 1.5x to 3.0x
				const pumpDuration = ELON_TWEET_MIN_DURATION_MS +
					Math.random() * (ELON_TWEET_MAX_DURATION_MS - ELON_TWEET_MIN_DURATION_MS);
				elonTweetMultiplier = pumpMultiplier;
				elonTweetPumpMs = pumpDuration;
				const tweet = ELON_TWEETS[Math.floor(Math.random() * ELON_TWEETS.length)];
				const pumpPercent = Math.round((pumpMultiplier - 1) * 100);
				setTimeout(() => {
					addToast('success', '🐕', `Elon Tweeted! +${pumpPercent}%`, `"${tweet}"`, {
						color: '#C2A633',
						durationMs: 6000,
					});
				}, 0);
			} else if (dogeRoll < ELON_TWEET_PROBABILITY + DOGE_CRASH_PROBABILITY && elonTweetPumpMs <= 0) {
				// DOGE crash (only when no active pump)
				const crashSeverity = 0.25 + Math.random() * 0.25; // 25-50% drop
				newDogePrice *= (1 - crashSeverity);
				setTimeout(() => {
					addToast('warning', '📉', 'DOGE Dump!', `Price crashed to $${newDogePrice.toFixed(4)}`, {
						color: '#FF4444',
						durationMs: 5000,
					});
				}, 0);
			} else if (dogeRoll > 1 - DOGE_MOON_PROBABILITY && elonTweetPumpMs <= 0) {
				// DOGE mini moon (organic, not from tweet)
				const moonSeverity = 0.2 + Math.random() * 0.3; // 20-50% rise
				newDogePrice *= (1 + moonSeverity);
				setTimeout(() => {
					addToast('success', '🚀', 'DOGE Moon!', `Price surged to $${newDogePrice.toFixed(4)}`, {
						color: '#C2A633',
						durationMs: 5000,
					});
				}, 0);
			}
		}

		newBtcPrice = Math.max(1000, newBtcPrice);
		newDogePrice = Math.max(0.001, newDogePrice);

		// Record price history at intervals
		let newBtcHistory = s.crypto.btcPriceHistory;
		let newDogeHistory = s.crypto.dogePriceHistory;
		if (priceRecordAccumulator >= PRICE_RECORD_INTERVAL_MS) {
			priceRecordAccumulator = 0;

			newBtcHistory = [...s.crypto.btcPriceHistory, newBtcPrice];
			if (newBtcHistory.length > MAX_HISTORY) {
				newBtcHistory = newBtcHistory.slice(newBtcHistory.length - MAX_HISTORY);
			}

			newDogeHistory = [...s.crypto.dogePriceHistory, newDogePrice];
			if (newDogeHistory.length > MAX_HISTORY) {
				newDogeHistory = newDogeHistory.slice(newDogeHistory.length - MAX_HISTORY);
			}
		}

		return {
			...s,
			crypto: {
				...s.crypto,
				btcPrice: newBtcPrice,
				btcPriceHistory: newBtcHistory,
				dogePrice: newDogePrice,
				dogePriceHistory: newDogeHistory,
				elonTweetPumpMs,
				elonTweetMultiplier,
			},
		};
	});
}

/**
 * Reset accumulators (call on session start)
 */
export function resetCryptoAccumulators(): void {
	priceRecordAccumulator = 0;
	eventCheckAccumulator = 0;
	phaseOffset = Math.random() * Math.PI * 2;
	dogePhaseOffset = Math.random() * Math.PI * 2;
}
