/**
 * particleStore.ts — Triggers for particle effects
 */
import { writable } from 'svelte/store';

export type ParticleType = 'confetti' | 'spark';

export interface ParticleEvent {
	type: ParticleType;
	id: number;
	x?: number;
	y?: number;
}

let nextId = 0;

export const particleEvents = writable<ParticleEvent[]>([]);

export function triggerParticle(type: ParticleType, x?: number, y?: number) {
	const id = ++nextId;
	particleEvents.update(events => [...events, { type, id, x, y }]);
	// Auto-remove after animation
	setTimeout(() => {
		particleEvents.update(events => events.filter(e => e.id !== id));
	}, 2000);
}
