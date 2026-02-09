/**
 * CryptoSystem.ts — Bitcoin/Crypto treasury investment system
 *
 * Simulates BTC price with volatile, cyclical movement:
 * - Sine wave base for cyclical swings
 * - Random noise overlay for realistic volatility
 * - Occasional "crashes" (-30-50%) and "moons" (+30-60%)
 * - Price updates every game tick, history stored for sparkline
 *
 * Portfolio tracking: buy/sell BTC with game cash.
 */

import { get } from 'svelte/store';
import { gameState, type CryptoState } from '$lib/stores/gameState';
import { addToast } from '$lib/stores/toastStore';
import { formatCurrency } from '$lib/engine/BigNumber';

/** Base BTC price around which cycles oscillate */
const BASE_PRICE = 42_000;

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

/** Internal accumulators (not saved — ephemeral per session) */
let priceRecordAccumulator = 0;
let eventCheckAccumulator = 0;

/** Seeded-ish phase offset so each game feels different */
let phaseOffset = Math.random() * Math.PI * 2;

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

/**
 * Get portfolio value in USD.
 */
export function getPortfolioValue(crypto: CryptoState): number {
	return crypto.btcOwned * crypto.btcPrice;
}

/**
 * Get profit/loss in USD.
 */
export function getPortfolioPnL(crypto: CryptoState): number {
	return getPortfolioValue(crypto) - crypto.totalInvested;
}

/**
 * Tick the crypto system. Called from GameManager's game loop.
 * @param deltaMs — time elapsed since last tick
 */
export function tickCrypto(deltaMs: number): void {
	priceRecordAccumulator += deltaMs;
	eventCheckAccumulator += deltaMs;

	gameState.update((s) => {
		let newPrice = s.crypto.btcPrice;
		const gameTimeMs = s.stats.playTimeMs;

		// Generate new price every tick for smooth movement
		newPrice = generateBtcPrice(gameTimeMs, newPrice);

		// Check for crash/moon events periodically
		if (eventCheckAccumulator >= EVENT_CHECK_INTERVAL_MS) {
			eventCheckAccumulator = 0;

			const roll = Math.random();
			if (roll < CRASH_PROBABILITY) {
				const multiplier = applyCrash();
				newPrice *= multiplier;
				// Toast will fire outside the update to avoid nested store access
				setTimeout(() => {
					addToast('warning', '📉', 'BTC Crash!', `Price dropped to ${formatCurrency(newPrice)}`, {
						color: '#FF4444',
						durationMs: 5000,
					});
				}, 0);
			} else if (roll < CRASH_PROBABILITY + MOON_PROBABILITY) {
				const multiplier = applyMoon();
				newPrice *= multiplier;
				setTimeout(() => {
					addToast('success', '🚀', 'BTC Moon!', `Price surged to ${formatCurrency(newPrice)}`, {
						color: '#F7931A',
						durationMs: 5000,
					});
				}, 0);
			}
		}

		newPrice = Math.max(1000, newPrice);

		// Record price history at intervals
		let newHistory = s.crypto.btcPriceHistory;
		if (priceRecordAccumulator >= PRICE_RECORD_INTERVAL_MS) {
			priceRecordAccumulator = 0;
			newHistory = [...s.crypto.btcPriceHistory, newPrice];
			if (newHistory.length > MAX_HISTORY) {
				newHistory = newHistory.slice(newHistory.length - MAX_HISTORY);
			}
		}

		return {
			...s,
			crypto: {
				...s.crypto,
				btcPrice: newPrice,
				btcPriceHistory: newHistory,
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
}
