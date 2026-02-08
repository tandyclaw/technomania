import { test, expect } from '@playwright/test';
import { freshGame, getTabButton } from './helpers';

test.describe('Tesla Energy Division', () => {
	test.beforeEach(async ({ page }) => {
		await freshGame(page);

		// Navigate to Tesla Energy tab
		await getTabButton(page, 'Tesla Energy').click();
	});

	test('loads and shows division header', async ({ page }) => {
		// Division header in the content area
		await expect(page.locator('.division-detail').getByText('Tesla Energy')).toBeVisible();
		await expect(page.getByText('Solar energy, Powerwall & Megapack')).toBeVisible();
	});

	test('shows tier cards', async ({ page }) => {
		// First tier should be unlocked
		await expect(page.getByText('Solar Panels')).toBeVisible();

		// Should show Build button for first tier
		await expect(page.getByRole('button', { name: /Build/i }).first()).toBeVisible();
	});

	test('tapping a tier produces cash', async ({ page }) => {
		// First, buy a Solar Panels
		const buildButton = page.getByRole('button', { name: /Build/i }).first();
		await buildButton.click();

		// Read initial cash from the resource bar
		const cashElement = page.locator('[aria-label^="Cash:"]');
		const initialCashText = await cashElement.getAttribute('aria-label');
		const initialCash = parseFloat(initialCashText!.replace('Cash: $', '').replace(/[^0-9.]/g, ''));

		// Tap the tier card to produce
		const tierCard = page.locator('.tier-card').first();
		await tierCard.click();

		// Wait a moment for the state update
		await page.waitForTimeout(300);

		// Cash should have increased
		const newCashText = await cashElement.getAttribute('aria-label');
		const newCash = parseFloat(newCashText!.replace('Cash: $', '').replace(/[^0-9.]/g, ''));
		expect(newCash).toBeGreaterThan(initialCash);
	});

	test('buying a tier works (cash decreases, count increases)', async ({ page }) => {
		// Read initial cash
		const cashElement = page.locator('[aria-label^="Cash:"]');
		const initialCashText = await cashElement.getAttribute('aria-label');
		const initialCash = parseFloat(initialCashText!.replace('Cash: $', '').replace(/[^0-9.]/g, ''));

		// Buy first tier
		const buildButton = page.getByRole('button', { name: /Build/i }).first();
		await buildButton.click();

		// Cash should decrease
		await page.waitForTimeout(300);
		const afterCashText = await cashElement.getAttribute('aria-label');
		const afterCash = parseFloat(afterCashText!.replace('Cash: $', '').replace(/[^0-9.]/g, ''));
		expect(afterCash).toBeLessThan(initialCash);

		// Count badge should show ×1
		await expect(page.getByText('×1')).toBeVisible();
	});
});
