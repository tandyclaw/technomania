/**
 * ContractSystem.ts — Timed contract challenges
 * Procedurally generated based on player progress.
 * 2-3 active at a time, new ones every 5-10 minutes.
 */

import { get } from 'svelte/store';
import { writable } from 'svelte/store';
import { gameState, type GameState } from '$lib/stores/gameState';
import { DIVISIONS } from '$lib/divisions';
import { getDivisionTrueIncomePerSec } from '$lib/engine/ProductionEngine';
import { addToast } from '$lib/stores/toastStore';
import { eventBus } from '$lib/engine/EventBus';
import { playSound } from '$lib/systems/SoundManager';
import { hapticContractComplete, hapticContractExpired } from '$lib/utils/haptics';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ContractRewardType = 'cash' | 'rp' | 'revenue_mult' | 'chief_upgrade';

export interface ContractReward {
	type: ContractRewardType;
	amount: number;
	/** For revenue_mult: duration in ms */
	durationMs?: number;
	label: string;
}

export type ContractTargetType = 'produce' | 'buy' | 'income' | 'launch';

export interface ContractTarget {
	type: ContractTargetType;
	/** Division id (for produce/buy/launch) */
	division?: string;
	/** Tier index (for produce/buy) */
	tierIndex?: number;
	/** Target count or income threshold */
	target: number;
}

export interface Contract {
	id: string;
	description: string;
	icon: string;
	target: ContractTarget;
	reward: ContractReward;
	/** Time limit in ms */
	timeLimitMs: number;
	/** When the contract was created (timestamp) */
	createdAt: number;
	/** Progress toward target */
	progress: number;
	/** Whether completed */
	completed: boolean;
	/** Whether expired */
	expired: boolean;
}

