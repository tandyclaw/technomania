/**
 * SeasonalEventSystem.ts — Time-limited seasonal bonuses tied to real calendar dates.
 * Checks date on game load, no server needed.
 */

import { writable, derived, get } from 'svelte/store';
import { gameState } from '$lib/stores/gameState';
import { addBuff } from '$lib/stores/eventStore';
import { addNotification } from '$lib/stores/eventStore';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SeasonalEvent {
	id: string;
	name: string;
	icon: string;
	description: string;
	/** CSS color for banner */
	color: string;
	/** Tailwind gradient classes */
	gradient: string;
	/** Revenue multiplier (1 = no bonus) */
	revenueMultiplier: number;
	/** Production speed multiplier (1 = no bonus) */
	speedMultiplier: number;
	/** Progress bar color override (CSS) */
	progressBarColor?: string;
	/** Check if this event is active for a given date */
	isActive: (date: Date) => boolean;
}

export interface SeasonalEventState {
	activeEvent: SeasonalEvent | null;
	participatedEvents: string[]; // event IDs the player has seen
}

// ─── Event Definitions ───────────────────────────────────────────────────────

function dayMonth(d: Date): [number, number] {
	return [d.getMonth() + 1, d.getDate()];
}

/** Get last Friday of November for a given year */
function getBlackFriday(year: number): Date {
	// Thanksgiving = 4th Thursday of November
	const nov = new Date(year, 10, 1); // Nov 1
	let thursdayCount = 0;
	let day = 0;
	for (let i = 1; i <= 30; i++) {
		const d = new Date(year, 10, i);
		if (d.getDay() === 4) {
			thursdayCount++;
			if (thursdayCount === 4) {
				day = i + 1; // Friday after
				break;
			}
		}
	}
	return new Date(year, 10, day);
}

export const SEASONAL_EVENTS: SeasonalEvent[] = [
	{
		id: 'new_year',
		name: '🎆 New Year Celebration',
		icon: '🎆',
		description: 'New year, new empire! All revenue boosted.',
		color: '#FFD700',
		gradient: 'from-yellow-600 to-amber-500',
		revenueMultiplier: 2.0,
		speedMultiplier: 1.25,
		progressBarColor: '#FFD700',
		isActive: (d) => {
			const [m, day] = dayMonth(d);
			return m === 1 && day <= 3;
		},
	},
	{
		id: 'valentines',
		name: '💕 Valentine\'s Day',
		icon: '💕',
		description: 'Love is in the air! Double revenue from all divisions.',
		color: '#FF69B4',
		gradient: 'from-pink-600 to-rose-500',
		revenueMultiplier: 2.0,
		speedMultiplier: 1.0,
		progressBarColor: '#FF69B4',
		isActive: (d) => {
			const [m, day] = dayMonth(d);
			return m === 2 && day >= 11 && day <= 17;
		},
	},
	{
		id: 'pi_day',
		name: '🥧 Pi Day',
		icon: '🥧',
		description: 'π = 3.14159... Production speed boosted by 31.4%!',
		color: '#6366F1',
		gradient: 'from-indigo-600 to-violet-500',
		revenueMultiplier: 1.314,
		speedMultiplier: 1.314,
		progressBarColor: '#6366F1',
		isActive: (d) => {
			const [m, day] = dayMonth(d);
			return m === 3 && day === 14;
		},
	},
	{
		id: 'earth_day',
		name: '🌍 Earth Day',
		icon: '🌍',
		description: 'Go green! Energy division gets massive boost.',
		color: '#22C55E',
		gradient: 'from-green-600 to-emerald-500',
		revenueMultiplier: 1.5,
		speedMultiplier: 1.5,
		progressBarColor: '#22C55E',
		isActive: (d) => {
			const [m, day] = dayMonth(d);
			return m === 4 && day === 22;
		},
	},
	{
		id: 'summer_solstice',
		name: '☀️ Summer Solstice',
		icon: '☀️',
		description: 'Longest day of the year — maximum energy production!',
		color: '#F59E0B',
		gradient: 'from-amber-500 to-yellow-400',
		revenueMultiplier: 1.75,
		speedMultiplier: 1.5,
		progressBarColor: '#F59E0B',
		isActive: (d) => {
			const [m, day] = dayMonth(d);
			return m === 6 && day >= 20 && day <= 22;
		},
	},
	{
		id: 'halloween',
		name: '🎃 Halloween',
		icon: '🎃',
		description: 'Spooky season! Trick or treat — mystery multipliers!',
		color: '#F97316',
		gradient: 'from-orange-600 to-amber-600',
		revenueMultiplier: 2.0,
		speedMultiplier: 1.31,
		progressBarColor: '#F97316',
		isActive: (d) => {
			const [m, day] = dayMonth(d);
			return m === 10 && day >= 28 && day <= 31;
		},
	},
	{
		id: 'black_friday',
		name: '🏷️ Black Friday',
		icon: '🏷️',
		description: 'Everything on sale! Upgrade costs reduced, revenue doubled!',
		color: '#1F2937',
		gradient: 'from-gray-800 to-gray-600',
		revenueMultiplier: 2.5,
		speedMultiplier: 1.0,
		progressBarColor: '#EF4444',
		isActive: (d) => {
			const bf = getBlackFriday(d.getFullYear());
			const diff = Math.abs(d.getTime() - bf.getTime());
			return diff < 24 * 60 * 60 * 1000; // same day
		},
	},
	{
		id: 'winter_holiday',
		name: '🎄 Winter Holiday',
		icon: '🎄',
		description: 'Happy holidays! Gift of speed and revenue!',
		color: '#DC2626',
		gradient: 'from-red-600 to-green-600',
		revenueMultiplier: 2.0,
		speedMultiplier: 1.5,
		progressBarColor: '#DC2626',
		isActive: (d) => {
			const [m, day] = dayMonth(d);
			return m === 12 && day >= 20 && day <= 31;
		},
	},
];

