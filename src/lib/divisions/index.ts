/**
 * divisions/index.ts — Centralized division metadata and tier data
 * Used by the DivisionDetailTemplate and other UI components
 */

import { APEX_TIERS, APEX_COLOR, APEX_ICON, APEX_NAME } from './ApexRocketry';
import { VOLT_TIERS, VOLT_COLOR, VOLT_ICON, VOLT_NAME } from './VoltMotors';
import { HELIOS_TIERS, HELIOS_COLOR, HELIOS_ICON, HELIOS_NAME } from './HeliosPower';
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
	apex: {
		id: 'apex',
		name: APEX_NAME,
		icon: APEX_ICON,
		color: APEX_COLOR,
		description: 'Reusable rockets & space exploration',
		tiers: APEX_TIERS,
	},
	volt: {
		id: 'volt',
		name: VOLT_NAME,
		icon: VOLT_ICON,
		color: VOLT_COLOR,
		description: 'Electric vehicles & gigafactories',
		tiers: VOLT_TIERS,
	},
	helios: {
		id: 'helios',
		name: HELIOS_NAME,
		icon: HELIOS_ICON,
		color: HELIOS_COLOR,
		description: 'Solar energy, batteries & grid storage',
		tiers: HELIOS_TIERS,
	},
};

/**
 * Get division metadata by id, or null if not found
 */
export function getDivision(id: string): DivisionMeta | null {
	return DIVISIONS[id] ?? null;
}
