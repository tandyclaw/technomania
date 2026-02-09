/**
 * ngPlus.ts — New Game+ derived stores and utilities
 */

import { derived } from 'svelte/store';
import { gameState, getNgPlusCostMultiplier } from './gameState';
import { getPlanetCostMultiplier } from '$lib/systems/PrestigeSystem';

/** Reactive combined cost multiplier (NG+ × planet chain) */
export const ngPlusCostMultiplier = derived(gameState, ($gs) =>
	getNgPlusCostMultiplier($gs.ngPlusLevel) * getPlanetCostMultiplier($gs.prestigeCount)
);

/** NG+ level as a readable store */
export const ngPlusLevel = derived(gameState, ($gs) => $gs.ngPlusLevel);

/**
 * NG+ color tint per level (subtle hue shift on the UI)
 * Returns a CSS hue-rotate filter value
 */
export function getNgPlusHueShift(level: number): number {
	if (level <= 0) return 0;
	// Each NG+ rotates hue by 15deg, wraps at 360
	return (level * 15) % 360;
}

/**
 * NG+ accent color per level
 */
export function getNgPlusAccentColor(level: number): string {
	const colors = [
		'', // 0: default
		'#FF6B6B', // NG+1: red tint
		'#C084FC', // NG+2: purple tint
		'#34D399', // NG+3: emerald tint
		'#FBBF24', // NG+4: amber tint
		'#60A5FA', // NG+5: blue tint
		'#F472B6', // NG+6: pink tint
	];
	if (level <= 0) return '';
	return colors[Math.min(level, colors.length - 1)] ?? colors[colors.length - 1];
}
