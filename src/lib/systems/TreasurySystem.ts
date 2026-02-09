/**
 * TreasurySystem.ts — Investment system with balanced risk/reward
 *
 * Investment types (designed to not break the core game):
 * 1. Savings Account: 5% APY, no risk, instant liquidity
 * 2. Index Fund: ±15% volatility, slight upward trend
 * 3. Bitcoin: ±40% volatility, occasional crashes/moons
 * 4. Meme Coins: ±80% volatility, random pumps, pure gambling
 *
 * Balance principle: Investments should provide 5-15% of income at most,
 * not replace the core production loop.
 */

import { get } from 'svelte/store';
import { gameState, type TreasuryState } from '$lib/stores/gameState';
import { addToast } from '$lib/stores/toastStore';
import { formatCurrency } from '$lib/engine/BigNumber';

// ═══ CONFIGURATION ══════════════════════════════════════════════════════════

/** Savings APY (per game-year, converted to per-tick) */
const SAVINGS_APY = 0.05;

/** Index fund base price and volatility */
const INDEX_BASE_PRICE = 100;
const INDEX_VOLATILITY = 0.15; // ±15%
const INDEX_TREND = 0.02; // slight upward bias

/** Bitcoin base price and volatility */
const BTC_BASE_PRICE = 42000;
const BTC_VOLATILITY = 0.40; // ±40%

/** Meme coin base price and volatility */
const DOGE_BASE_PRICE = 0.08;
const DOGE_VOLATILITY = 0.80; // ±80%

/** Price history length */
const MAX_HISTORY = 60;

/** Price update interval (ms) */
const PRICE_UPDATE_INTERVAL = 3000;

/** Event check interval (ms) */
const EVENT_CHECK_INTERVAL = 15000;

/** Event probabilities */
const BTC_CRASH_PROB = 0.03;
const BTC_MOON_PROB = 0.03;
const DOGE_CRASH_PROB = 0.05;
const DOGE_MOON_PROB = 0.05;
const MEME_PUMP_PROB = 0.03;

const MEME_PUMP_MIN_MS = 15000;
const MEME_PUMP_MAX_MS = 45000;

const MEME_MESSAGES = [
	'Much wow, very gains 🐕',
	'Diamond hands activated 💎',
	'HODL gang assemble 📈',
	'Meme magic is real ✨',
	'To the moon!! 🚀',
];

// Accumulators (ephemeral)
let priceAccum = 0;
let eventAccum = 0;
let phaseOffset = Math.random() * Math.PI * 2;
let indexPhase = Math.random() * Math.PI * 2;
let btcPhase = Math.random() * Math.PI * 2;
let dogePhase = Math.random() * Math.PI * 2;

// ═══ PRICE GENERATION ═══════════════════════════════════════════════════════

function generateIndexPrice(gameTimeMs: number, currentPrice: number): number {
	const t = gameTimeMs / 1000;
	
	// Slow drift with trend
	const trend = 1 + (t / 36000) * INDEX_TREND; // ~2% per "game hour"
	
	// Volatility layers
	const slow = Math.sin((t / 300) * Math.PI * 2 + indexPhase) * 0.08;
	const medium = Math.sin((t / 60) * Math.PI * 2 + indexPhase * 1.5) * 0.05;
	const noise = (Math.random() - 0.5) * 0.04;
	
	const factor = trend * (1 + slow + medium + noise);
	const targetPrice = INDEX_BASE_PRICE * factor;
	
	// Smooth blending
	return currentPrice * 0.9 + targetPrice * 0.1;
}

function generateBtcPrice(gameTimeMs: number, currentPrice: number): number {
	const t = gameTimeMs / 1000;
	
	// Multiple sine waves for realistic volatility
	const macro = Math.sin((t / 300) * Math.PI * 2 + btcPhase) * 0.25;
	const medium = Math.sin((t / 90) * Math.PI * 2 + btcPhase * 1.7) * 0.12;
	const micro = Math.sin((t / 20) * Math.PI * 2 + btcPhase * 3.1) * 0.05;
	const noise = (Math.random() - 0.5) * 0.06;
	
	const factor = 1 + macro + medium + micro + noise;
	const targetPrice = BTC_BASE_PRICE * factor;
	
	return Math.max(1000, currentPrice * 0.85 + targetPrice * 0.15);
}

