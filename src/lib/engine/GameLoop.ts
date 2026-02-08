/**
 * GameLoop.ts — Core game loop using requestAnimationFrame
 * Handles delta time, tick rate, and offline calculation
 *
 * Tick rate: ~100ms (10 ticks/sec) for smooth progress bars on fast cycles
 * (Solar Panels = 0.5s cycle, needs multiple visual updates per cycle)
 */

export type TickCallback = (deltaMs: number) => void;

export class GameLoop {
	private running = false;
	private lastTimestamp = 0;
	private animFrameId: number | null = null;
	private tickCallbacks: TickCallback[] = [];

	/** Game logic tick interval in ms — 100ms for smooth progress on fast tiers */
	private readonly GAME_TICK_MS = 100;
	private accumulator = 0;

	constructor() {}

	onTick(callback: TickCallback): () => void {
		this.tickCallbacks.push(callback);
		return () => {
			this.tickCallbacks = this.tickCallbacks.filter((cb) => cb !== callback);
		};
	}

	start(): void {
		if (this.running) return;
		this.running = true;
		this.lastTimestamp = performance.now();
		this.accumulator = 0;
		this.loop(this.lastTimestamp);
	}

	stop(): void {
		this.running = false;
		if (this.animFrameId !== null) {
			cancelAnimationFrame(this.animFrameId);
			this.animFrameId = null;
		}
	}

	isRunning(): boolean {
		return this.running;
	}

	/**
	 * Calculate offline progress for a given duration
	 * Used when returning to the game after being away
	 */
	calculateOffline(durationMs: number): void {
		const maxOfflineMs = 8 * 60 * 60 * 1000;
		const cappedDuration = Math.min(durationMs, maxOfflineMs);

		// Simulate in 1-second ticks for offline (no need for 100ms granularity)
		const OFFLINE_TICK_MS = 1000;
		const ticks = Math.floor(cappedDuration / OFFLINE_TICK_MS);
		for (let i = 0; i < ticks; i++) {
			for (const cb of this.tickCallbacks) {
				cb(OFFLINE_TICK_MS);
			}
		}
	}

	private loop = (timestamp: number): void => {
		if (!this.running) return;

		const deltaMs = timestamp - this.lastTimestamp;
		this.lastTimestamp = timestamp;

		// Accumulate time and process fixed-step game ticks
		this.accumulator += deltaMs;

		while (this.accumulator >= this.GAME_TICK_MS) {
			for (const cb of this.tickCallbacks) {
				cb(this.GAME_TICK_MS);
			}
			this.accumulator -= this.GAME_TICK_MS;
		}

		this.animFrameId = requestAnimationFrame(this.loop);
	};
}

export const gameLoop = new GameLoop();
