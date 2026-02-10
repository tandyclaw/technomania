/**
 * Announce a message to screen readers via the game-announcements live region.
 * Messages are cleared after a short delay to allow re-announcement of identical text.
 */
export function announce(message: string): void {
	if (typeof document === 'undefined') return;
	const el = document.getElementById('game-announcements');
	if (!el) return;
	el.textContent = '';
	// Use rAF to ensure the DOM clears before setting new text
	requestAnimationFrame(() => {
		el.textContent = message;
	});
}