function generateDogePrice(gameTimeMs: number, currentPrice: number): number {
	const t = gameTimeMs / 1000;
	
	// More volatile than BTC
	const macro = Math.sin((t / 180) * Math.PI * 2 + dogePhase) * 0.35;
	const medium = Math.sin((t / 45) * Math.PI * 2 + dogePhase * 2.3) * 0.20;
	const micro = Math.sin((t / 10) * Math.PI * 2 + dogePhase * 4.1) * 0.10;
	const noise = (Math.random() - 0.5) * 0.16;
	
	const factor = 1 + macro + medium + micro + noise;
	const targetPrice = DOGE_BASE_PRICE * factor;
	
	return Math.max(0.001, currentPrice * 0.8 + targetPrice * 0.2);
}

// ═══ SAVINGS ACCOUNT ════════════════════════════════════════════════════════

export function buySavings(amount: number): boolean {
	const state = get(gameState);
	if (amount <= 0 || amount > state.cash) return false;
	
	gameState.update(s => ({
		...s,
		cash: s.cash - amount,
		treasury: {
			...s.treasury,
			savings: s.treasury.savings + amount,
		},
	}));
	
	addToast('success', '🏦', 'Deposited', formatCurrency(amount) + ' to savings', {
		color: '#44AA77',
		durationMs: 2000,
	});
	
	return true;
}

export function withdrawSavings(amount: number): boolean {
	const state = get(gameState);
	if (amount <= 0 || amount > state.treasury.savings) return false;
	
	gameState.update(s => ({
		...s,
		cash: s.cash + amount,
		treasury: {
			...s.treasury,
			savings: s.treasury.savings - amount,
		},
	}));
	
	addToast('success', '💵', 'Withdrew', formatCurrency(amount) + ' from savings', {
		color: '#44AA77',
		durationMs: 2000,
	});
	
	return true;
}

// ═══ INDEX FUND ═════════════════════════════════════════════════════════════

export function buyIndex(amount: number): boolean {
	const state = get(gameState);
	if (amount <= 0 || amount > state.cash) return false;
	
	const shares = amount / state.treasury.indexPrice;
	
	gameState.update(s => ({
		...s,
		cash: s.cash - amount,
		treasury: {
			...s.treasury,
			indexShares: s.treasury.indexShares + shares,
			indexInvested: s.treasury.indexInvested + amount,
		},
	}));
	
	addToast('success', '📈', 'Bought Index', `${shares.toFixed(2)} shares for ${formatCurrency(amount)}`, {
		color: '#4488FF',
		durationMs: 2000,
	});
	
	return true;
}

export function sellIndex(shares: number): boolean {
	const state = get(gameState);
	if (shares <= 0 || shares > state.treasury.indexShares) return false;
	
	const value = shares * state.treasury.indexPrice;
	
	gameState.update(s => ({
		...s,
		cash: s.cash + value,
		treasury: {
			...s.treasury,
			indexShares: s.treasury.indexShares - shares,
		},
	}));
	
	addToast('success', '💵', 'Sold Index', `${shares.toFixed(2)} shares for ${formatCurrency(value)}`, {
		color: '#4488FF',
		durationMs: 2000,
	});
	
	return true;
}

export function getIndexValue(treasury: TreasuryState): number {
	return treasury.indexShares * treasury.indexPrice;
}

// ═══ BITCOIN ════════════════════════════════════════════════════════════════

export function buyBtc(amount: number): boolean {
	const state = get(gameState);
	if (amount <= 0 || amount > state.cash) return false;
	
	const btc = amount / state.treasury.btcPrice;
	
	gameState.update(s => ({
		...s,
		cash: s.cash - amount,
		treasury: {
			...s.treasury,
			btcOwned: s.treasury.btcOwned + btc,
			btcInvested: s.treasury.btcInvested + amount,
		},
	}));
	
	addToast('success', '₿', 'Bought BTC', `${btc.toFixed(6)} BTC for ${formatCurrency(amount)}`, {
		color: '#F7931A',
		durationMs: 2000,
	});
	
	return true;
}

