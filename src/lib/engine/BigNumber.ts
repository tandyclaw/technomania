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
 * Format a Decimal number for display
 * e.g., 1234 → "1.23K", 1234567 → "1.23M"
 */
export function formatNumber(value: Decimal | number, decimals = 2): string {
	const dec = value instanceof Decimal ? value : new Decimal(value);

	if (dec.lt(1000)) {
		return dec.toFixed(dec.lt(10) ? decimals : 0);
	}

	const exp = Math.floor(dec.log10());
	const suffixIndex = Math.floor(exp / 3);

	if (suffixIndex < SUFFIXES.length) {
		const divisor = new Decimal(10).pow(suffixIndex * 3);
		const shortened = dec.div(divisor).toNumber();
		return shortened.toFixed(decimals) + SUFFIXES[suffixIndex];
	}

	// Scientific notation for very large numbers
	return dec.toExponential(decimals);
}

/**
 * Format a number as currency
 * e.g., 1234567 → "$1.23M"
 */
export function formatCurrency(value: Decimal | number, decimals = 2): string {
	return '$' + formatNumber(value, decimals);
}

/**
 * Format power in MW
 */
export function formatPower(value: number): string {
	if (value < 1000) return value.toFixed(1) + ' MW';
	return formatNumber(value, 1) + ' MW';
}
