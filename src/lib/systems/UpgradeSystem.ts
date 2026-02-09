/**
 * UpgradeSystem.ts — One-time purchasable upgrades (AdCap upgrade shop)
 *
 * Categories: Speed, Revenue, Cost reduction
 * Some upgrades require milestones or tier counts.
 * Purchased upgrades persist until prestige reset (like AdCap).
 */

import { get } from 'svelte/store';
import { gameState, type GameState } from '$lib/stores/gameState';
import { eventBus } from '$lib/engine/EventBus';

export type UpgradeCategory = 'speed' | 'revenue' | 'cost' | 'offline';

export interface Upgrade {
	id: string;
	name: string;
	description: string;
	category: UpgradeCategory;
	cost: number;
	/** Which division this affects, or 'all' for global */
	target: string;
	/** Tier index if targeting a specific tier, -1 for whole division */
	tierIndex: number;
	/** Multiplier value (e.g. 2 = 2x speed, 0.8 = 20% cost reduction) */
	value: number;
	/** Optional: requires this many units of a specific tier */
	requiresTierCount?: { divisionId: string; tierIndex: number; count: number };
	/** Optional: requires a milestone to be unlocked */
	requiresMilestone?: { divisionId: string; tierIndex: number; threshold: number };
}

export const ALL_UPGRADES: Upgrade[] = [
	// === ENERGY UPGRADES (6) ===
	{ id: 'energy_speed_1', name: 'Reactor Overdrive', description: '2x Nuclear Reactor speed', category: 'speed', cost: 5_000, target: 'teslaenergy', tierIndex: 0, value: 2 },
	{ id: 'energy_rev_1', name: 'Solar Concentrators', description: '3x Solar Panel Farm revenue', category: 'revenue', cost: 25_000, target: 'teslaenergy', tierIndex: 1, value: 3 },
	{ id: 'energy_speed_2', name: 'Rapid Deployment', description: '2x all Energy speed', category: 'speed', cost: 500_000, target: 'teslaenergy', tierIndex: -1, value: 2 },
	{ id: 'energy_rev_2', name: 'Orbital Collectors', description: '3x Space Solar Array revenue', category: 'revenue', cost: 2_000_000, target: 'teslaenergy', tierIndex: 4, value: 3, requiresTierCount: { divisionId: 'teslaenergy', tierIndex: 4, count: 10 } },
	{ id: 'energy_cost_1', name: 'Bulk Energy Discount', description: 'Energy tiers cost 20% less', category: 'cost', cost: 100_000, target: 'teslaenergy', tierIndex: -1, value: 0.8 },
	{ id: 'energy_speed_3', name: 'Beaming Amplifiers', description: '3x Wireless Energy Beaming speed', category: 'speed', cost: 10_000_000, target: 'teslaenergy', tierIndex: 5, value: 3, requiresTierCount: { divisionId: 'teslaenergy', tierIndex: 5, count: 5 } },

	// === ROCKETS UPGRADES (6) ===
	{ id: 'rocket_speed_1', name: 'Rapid Turnaround', description: '2x Small Rocket speed', category: 'speed', cost: 10_000, target: 'spacex', tierIndex: 0, value: 2 },
	{ id: 'rocket_rev_1', name: 'Payload Contracts', description: '3x Reusable Booster revenue', category: 'revenue', cost: 50_000, target: 'spacex', tierIndex: 1, value: 3 },
	{ id: 'rocket_speed_2', name: 'Mission Control AI', description: '2x all Rockets speed', category: 'speed', cost: 1_000_000, target: 'spacex', tierIndex: -1, value: 2 },
	{ id: 'rocket_rev_2', name: 'Space Tourism', description: '3x Crew Capsule revenue', category: 'revenue', cost: 5_000_000, target: 'spacex', tierIndex: 2, value: 3, requiresTierCount: { divisionId: 'spacex', tierIndex: 2, count: 10 } },
	{ id: 'rocket_cost_1', name: 'Reusability Savings', description: 'Rocket tiers cost 20% less', category: 'cost', cost: 250_000, target: 'spacex', tierIndex: -1, value: 0.8 },
	{ id: 'rocket_speed_3', name: 'Orbital Refueling', description: '3x Starship speed', category: 'speed', cost: 50_000_000, target: 'spacex', tierIndex: 4, value: 3, requiresMilestone: { divisionId: 'spacex', tierIndex: 4, threshold: 25 } },

	// === MANUFACTURING UPGRADES (6) ===
	{ id: 'ev_speed_1', name: 'Gigapress', description: '2x Electric Cars speed', category: 'speed', cost: 15_000, target: 'tesla', tierIndex: 0, value: 2 },
	{ id: 'ev_rev_1', name: 'Lean Production', description: '3x Gigafactory revenue', category: 'revenue', cost: 75_000, target: 'tesla', tierIndex: 1, value: 3 },
	{ id: 'ev_speed_2', name: 'Process Optimization', description: '2x all Manufacturing speed', category: 'speed', cost: 750_000, target: 'tesla', tierIndex: -1, value: 2 },
	{ id: 'ev_rev_2', name: 'Vertical Integration', description: '3x Chip Fabrication revenue', category: 'revenue', cost: 3_000_000, target: 'tesla', tierIndex: 3, value: 3, requiresTierCount: { divisionId: 'tesla', tierIndex: 3, count: 15 } },
	{ id: 'ev_cost_1', name: 'Supply Chain Mastery', description: 'Manufacturing tiers cost 20% less', category: 'cost', cost: 200_000, target: 'tesla', tierIndex: -1, value: 0.8 },
	{ id: 'ev_speed_3', name: 'Colony Assembly Line', description: '3x Colony Kit Factory speed', category: 'speed', cost: 25_000_000, target: 'tesla', tierIndex: 5, value: 3, requiresMilestone: { divisionId: 'tesla', tierIndex: 5, threshold: 25 } },

	// === AI UPGRADES (6) ===
	{ id: 'ai_speed_1', name: 'GPU Cluster', description: '2x Chatbot speed', category: 'speed', cost: 20_000, target: 'ai', tierIndex: 0, value: 2 },
	{ id: 'ai_rev_1', name: 'API Monetization', description: '3x Language Model revenue', category: 'revenue', cost: 100_000, target: 'ai', tierIndex: 1, value: 3 },
	{ id: 'ai_speed_2', name: 'Tensor Optimization', description: '2x all AI speed', category: 'speed', cost: 2_000_000, target: 'ai', tierIndex: -1, value: 2 },
	{ id: 'ai_rev_2', name: 'Enterprise Contracts', description: '3x AI Assistant revenue', category: 'revenue', cost: 8_000_000, target: 'ai', tierIndex: 2, value: 3, requiresTierCount: { divisionId: 'ai', tierIndex: 2, count: 10 } },
	{ id: 'ai_cost_1', name: 'Open Source Models', description: 'AI tiers cost 20% less', category: 'cost', cost: 500_000, target: 'ai', tierIndex: -1, value: 0.8 },
	{ id: 'ai_speed_3', name: 'Recursive Self-Improvement', description: '5x AGI speed', category: 'speed', cost: 100_000_000, target: 'ai', tierIndex: 5, value: 5, requiresMilestone: { divisionId: 'ai', tierIndex: 5, threshold: 25 } },

	// === TUNNEL UPGRADES (6) ===
	{ id: 'tunnel_speed_1', name: 'Better Boring', description: '2x Test Bore speed', category: 'speed', cost: 30_000, target: 'tunnels', tierIndex: 0, value: 2 },
	{ id: 'tunnel_rev_1', name: 'City Contracts', description: '3x City Tunnel revenue', category: 'revenue', cost: 150_000, target: 'tunnels', tierIndex: 1, value: 3 },
	{ id: 'tunnel_speed_2', name: 'Prufrock TBM', description: '2x all Tunnel speed', category: 'speed', cost: 3_000_000, target: 'tunnels', tierIndex: -1, value: 2 },
	{ id: 'tunnel_rev_2', name: 'Freight Monopoly', description: '3x Freight Network revenue', category: 'revenue', cost: 15_000_000, target: 'tunnels', tierIndex: 3, value: 3, requiresTierCount: { divisionId: 'tunnels', tierIndex: 3, count: 10 } },
	{ id: 'tunnel_cost_1', name: 'Modular Segments', description: 'Tunnel tiers cost 20% less', category: 'cost', cost: 750_000, target: 'tunnels', tierIndex: -1, value: 0.8 },
	{ id: 'tunnel_speed_3', name: 'Vacuum Tube Tech', description: '3x Hyperloop speed', category: 'speed', cost: 75_000_000, target: 'tunnels', tierIndex: 5, value: 3, requiresMilestone: { divisionId: 'tunnels', tierIndex: 5, threshold: 25 } },

	// === ROBOTICS UPGRADES (6) ===
	{ id: 'robot_speed_1', name: 'Servo Overclocking', description: '2x Assembly Bot speed', category: 'speed', cost: 40_000, target: 'robotics', tierIndex: 0, value: 2 },
	{ id: 'robot_rev_1', name: 'Logistics Contracts', description: '3x Warehouse Drone revenue', category: 'revenue', cost: 200_000, target: 'robotics', tierIndex: 1, value: 3 },
	{ id: 'robot_speed_2', name: 'Motion Planning AI', description: '2x all Robotics speed', category: 'speed', cost: 4_000_000, target: 'robotics', tierIndex: -1, value: 2 },
	{ id: 'robot_rev_2', name: 'Consumer Sales', description: '3x Home Robot revenue', category: 'revenue', cost: 20_000_000, target: 'robotics', tierIndex: 3, value: 3, requiresTierCount: { divisionId: 'robotics', tierIndex: 3, count: 10 } },
	{ id: 'robot_cost_1', name: 'Standardized Parts', description: 'Robotics tiers cost 20% less', category: 'cost', cost: 1_000_000, target: 'robotics', tierIndex: -1, value: 0.8 },
	{ id: 'robot_speed_3', name: 'Self-Replicating Bots', description: '5x General Purpose Robot speed', category: 'speed', cost: 200_000_000, target: 'robotics', tierIndex: 5, value: 5, requiresMilestone: { divisionId: 'robotics', tierIndex: 5, threshold: 25 } },

	// === OFFLINE EFFICIENCY UPGRADES (3) ===
	{ id: 'offline_eff_1', name: 'Night Shift', description: 'Offline earnings +10% (60% total)', category: 'offline', cost: 500_000, target: 'all', tierIndex: -1, value: 0.10 },
	{ id: 'offline_eff_2', name: '24/7 Operations', description: 'Offline earnings +15% (75% total)', category: 'offline', cost: 10_000_000, target: 'all', tierIndex: -1, value: 0.15, requiresTierCount: { divisionId: 'teslaenergy', tierIndex: 2, count: 10 } },
	{ id: 'offline_eff_3', name: 'Full Autonomy', description: 'Offline earnings +15% (90% total)', category: 'offline', cost: 250_000_000, target: 'all', tierIndex: -1, value: 0.15, requiresTierCount: { divisionId: 'ai', tierIndex: 3, count: 10 } },

	// === GLOBAL UPGRADES (6) ===
	{ id: 'global_rev_1', name: 'Brand Power', description: '2x all revenue', category: 'revenue', cost: 5_000_000, target: 'all', tierIndex: -1, value: 2 },
	{ id: 'global_speed_1', name: 'Operations Excellence', description: '2x all speed', category: 'speed', cost: 10_000_000, target: 'all', tierIndex: -1, value: 2 },
	{ id: 'global_cost_1', name: 'Economy of Scale', description: 'All tiers cost 15% less', category: 'cost', cost: 25_000_000, target: 'all', tierIndex: -1, value: 0.85 },
	{ id: 'global_rev_2', name: 'Market Dominance', description: '3x all revenue', category: 'revenue', cost: 100_000_000, target: 'all', tierIndex: -1, value: 3 },
	{ id: 'global_speed_2', name: 'Automation Everywhere', description: '3x all speed', category: 'speed', cost: 500_000_000, target: 'all', tierIndex: -1, value: 3 },
	{ id: 'global_cost_2', name: 'Vertical Integration', description: 'All tiers cost 25% less', category: 'cost', cost: 1_000_000_000, target: 'all', tierIndex: -1, value: 0.75 },
];