export function sellBtc(btcAmount: number): boolean {
	const state = get(gameState);
	if (btcAmount <= 0 || btcAmount > state.treasury.btcOwned) return false;
	
	const value = btcAmount * state.treasury.btcPrice;
	
	gameState.update(s => ({
		...s,
		cash: s.cash + value,
		treasury: {
			...s.treasury,
			btcOwned: s.treasury.btcOwned - btcAmount,
		},
	}));
	
	addToast('success', '💵', 'Sold BTC', `${btcAmount.toFixed(6)} BTC for ${formatCurrency(value)}`, {
		color: '#F7931A',
		durationMs: 2000,
	});
	
	return true;
}

export function getBtcPortfolioValue(treasury: TreasuryState): number {
	return treasury.btcOwned * treasury.btcPrice;
}

export function getBtcPnL(treasury: TreasuryState): number {
	return getBtcPortfolioValue(treasury) - treasury.btcInvested;
}

// ═══ MEME COINS (DOGE) ══════════════════════════════════════════════════════

export function buyDoge(amount: number): boolean {
	const state = get(gameState);
	if (amount <= 0 || amount > state.cash) return false;
	
	const doge = amount / state.treasury.dogePrice;
	
	gameState.update(s => ({
		...s,
		cash: s.cash - amount,
		treasury: {
			...s.treasury,
			dogeOwned: s.treasury.dogeOwned + doge,
			dogeInvested: s.treasury.dogeInvested + amount,
		},
	}));
	
	const dogeStr = doge >= 1000000 ? (doge / 1000000).toFixed(2) + 'M' :
	                doge >= 1000 ? (doge / 1000).toFixed(1) + 'K' :
	                doge.toFixed(2);
	
	addToast('success', '🐕', 'Bought Meme Coins', `${dogeStr} for ${formatCurrency(amount)}`, {
		color: '#C2A633',
		durationMs: 2000,
	});
	
	return true;
}

export function sellDoge(dogeAmount: number): boolean {
	const state = get(gameState);
	if (dogeAmount <= 0 || dogeAmount > state.treasury.dogeOwned) return false;
	
	const value = dogeAmount * state.treasury.dogePrice;
	
	gameState.update(s => ({
		...s,
		cash: s.cash + value,
		treasury: {
			...s.treasury,
			dogeOwned: s.treasury.dogeOwned - dogeAmount,
		},
	}));
	
	const dogeStr = dogeAmount >= 1000000 ? (dogeAmount / 1000000).toFixed(2) + 'M' :
	                dogeAmount >= 1000 ? (dogeAmount / 1000).toFixed(1) + 'K' :
	                dogeAmount.toFixed(2);
	
	addToast('success', '💵', 'Sold Meme Coins', `${dogeStr} for ${formatCurrency(value)}`, {
		color: '#C2A633',
		durationMs: 2000,
	});
	
	return true;
}

export function getDogePortfolioValue(treasury: TreasuryState): number {
	return treasury.dogeOwned * treasury.dogePrice;
}

export function getDogePnL(treasury: TreasuryState): number {
	return getDogePortfolioValue(treasury) - treasury.dogeInvested;
}

// ═══ TOTALS ═════════════════════════════════════════════════════════════════

export function getTotalTreasuryValue(treasury: TreasuryState): number {
	return treasury.savings +
	       getIndexValue(treasury) +
	       getBtcPortfolioValue(treasury) +
	       getDogePortfolioValue(treasury);
}

export function getTotalTreasuryPnL(treasury: TreasuryState): number {
	const totalInvested = treasury.indexInvested + treasury.btcInvested + treasury.dogeInvested;
	const currentValue = getIndexValue(treasury) + getBtcPortfolioValue(treasury) + getDogePortfolioValue(treasury);
	return currentValue - totalInvested;
}

// ═══ TICK ═══════════════════════════════════════════════════════════════════

