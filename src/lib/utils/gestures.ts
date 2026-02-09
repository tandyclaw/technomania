/**
 * Touch gesture utilities for mobile interactions
 */

/** Swipe detection for navigating between divisions */
export interface SwipeHandlers {
	onSwipeLeft?: () => void;
	onSwipeRight?: () => void;
}

export function createSwipeDetector(handlers: SwipeHandlers) {
	let startX = 0;
	let startY = 0;
	let startTime = 0;

	function onTouchStart(e: TouchEvent) {
		startX = e.touches[0].clientX;
		startY = e.touches[0].clientY;
		startTime = Date.now();
	}

	function onTouchEnd(e: TouchEvent) {
		const endX = e.changedTouches[0].clientX;
		const endY = e.changedTouches[0].clientY;
		const dx = endX - startX;
		const dy = endY - startY;
		const dt = Date.now() - startTime;

		// Must be fast enough, horizontal enough, and long enough
		if (dt > 500) return;
		if (Math.abs(dx) < 60) return;
		if (Math.abs(dy) > Math.abs(dx) * 0.7) return;

		if (dx < 0) handlers.onSwipeLeft?.();
		else handlers.onSwipeRight?.();
	}

	return { onTouchStart, onTouchEnd };
}

/** Long-press detection for showing tooltips */
export function createLongPressDetector(onLongPress: (e: TouchEvent) => void, duration = 500) {
	let timer: ReturnType<typeof setTimeout> | null = null;
	let moved = false;

	function onTouchStart(e: TouchEvent) {
		moved = false;
		timer = setTimeout(() => {
			if (!moved) onLongPress(e);
		}, duration);
	}

	function onTouchMove() {
		moved = true;
		if (timer) { clearTimeout(timer); timer = null; }
	}

	function onTouchEnd() {
		if (timer) { clearTimeout(timer); timer = null; }
	}

	return { onTouchStart, onTouchMove, onTouchEnd };
}