/**
 * Check if an upgrade's requirements are met
 */
export function isUpgradeAvailable(upgrade: Upgrade, state: GameState): boolean {
	if (upgrade.requiresTierCount) {
		const { divisionId, tierIndex, count } = upgrade.requiresTierCount;
		const div = state.divisions[divisionId as keyof typeof state.divisions];
		if (!div || !div.tiers[tierIndex] || div.tiers[tierIndex].count < count) return false;
	}
	if (upgrade.requiresMilestone) {
		const { divisionId, tierIndex, threshold } = upgrade.requiresMilestone;
		const div = state.divisions[divisionId as keyof typeof state.divisions];
		if (!div || !div.tiers[tierIndex] || div.tiers[tierIndex].count < threshold) return false;
	}
	return true;
}

/**
 * Check if an upgrade has been purchased
 */
export function isUpgradePurchased(upgradeId: string, state: GameState): boolean {
	return (state.purchasedUpgrades ?? []).includes(upgradeId);
}

/**
 * Purchase an upgrade. Returns true on success.
 */
export function purchaseUpgrade(upgradeId: string): boolean {
	let success = false;

	gameState.update((state) => {
		const upgrade = ALL_UPGRADES.find(u => u.id === upgradeId);
		if (!upgrade) return state;

		const purchased = state.purchasedUpgrades ?? [];
		if (purchased.includes(upgradeId)) return state;
		if (state.cash < upgrade.cost) return state;
		if (!isUpgradeAvailable(upgrade, state)) return state;

		success = true;
		return {
			...state,
			cash: state.cash - upgrade.cost,
			purchasedUpgrades: [...purchased, upgradeId],
		};
	});

	if (success) {
		eventBus.emit('upgrade:purchased', { upgradeId });
	}

	return success;
}

