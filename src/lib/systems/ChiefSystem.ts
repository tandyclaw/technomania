/**
 * ChiefSystem.ts — Division Chief / Key Hire automation system
 * 
 * The "Manager" mechanic from Adventure Capitalist — THE most important unlock.
 * Each division gets named Key Hires inspired by real executives.
 * Hiring a chief auto-runs production for that division.
 * 
 * Chief levels provide escalating speed boosts:
 * Level 1: 1x speed (basic automation — no more tapping!)
 * Level 2: 2x speed
 * Level 3: 5x speed  
 * Level 4: 10x speed
 * Level 5: 50x speed
 * Level 6: 100x speed (full autonomy)
 */

export interface ChiefData {
	name: string;
	title: string;
	inspired: string; // Real person they're inspired by
	quip: string; // One-liner on hire
	portrait: string; // Emoji portrait
}

export interface ChiefLevelData {
	level: number;
	cost: number;
	speedMultiplier: number;
	label: string;
	description: string;
}

/** Chief characters per division */
export const DIVISION_CHIEFS: Record<string, ChiefData> = {
	teslaenergy: {
		name: 'Drew Brightfield',
		title: 'VP of Energy Operations',
		inspired: 'Drew Baglino',
		quip: '"The sun never stops. Neither do I."',
		portrait: '⚡',
	},
	spacex: {
		name: 'Gwynne Sterling',
		title: 'President & COO',
		inspired: 'Gwynne Shotwell',
		quip: '"Rockets don\'t build themselves. Well, now they do."',
		portrait: '🚀',
	},
	tesla: {
		name: 'JB Strasser',
		title: 'Chief Production Officer',
		inspired: 'JB Straubel',
		quip: '"The factory is the product. Optimize everything."',
		portrait: '🏭',
	},
	ai: {
		name: 'Dr. Nova Chen',
		title: 'VP of AI Research',
		inspired: 'Andrej Karpathy',
		quip: '"Intelligence isn\'t artificial when it\'s making you money."',
		portrait: '🧠',
	},
	tunnels: {
		name: 'Marcus Stone',
		title: 'VP of Underground Operations',
		inspired: 'Steve Davis',
		quip: '"The fastest route is always through."',
		portrait: '🕳️',
	},
	robotics: {
		name: 'Yuki Tanaka',
		title: 'VP of Robotics Engineering',
		inspired: 'Milan Kovac',
		quip: '"Build the machine that builds the machine."',
		portrait: '🤖',
	},
};

/** Chief upgrade levels — same for all divisions */
export const CHIEF_LEVELS: ChiefLevelData[] = [
	{
		level: 1,
		cost: 7500, // ~20-25 min in, first big milestone
		speedMultiplier: 1,
		label: 'Hired',
		description: 'Basic automation — production runs automatically',
	},
	{
		level: 2,
		cost: 75000,
		speedMultiplier: 2,
		label: 'Experienced',
		description: '2x production speed',
	},
	{
		level: 3,
		cost: 1500000,
		speedMultiplier: 5,
		label: 'Expert',
		description: '5x production speed',
	},
	{
		level: 4,
		cost: 40000000,
		speedMultiplier: 10,
		label: 'Legendary',
		description: '10x production speed',
	},
	{
		level: 5,
		cost: 1500000000,
		speedMultiplier: 50,
		label: 'Visionary',
		description: '50x production speed',
	},
	{
		level: 6,
		cost: 150000000000,
		speedMultiplier: 100,
		label: 'Full Autonomy',
		description: '100x production speed — runs itself',
	},
];

/** Division cost multipliers — later divisions have more expensive chiefs */
const DIVISION_CHIEF_COST_MULT: Record<string, number> = {
	teslaenergy: 1,     // Base costs (unlocks at $0)
	spacex: 2,          // Unlocks at $1K
	tesla: 5,           // Unlocks at $10K
	ai: 15,             // Unlocks at $50K
	tunnels: 40,        // Unlocks at $250K
	robotics: 100,      // Unlocks at $1M
};

/**
 * Get the cost for the next chief level, scaled by division
 * Returns null if already at max level
 */
export function getNextChiefCost(currentLevel: number, divisionId?: string): number | null {
	if (currentLevel >= CHIEF_LEVELS.length) return null;
	const baseCost = CHIEF_LEVELS[currentLevel].cost;
	const mult = divisionId ? (DIVISION_CHIEF_COST_MULT[divisionId] ?? 1) : 1;
	return baseCost * mult;
}

/**
 * Get the speed multiplier for a chief level
 */
export function getChiefSpeedMultiplier(chiefLevel: number): number {
	if (chiefLevel === 0) return 0; // No chief = no automation
	const levelData = CHIEF_LEVELS[chiefLevel - 1];
	return levelData?.speedMultiplier ?? 1;
}

/**
 * Get the current chief level data
 */
export function getChiefLevelData(chiefLevel: number): ChiefLevelData | null {
	if (chiefLevel === 0) return null;
	return CHIEF_LEVELS[chiefLevel - 1] ?? null;
}

/**
 * Get the next chief level data
 */
export function getNextChiefLevelData(chiefLevel: number): ChiefLevelData | null {
	if (chiefLevel >= CHIEF_LEVELS.length) return null;
	return CHIEF_LEVELS[chiefLevel] ?? null;
}
