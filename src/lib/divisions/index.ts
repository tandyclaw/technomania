/**
 * divisions/index.ts — Centralized division metadata and tier data
 * Used by the DivisionDetailTemplate and other UI components
 *
 * Generic category naming — focused on the mission, not brands
 */

import { SPACEX_TIERS, SPACEX_COLOR, SPACEX_ICON, SPACEX_NAME } from './SpaceX';
import { TESLA_TIERS, TESLA_COLOR, TESLA_ICON, TESLA_NAME } from './Tesla';
import { TESLA_ENERGY_TIERS, TESLA_ENERGY_COLOR, TESLA_ENERGY_ICON, TESLA_ENERGY_NAME } from './TeslaEnergy';
import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export interface TierData {
	name: string;
	description: string;
	tooltip: string;
	config: ProductionConfig;
	powerMW?: number;
}

export interface DivisionMeta {
	id: string;
	name: string;
	icon: string;
	color: string;
	description: string;
	tiers: TierData[];
}

export const DIVISIONS: Record<string, DivisionMeta> = {
	spacex: {
		id: 'spacex',
		name: SPACEX_NAME,
		icon: SPACEX_ICON,
		color: SPACEX_COLOR,
		description: 'Build rockets. Get to Mars.',
		tiers: SPACEX_TIERS,
	},
	tesla: {
		id: 'tesla',
		name: TESLA_NAME,
		icon: TESLA_ICON,
		color: TESLA_COLOR,
		description: 'Electrify transportation. End oil.',
		tiers: TESLA_TIERS,
	},
	teslaenergy: {
		id: 'teslaenergy',
		name: TESLA_ENERGY_NAME,
		icon: TESLA_ENERGY_ICON,
		color: TESLA_ENERGY_COLOR,
		description: 'Solar & batteries. Power everything.',
		tiers: TESLA_ENERGY_TIERS,
	},
};

/**
 * Get division metadata by id, or null if not found
 */
export function getDivision(id: string): DivisionMeta | null {
	return DIVISIONS[id] ?? null;
}