/**
 * Get combined upgrade speed multiplier for a tier
 */
export function getUpgradeSpeedMultiplier(divisionId: string, tierIndex: number, state: GameState): number {
	const purchased = state.purchasedUpgrades ?? [];
	let mult = 1;
	for (const uid of purchased) {
		const u = ALL_UPGRADES.find(up => up.id === uid);
		if (!u || u.category !== 'speed') continue;
		if (u.target === 'all' || (u.target === divisionId && (u.tierIndex === -1 || u.tierIndex === tierIndex))) {
			mult *= u.value;
		}
	}
	return mult;
}

/**
 * Get combined upgrade revenue multiplier for a tier
 */
export function getUpgradeRevenueMultiplier(divisionId: string, tierIndex: number, state: GameState): number {
	const purchased = state.purchasedUpgrades ?? [];
	let mult = 1;
	for (const uid of purchased) {
		const u = ALL_UPGRADES.find(up => up.id === uid);
		if (!u || u.category !== 'revenue') continue;
		if (u.target === 'all' || (u.target === divisionId && (u.tierIndex === -1 || u.tierIndex === tierIndex))) {
			mult *= u.value;
		}
	}
	return mult;
}

/**
 * Get the offline efficiency bonus from purchased upgrades.
 * Returns the total bonus (e.g. 0.25 means +25% on top of base 50%).
 */
export function getOfflineEfficiencyBonus(state: GameState): number {
	const purchased = state.purchasedUpgrades ?? [];
	let bonus = 0;
	for (const uid of purchased) {
		const u = ALL_UPGRADES.find(up => up.id === uid);
		if (!u || u.category !== 'offline') continue;
		bonus += u.value;
	}
	return bonus;
}

/**
 * Get combined upgrade cost multiplier for a tier (< 1 means cheaper)
 */
export function getUpgradeCostMultiplier(divisionId: string, tierIndex: number, state: GameState): number {
	const purchased = state.purchasedUpgrades ?? [];
	let mult = 1;
	for (const uid of purchased) {
		const u = ALL_UPGRADES.find(up => up.id === uid);
		if (!u || u.category !== 'cost') continue;
		if (u.target === 'all' || (u.target === divisionId && (u.tierIndex === -1 || u.tierIndex === tierIndex))) {
			mult *= u.value;
		}
	}
	return mult;
}
