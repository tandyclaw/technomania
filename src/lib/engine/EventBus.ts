/**
 * EventBus.ts — Pub/sub for game events
 * Used for cross-system communication (synergies, achievements, notifications)
 */

export type EventHandler<T = unknown> = (data: T) => void;

export interface GameEvents {
	'production:complete': { division: string; tier: number; amount: number };
	'production:started': { division: string; tier: number };
	'upgrade:purchased': { division: string; tier: number; level: number };
	'tier:unlocked': { division: string; tier: number };
	'division:unlocked': { division: string };
	'research:complete': { id: string; name: string };
	'bottleneck:hit': { division: string; type: string; description: string };
	'bottleneck:resolved': { division: string; type: string };
	'synergy:discovered': { source: string; target: string; bonus: string };
	'prestige:ready': { projectedVision: number };
	'prestige:complete': { visionEarned: number; totalVision: number };
	'achievement:unlocked': { id: string; name: string; description: string };
	'chief:hired': { division: string; level: number };
	'power:shortage': { needed: number; available: number };
	'save:complete': Record<string, never>;
	'save:loaded': Record<string, never>;
}

class EventBus {
	private handlers = new Map<string, Set<EventHandler>>();

	on<K extends keyof GameEvents>(event: K, handler: EventHandler<GameEvents[K]>): () => void {
		if (!this.handlers.has(event)) {
			this.handlers.set(event, new Set());
		}
		this.handlers.get(event)!.add(handler as EventHandler);

		// Return unsubscribe function
		return () => {
			this.handlers.get(event)?.delete(handler as EventHandler);
		};
	}

	emit<K extends keyof GameEvents>(event: K, data: GameEvents[K]): void {
		const eventHandlers = this.handlers.get(event);
		if (eventHandlers) {
			for (const handler of eventHandlers) {
				try {
					handler(data);
				} catch (err) {
					console.error(`Error in event handler for ${event}:`, err);
				}
			}
		}
	}

	off<K extends keyof GameEvents>(event: K, handler: EventHandler<GameEvents[K]>): void {
		this.handlers.get(event)?.delete(handler as EventHandler);
	}

	clear(): void {
		this.handlers.clear();
	}
}

export const eventBus = new EventBus();