// ─── Store ───────────────────────────────────────────────────────────────────

export const seasonalEventStore = writable<SeasonalEventState>({
	activeEvent: null,
	participatedEvents: [],
});

export const activeSeasonalEvent = derived(seasonalEventStore, ($s) => $s.activeEvent);

// ─── Initialization ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'moonshot-seasonal-participated';

function loadParticipated(): string[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function saveParticipated(ids: string[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
	} catch {
		// storage full, ignore
	}
}

/**
 * Check for active seasonal events. Call on game load.
 * Returns the active event (if any) for the game loop to apply multipliers.
 */
export function initSeasonalEvents(): SeasonalEvent | null {
	const now = new Date();
	const active = SEASONAL_EVENTS.find((e) => e.isActive(now)) ?? null;
	const participated = loadParticipated();

	if (active && !participated.includes(active.id)) {
		participated.push(active.id);
		saveParticipated(participated);
	}

	seasonalEventStore.set({
		activeEvent: active,
		participatedEvents: participated,
	});

	if (active) {
		// Add a long-lasting buff so the buff indicator shows it
		addBuff({
			id: `seasonal_${active.id}`,
			name: active.name,
			icon: active.icon,
			durationMs: 24 * 60 * 60 * 1000, // 24h (refreshes on reload)
			effect: `${active.revenueMultiplier}x revenue, ${active.speedMultiplier}x speed`,
			color: active.color,
		});

		addNotification('info', active.icon, active.name, active.description);
	}

	return active;
}

/**
 * Get current seasonal multipliers for the production system.
 */
export function getSeasonalMultipliers(): { revenue: number; speed: number } {
	const state = get(seasonalEventStore);
	if (!state.activeEvent) return { revenue: 1, speed: 1 };
	return {
		revenue: state.activeEvent.revenueMultiplier,
		speed: state.activeEvent.speedMultiplier,
	};
}

/**
 * Get seasonal progress bar color override (or null).
 */
export function getSeasonalProgressBarColor(): string | null {
	const state = get(seasonalEventStore);
	return state.activeEvent?.progressBarColor ?? null;
}

/**
 * Get count of seasonal events participated in (for achievements).
 */
export function getSeasonalParticipationCount(): number {
	const state = get(seasonalEventStore);
	return state.participatedEvents.length;
}
