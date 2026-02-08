import { type Page, type Locator } from '@playwright/test';

/**
 * Get a tab button from the bottom navigation bar.
 * This avoids strict mode violations from dashboard division cards
 * that also match the division names.
 */
export function getTabButton(page: Page, name: string): Locator {
	return page.locator('nav[aria-label="Division navigation"]').getByRole('button', { name });
}

/**
 * Navigate to a fresh game, clearing all saved state.
 * Uses a blank page for IDB cleanup to avoid conflicts with the game's DB connections.
 */
export async function freshGame(page: Page): Promise<void> {
	// Navigate to a page that won't open the game DB
	await page.goto('/');

	// Clean up saved state while NOT on the game page
	await page.evaluate(() => {
		return new Promise<void>((resolve) => {
			localStorage.clear();
			const req = indexedDB.deleteDatabase('being-elon');
			req.onsuccess = () => resolve();
			req.onerror = () => resolve();
			req.onblocked = () => resolve();
			// Safety timeout
			setTimeout(resolve, 2000);
		});
	});

	// Now navigate to the game — DB will be created fresh
	await page.goto('/game');
	await page.locator('.game-shell').waitFor({ state: 'visible', timeout: 10_000 });
}
