/**
 * divisions/index.ts — Centralized division metadata and tier data
 * Used by the DivisionDetailTemplate and other UI components
 *
 * REBRAND: Real company names — SpaceX, Tesla, Tesla Energy
 */

import { SPACEX_TIERS, SPACEX_COLOR, SPACEX_ICON, SPACEX_NAME } from './SpaceX';
import { TESLA_TIERS, TESLA_COLOR, TESLA_ICON, TESLA_NAME } from './Tesla';
import { TESLA_ENERGY_TIERS, TESLA_ENERGY_COLOR, TESLA_ENERGY_ICON, TESLA_ENERGY_NAME } from './TeslaEnergy';
import type { ProductionConfig } from '$lib/systems/ProductionSystem';

export interface TierData {
	name: string;
	description: string;
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
		description: 'Reusable rockets & Mars colonization',
		tiers: SPACEX_TIERS,
	},
	tesla: {
		id: 'tesla',
		name: TESLA_NAME,
		icon: TESLA_ICON,
		color: TESLA_COLOR,
		description: 'Electric vehicles & Gigafactories',
		tiers: TESLA_TIERS,
	},
	teslaenergy: {
		id: 'teslaenergy',
		name: TESLA_ENERGY_NAME,
		icon: TESLA_ENERGY_ICON,
		color: TESLA_ENERGY_COLOR,
		description: 'Solar energy, Powerwall & Megapack',
		tiers: TESLA_ENERGY_TIERS,
	},
};

/**
 * Get division metadata by id, or null if not found
 */
export function getDivision(id: string): DivisionMeta | null {
	return DIVISIONS[id] ?? null;
}