export interface ContractState {
	active: Contract[];
	/** Accumulated ms since last contract spawn */
	spawnTimerMs: number;
	/** Next spawn threshold (randomised 5-10 min) */
	nextSpawnMs: number;
	/** Total completed all-time */
	totalCompleted: number;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const contractState = writable<ContractState>({
	active: [],
	spawnTimerMs: 0,
	nextSpawnMs: 15_000, // First contract spawns quickly (15s)
	totalCompleted: 0,
});

// Revenue multiplier buff from contracts
export const contractRevenueMult = writable<{ mult: number; expiresAt: number }>({
	mult: 1,
	expiresAt: 0,
});

function randomSpawnInterval(): number {
	// 5-10 minutes
	return (5 + Math.random() * 5) * 60 * 1000;
}

// ─── Contract Generation ─────────────────────────────────────────────────────

function getUnlockedDivisions(state: GameState): string[] {
	return (['teslaenergy', 'tesla', 'spacex', 'ai', 'tunnels', 'robotics'] as const).filter(
		(id) => state.divisions[id].unlocked
	);
}

function getTotalIncomePerSec(state: GameState): number {
	let total = 0;
	for (const divId of Object.keys(state.divisions)) {
		total += getDivisionTrueIncomePerSec(state, divId);
	}
	return total;
}

let contractIdCounter = 0;

function generateContract(state: GameState): Contract | null {
	const unlocked = getUnlockedDivisions(state);
	if (unlocked.length === 0) return null;

	const incomePerSec = getTotalIncomePerSec(state);
	const templates: (() => Contract)[] = [];

	// Produce X units contracts
	for (const divId of unlocked) {
		const divState = state.divisions[divId as keyof typeof state.divisions];
		const divMeta = DIVISIONS[divId];
		if (!divMeta) continue;
		for (let ti = 0; ti < divState.tiers.length; ti++) {
			const tier = divState.tiers[ti];
			if (!tier.unlocked || tier.count === 0) continue;
			const tierData = divMeta.tiers[ti];
			if (!tierData) continue;

			// Scale target to what's achievable: ~20-80 production cycles worth
			const cyclesTarget = 20 + Math.floor(Math.random() * 60);
			const target = Math.max(1, Math.ceil(cyclesTarget * tier.count * 0.3));
			const timeLimitMin = 2 + Math.floor(Math.random() * 4); // 2-5 min
			const cashReward = Math.max(100, Math.round(incomePerSec * timeLimitMin * 30));

			templates.push(() => ({
				id: `contract_${++contractIdCounter}_${Date.now()}`,
				description: `Produce ${target} ${tierData.name}${target > 1 ? 's' : ''} in ${timeLimitMin} min`,
				icon: divMeta.icon,
				target: { type: 'produce', division: divId, tierIndex: ti, target },
				reward: { type: 'cash', amount: cashReward, label: `$${formatCompact(cashReward)}` },
				timeLimitMs: timeLimitMin * 60 * 1000,
				createdAt: Date.now(),
				progress: 0,
				completed: false,
				expired: false,
			}));
		}
	}

	// Buy X units contracts
	for (const divId of unlocked) {
		const divState = state.divisions[divId as keyof typeof state.divisions];
		const divMeta = DIVISIONS[divId];
		if (!divMeta) continue;
		for (let ti = 0; ti < divState.tiers.length; ti++) {
			const tier = divState.tiers[ti];
			if (!tier.unlocked) continue;
			const tierData = divMeta.tiers[ti];
			if (!tierData) continue;

			const buyTarget = 5 + Math.floor(Math.random() * 20);
			const timeLimitMin = 2 + Math.floor(Math.random() * 3);
			const rpReward = Math.max(10, Math.round(50 + incomePerSec * 0.5));

			templates.push(() => ({
				id: `contract_${++contractIdCounter}_${Date.now()}`,
				description: `Buy ${buyTarget} ${tierData.name}${buyTarget > 1 ? 's' : ''} in ${timeLimitMin} min`,
				icon: '🛒',
				target: { type: 'buy', division: divId, tierIndex: ti, target: buyTarget },
				reward: { type: 'rp', amount: rpReward, label: `${rpReward} RP` },
				timeLimitMs: timeLimitMin * 60 * 1000,
				createdAt: Date.now(),
				progress: 0,
				completed: false,
				expired: false,
			}));
		}
	}

	// Income threshold contract
	if (incomePerSec > 0) {
		const incomeTarget = incomePerSec * (2 + Math.random() * 3);
		const timeLimitMin = 5 + Math.floor(Math.random() * 6);

		templates.push(() => ({
			id: `contract_${++contractIdCounter}_${Date.now()}`,
			description: `Reach $${formatCompact(incomeTarget)}/s income within ${timeLimitMin} min`,
			icon: '📈',
			target: { type: 'income', target: incomeTarget },
			reward: {
				type: 'revenue_mult',
				amount: 2,
				durationMs: 60_000,
				label: '2× revenue for 60s',
			},
			timeLimitMs: timeLimitMin * 60 * 1000,
			createdAt: Date.now(),
			progress: 0,
			completed: false,
			expired: false,
		}));
	}

	// Revenue earning contract — earn X cash in Y minutes
	if (incomePerSec > 0) {
		const timeLimitMin = 3 + Math.floor(Math.random() * 4);
		const cashTarget = Math.round(incomePerSec * timeLimitMin * 60 * (1.5 + Math.random()));
		const rpReward = Math.max(20, Math.round(100 + incomePerSec * 0.8));

		templates.push(() => ({
			id: `contract_${++contractIdCounter}_${Date.now()}`,
			description: `Earn $${formatCompact(cashTarget)} in ${timeLimitMin} min`,
			icon: '💰',
			target: { type: 'income', target: cashTarget },
			reward: { type: 'rp', amount: rpReward, label: `${rpReward} RP` },
			timeLimitMs: timeLimitMin * 60 * 1000,
			createdAt: Date.now(),
			progress: 0,
			completed: false,
			expired: false,
		}));
	}

	// Multi-division produce contract — produce across any tier
	if (unlocked.length >= 2) {
		const timeLimitMin = 3 + Math.floor(Math.random() * 3);
		const target = 50 + Math.floor(Math.random() * 150);
		const multReward = 1.5 + Math.random() * 1.5; // 1.5× to 3×
		const durationSec = 30 + Math.floor(Math.random() * 60);

		templates.push(() => ({
			id: `contract_${++contractIdCounter}_${Date.now()}`,
			description: `Produce ${target} units (any division) in ${timeLimitMin} min`,
			icon: '🏭',
			target: { type: 'produce', target },
			reward: {
				type: 'revenue_mult',
				amount: Math.round(multReward * 10) / 10,
				durationMs: durationSec * 1000,
				label: `${(Math.round(multReward * 10) / 10)}× revenue for ${durationSec}s`,
			},
			timeLimitMs: timeLimitMin * 60 * 1000,
			createdAt: Date.now(),
			progress: 0,
			completed: false,
			expired: false,
		}));
	}

	if (templates.length === 0) return null;
	return templates[Math.floor(Math.random() * templates.length)]();
}

function formatCompact(n: number): string {
	if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
	if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
	if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
	if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
	return n.toFixed(0);
}

// ─── Tick & Event Handling ───────────────────────────────────────────────────

export function tickContracts(deltaMs: number): void {
	const state = get(gameState);
	const cs = get(contractState);

	// Tick revenue mult buff
	const buff = get(contractRevenueMult);
	if (buff.mult > 1 && Date.now() >= buff.expiresAt) {
		contractRevenueMult.set({ mult: 1, expiresAt: 0 });
	}

	// Check income-based contracts
	const incomePerSec = getTotalIncomePerSec(state);
	let changed = false;

	for (const contract of cs.active) {
		if (contract.completed || contract.expired) continue;

		// Check expiry
		const elapsed = Date.now() - contract.createdAt;
		if (elapsed >= contract.timeLimitMs) {
			contract.expired = true;
			changed = true;
			playSound('contractExpired');
			hapticContractExpired();
			continue;
		}

		// Check income contracts
		if (contract.target.type === 'income') {
			contract.progress = incomePerSec;
			if (incomePerSec >= contract.target.target) {
				completeContract(contract, state);
				changed = true;
			}
		}
	}

	// Remove expired contracts (keep completed for a brief display)
	const now = Date.now();
	const filtered = cs.active.filter(
		(c) => !(c.expired && now - c.createdAt > c.timeLimitMs + 3000)
	);
	if (filtered.length !== cs.active.length) {
		changed = true;
	}

	// Spawn timer
	let { spawnTimerMs, nextSpawnMs } = cs;
	spawnTimerMs += deltaMs;

	const activeCount = filtered.filter((c) => !c.completed && !c.expired).length;
	if (spawnTimerMs >= nextSpawnMs && activeCount < 3) {
		const newContract = generateContract(state);
		if (newContract) {
			filtered.push(newContract);
			changed = true;
		}
		spawnTimerMs = 0;
		nextSpawnMs = randomSpawnInterval();
	}

	if (changed || spawnTimerMs !== cs.spawnTimerMs) {
		const newCs = {
			...cs,
			active: filtered,
			spawnTimerMs,
			nextSpawnMs,
		};
		contractState.set(newCs);
		// Sync to gameState for persistence
		gameState.update((s) => ({ ...s, contracts: newCs }));
	}
}

function completeContract(contract: Contract, state: GameState): void {
	contract.completed = true;

	// Sound & haptic feedback
	playSound('contractComplete');
	hapticContractComplete();

	// Apply reward
	switch (contract.reward.type) {
		case 'cash':
			gameState.update((s) => ({ ...s, cash: s.cash + contract.reward.amount }));
			break;
		case 'rp':
			gameState.update((s) => ({
				...s,
				researchPoints: s.researchPoints + contract.reward.amount,
			}));
			break;
		case 'revenue_mult':
			contractRevenueMult.set({
				mult: contract.reward.amount,
				expiresAt: Date.now() + (contract.reward.durationMs ?? 60000),
			});
			break;
		case 'chief_upgrade':
			// Find a random division with a chief and upgrade it
			const divIds = Object.keys(state.divisions) as (keyof typeof state.divisions)[];
			const withChief = divIds.filter((id) => state.divisions[id].chiefLevel > 0 && state.divisions[id].chiefLevel < 6);
			if (withChief.length > 0) {
				const targetDiv = withChief[Math.floor(Math.random() * withChief.length)];
				gameState.update((s) => {
					const newState = { ...s, divisions: { ...s.divisions } };
					const div = { ...newState.divisions[targetDiv] };
					div.chiefLevel = Math.min(6, div.chiefLevel + 1);
					newState.divisions[targetDiv] = div;
					return newState;
				});
			}
			break;
	}

	// Update total
	contractState.update((cs) => ({ ...cs, totalCompleted: cs.totalCompleted + 1 }));

	// Toast
	addToast('achievement', '📜', 'Contract Complete!', `${contract.description} — ${contract.reward.label}`, {
		color: '#44DD88',
		durationMs: 5000,
	});
}

// ─── Event Listeners ─────────────────────────────────────────────────────────

export function initContractListeners(): () => void {
	const unsubs: (() => void)[] = [];

	// Track production completions
	unsubs.push(
		eventBus.on('production:complete', (data) => {
			contractState.update((cs) => {
				let changed = false;
				const state = get(gameState);
				for (const contract of cs.active) {
					if (contract.completed || contract.expired) continue;
					if (
						contract.target.type === 'produce' &&
						(contract.target.division === undefined || contract.target.division === data.division) &&
						(contract.target.tierIndex === undefined || contract.target.tierIndex === data.tier)
					) {
						contract.progress += data.amount;
						if (contract.progress >= contract.target.target) {
							completeContract(contract, state);
						}
						changed = true;
					}
				}
				return changed ? { ...cs } : cs;
			});
		})
	);

	// Track purchases
	unsubs.push(
		eventBus.on('upgrade:purchased', (data) => {
			contractState.update((cs) => {
				let changed = false;
				const state = get(gameState);
				for (const contract of cs.active) {
					if (contract.completed || contract.expired) continue;
					if (
						contract.target.type === 'buy' &&
						contract.target.division === data.division &&
						contract.target.tierIndex === data.tier
					) {
						contract.progress += 1;
						if (contract.progress >= contract.target.target) {
							completeContract(contract, state);
						}
						changed = true;
					}
				}
				return changed ? { ...cs } : cs;
			});
		})
	);

	return () => {
		for (const unsub of unsubs) unsub();
	};
}

// ─── Persistence Helpers ─────────────────────────────────────────────────────

export function getContractStateForSave(): ContractState {
	return get(contractState);
}

export function loadContractState(saved: ContractState | undefined): void {
	if (!saved) return;
	contractState.set(saved);
}

/** Reset contracts (e.g. on prestige). Preserves totalCompleted. */
export function resetContracts(): void {
	contractState.update(cs => ({
		active: [],
		spawnTimerMs: 0,
		nextSpawnMs: 15_000,
		totalCompleted: cs.totalCompleted,
	}));
	contractRevenueMult.set({ mult: 1, expiresAt: 0 });
}
