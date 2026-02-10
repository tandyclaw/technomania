/**
 * BigNumber.ts — Wrapper around break_infinity.js
 * Provides formatted display for idle game numbers
 */

import Decimal from 'break_infinity.js';

export { Decimal };

const SUFFIXES = [
	'', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
	'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg'
];

/**
 * Add commas to a number string (integer part only)
 * e.g., "1234" → "1,234"
 */
function addCommas(numStr: string): string {
	const parts = numStr.split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.');
}

/**
 * Format a Decimal number for display
 * - Under 1000: commas + appropriate decimals
 * - 1K to 1e33 (decillion range): suffix notation
 * - Above 1e33: scientific notation
 */
export function formatNumber(value: Decimal | number, decimals = 2): string {
	const dec = value instanceof Decimal ? value : new Decimal(value);

	// Handle edge cases: NaN, Infinity, negative
	if (!isFinite(dec.mantissa) || !isFinite(dec.exponent)) return dec.toString();
	if (dec.lt(0)) return '-' + formatNumber(dec.neg(), decimals);

	if (dec.lt(1000)) {
		const num = dec.toNumber();
		if (num < 10) {
			return addCommas(num.toFixed(decimals));
		}
		return addCommas(Math.floor(num).toString());
	}

	const exp = Math.floor(dec.log10());
	const suffixIndex = Math.floor(exp / 3);

	// Above 1e33 (after decillion / beyond our suffix table) → scientific notation
	if (suffixIndex >= SUFFIXES.length) {
		return dec.toExponential(decimals);
	}

	const divisor = new Decimal(10).pow(suffixIndex * 3);
	const shortened = dec.div(divisor).toNumber();
	return shortened.toFixed(decimals) + SUFFIXES[suffixIndex];
}

/**
 * Format a number as currency
 * - Under $1000: always show 2 decimal places with commas
 * - Above: use standard suffix notation
 */
export function formatCurrency(value: Decimal | number, decimals = 2): string {
	const dec = value instanceof Decimal ? value : new Decimal(value);

	// Handle edge cases
	if (!isFinite(dec.mantissa) || !isFinite(dec.exponent)) return '$' + dec.toString();
	if (dec.lt(0)) return '-$' + formatNumber(dec.neg(), decimals);

	if (dec.lt(1000)) {
		return '$' + addCommas(dec.toNumber().toFixed(2));
	}

	return '$' + formatNumber(value, decimals);
}

/**
 * Format power in MW
 */
export function formatPower(value: number): string {
	if (value < 1000) return value.toFixed(1) + ' MW';
	return formatNumber(value, 1) + ' MW';
}
