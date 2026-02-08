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
 */
export async function freshGame(page: Page): Promise<void> {
	await page.goto('/game');
	await page.evaluate(() => {
		indexedDB.deleteDatabase('technomania');
		localStorage.clear();
	});
	await page.goto('/game');
	await page.locator('.game-shell').waitFor({ state: 'visible', timeout: 10_000 });
}
