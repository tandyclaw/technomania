/**
 * divisions/index.ts — Centralized division metadata and tier data
 * Used by the DivisionDetailTemplate and other UI components
 *
 * Generic category naming — focused on the mission, not brands
 */

import { SPACEX_TIERS, SPACEX_COLOR, SPACEX_ICON, SPACEX_NAME } from './SpaceX';
import { TESLA_TIERS, TESLA_COLOR, TESLA_ICON, TESLA_NAME } from './Tesla';
import { TESLA_ENERGY_TIERS, TESLA_ENERGY_COLOR, TESLA_ENERGY_ICON, TESLA_ENERGY_NAME } from './TeslaEnergy';
import { AI_TIERS, AI_COLOR, AI_ICON, AI_NAME } from './AI';
import { TUNNELS_TIERS, TUNNELS_COLOR, TUNNELS_ICON, TUNNELS_NAME } from './Tunnels';
import { ROBOTICS_TIERS, ROBOTICS_COLOR, ROBOTICS_ICON, ROBOTICS_NAME } from './Robotics';
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
		description: 'Scale production. Build anything.',
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
	ai: {
		id: 'ai',
		name: AI_NAME,
		icon: AI_ICON,
		color: AI_COLOR,
		description: 'Build intelligence. From chatbots to AGI.',
		tiers: AI_TIERS,
	},
	tunnels: {
		id: 'tunnels',
		name: TUNNELS_NAME,
		icon: TUNNELS_ICON,
		color: TUNNELS_COLOR,
		description: 'Dig tunnels. Move people and freight underground.',
		tiers: TUNNELS_TIERS,
	},
	robotics: {
		id: 'robotics',
		name: ROBOTICS_NAME,
		icon: ROBOTICS_ICON,
		color: ROBOTICS_COLOR,
		description: 'Build robots. Automate everything.',
		tiers: ROBOTICS_TIERS,
	},
};

/**
 * Get division metadata by id, or null if not found
 */
export function getDivision(id: string): DivisionMeta | null {
	return DIVISIONS[id] ?? null;
}