export function tickTreasury(deltaMs: number): void {
	priceAccum += deltaMs;
	eventAccum += deltaMs;
	
	gameState.update(s => {
		const treasury = { ...s.treasury };
		const gameTimeMs = s.stats.playTimeMs;
		
		// Accrue savings interest (converted from APY to per-tick)
		// APY 5% = ~0.000000158% per 100ms tick
		const interestPerTick = SAVINGS_APY / (365 * 24 * 60 * 60 * 10);
		treasury.savings *= (1 + interestPerTick);
		
		// Update prices
		treasury.indexPrice = generateIndexPrice(gameTimeMs, treasury.indexPrice);
		treasury.btcPrice = generateBtcPrice(gameTimeMs, treasury.btcPrice);
		treasury.dogePrice = generateDogePrice(gameTimeMs, treasury.dogePrice);
		
		// Apply meme pump
		if (treasury.memePumpMs > 0) {
			treasury.memePumpMs = Math.max(0, treasury.memePumpMs - deltaMs);
			treasury.dogePrice *= treasury.memePumpMultiplier;
			
			if (treasury.memePumpMs <= 0) {
				treasury.memePumpMultiplier = 1;
				setTimeout(() => {
					addToast('info', '📉', 'Hype Fading', 'Meme pump wearing off...', {
						color: '#C2A633',
						durationMs: 3000,
					});
				}, 0);
			}
		}
		
		// Event checks
		if (eventAccum >= EVENT_CHECK_INTERVAL) {
			eventAccum = 0;
			
			// BTC events
			const btcRoll = Math.random();
			if (btcRoll < BTC_CRASH_PROB) {
				const crash = 0.7 + Math.random() * 0.1; // -20% to -30%
				treasury.btcPrice *= crash;
				setTimeout(() => {
					addToast('warning', '📉', 'BTC Crash!', `Price dropped to ${formatCurrency(treasury.btcPrice)}`, {
						color: '#FF4444',
						durationMs: 4000,
					});
				}, 0);
			} else if (btcRoll < BTC_CRASH_PROB + BTC_MOON_PROB) {
				const moon = 1.2 + Math.random() * 0.2; // +20% to +40%
				treasury.btcPrice *= moon;
				setTimeout(() => {
					addToast('success', '🚀', 'BTC Moon!', `Price surged to ${formatCurrency(treasury.btcPrice)}`, {
						color: '#F7931A',
						durationMs: 4000,
					});
				}, 0);
			}
			
			// Meme coin events
			const dogeRoll = Math.random();
			if (dogeRoll < MEME_PUMP_PROB && treasury.memePumpMs <= 0) {
				const mult = 1.5 + Math.random() * 1.5; // 1.5x to 3x
				const duration = MEME_PUMP_MIN_MS + Math.random() * (MEME_PUMP_MAX_MS - MEME_PUMP_MIN_MS);
				treasury.memePumpMultiplier = mult;
				treasury.memePumpMs = duration;
				const msg = MEME_MESSAGES[Math.floor(Math.random() * MEME_MESSAGES.length)];
				const pct = Math.round((mult - 1) * 100);
				setTimeout(() => {
					addToast('success', '🐕', `Meme Pump! +${pct}%`, msg, {
						color: '#C2A633',
						durationMs: 5000,
					});
				}, 0);
			} else if (dogeRoll < MEME_PUMP_PROB + DOGE_CRASH_PROB && treasury.memePumpMs <= 0) {
				const crash = 0.5 + Math.random() * 0.25; // -25% to -50%
				treasury.dogePrice *= crash;
				setTimeout(() => {
					addToast('warning', '📉', 'Meme Dump!', `Price crashed to $${treasury.dogePrice.toFixed(4)}`, {
						color: '#FF4444',
						durationMs: 4000,
					});
				}, 0);
			}
		}
		
		// Clamp prices
		treasury.btcPrice = Math.max(1000, treasury.btcPrice);
		treasury.dogePrice = Math.max(0.001, treasury.dogePrice);
		
		// Record history
		if (priceAccum >= PRICE_UPDATE_INTERVAL) {
			priceAccum = 0;
			
			treasury.indexHistory = [...treasury.indexHistory, treasury.indexPrice].slice(-MAX_HISTORY);
			treasury.btcHistory = [...treasury.btcHistory, treasury.btcPrice].slice(-MAX_HISTORY);
			treasury.dogeHistory = [...treasury.dogeHistory, treasury.dogePrice].slice(-MAX_HISTORY);
		}
		
		return { ...s, treasury };
	});
}

export function resetTreasuryAccumulators(): void {
	priceAccum = 0;
	eventAccum = 0;
	phaseOffset = Math.random() * Math.PI * 2;
	indexPhase = Math.random() * Math.PI * 2;
	btcPhase = Math.random() * Math.PI * 2;
	dogePhase = Math.random() * Math.PI * 2;
}
