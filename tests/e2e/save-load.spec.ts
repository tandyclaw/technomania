import { test, expect } from '@playwright/test';
import { freshGame, getTabButton } from './helpers';

test.describe('Save/Load', () => {
	test('game state persists after page refresh', async ({ page }) => {
		await freshGame(page);

		// Navigate to Tesla Energy
		await getTabButton(page, 'Tesla Energy').click();
		await expect(page.getByText('Solar Panels')).toBeVisible();

		// Buy a tier
		const buildButton = page.getByRole('button', { name: /Build/i }).first();
		await buildButton.click();
		await page.waitForTimeout(300);

		// Verify it was purchased
		await expect(page.getByText('×1')).toBeVisible();

		// Trigger a save via visibility change
		await page.evaluate(() => {
			Object.defineProperty(document, 'visibilityState', {
				value: 'hidden',
				writable: true,
				configurable: true,
			});
			document.dispatchEvent(new Event('visibilitychange'));
		});
		await page.waitForTimeout(500);

		// Reload page
		await page.reload();
		await page.locator('.game-shell').waitFor({ state: 'visible', timeout: 10_000 });

		// Dismiss "welcome back" overlay if it appears
		const welcomeBackBtn = page.getByRole('button', { name: "Let's Go" });
		if (await welcomeBackBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await welcomeBackBtn.click();
		}

		// Navigate back to Tesla Energy
		await getTabButton(page, 'Tesla Energy').click();

		// The tier count should still be 1
		await expect(page.getByText('×1')).toBeVisible({ timeout: 5_000 });
	});
});
