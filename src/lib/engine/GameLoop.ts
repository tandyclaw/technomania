/**
 * GameLoop.ts — Core game loop using requestAnimationFrame
 * Handles delta time, tick rate, and offline calculation
 */

export type TickCallback = (deltaMs: number) => void;

export class GameLoop {
	private running = false;
	private lastTimestamp = 0;
	private animFrameId: number | null = null;
	private tickCallbacks: TickCallback[] = [];

	/** Target tick rate in ms (default: ~60fps for UI, game logic at 1s intervals) */
	private readonly GAME_TICK_MS = 1000;
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
		// Cap at 8 hours (28,800,000 ms) by default
		const maxOfflineMs = 8 * 60 * 60 * 1000;
		const cappedDuration = Math.min(durationMs, maxOfflineMs);

		// Simulate in 1-second ticks for accuracy
		const ticks = Math.floor(cappedDuration / this.GAME_TICK_MS);
		for (let i = 0; i < ticks; i++) {
			for (const cb of this.tickCallbacks) {
				cb(this.GAME_TICK_MS);
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
