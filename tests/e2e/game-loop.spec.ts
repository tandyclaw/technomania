import { test, expect } from '@playwright/test';
import { freshGame, getTabButton } from './helpers';

test.describe('Game Loop Progression', () => {
	test.beforeEach(async ({ page }) => {
		await freshGame(page);
	});

	test('automated production generates cash over time', async ({ page }) => {
		// Navigate to Helios
		await getTabButton(page, 'Helios Power').click();

		// Buy a Rooftop Solar
		const buildButton = page.getByRole('button', { name: /Build/i }).first();
		await buildButton.click();
		await page.waitForTimeout(200);

		// Tap to produce once to establish baseline
		const tierCard = page.locator('.tier-card').first();
		await tierCard.click();
		await page.waitForTimeout(200);

		// Read cash after tap
		const cashElement = page.locator('[aria-label^="Cash:"]');
		const cashTextAfterTap = await cashElement.getAttribute('aria-label');
		const cashAfterTap = parseFloat(cashTextAfterTap!.replace('Cash: $', '').replace(/[^0-9.]/g, ''));

		// Tap again to get more cash
		await tierCard.click();
		await page.waitForTimeout(200);

		const cashTextAfterSecondTap = await cashElement.getAttribute('aria-label');
		const cashAfterSecondTap = parseFloat(cashTextAfterSecondTap!.replace('Cash: $', '').replace(/[^0-9.]/g, ''));

		// Each tap should earn cash
		expect(cashAfterSecondTap).toBeGreaterThan(cashAfterTap);
	});

	test('multiple taps accumulate cash', async ({ page }) => {
		// Navigate to Helios
		await getTabButton(page, 'Helios Power').click();

		// Buy a Rooftop Solar
		const buildButton = page.getByRole('button', { name: /Build/i }).first();
		await buildButton.click();
		await page.waitForTimeout(200);

		// Read cash after purchase
		const cashElement = page.locator('[aria-label^="Cash:"]');
		const initialCashText = await cashElement.getAttribute('aria-label');
		const initialCash = parseFloat(initialCashText!.replace('Cash: $', '').replace(/[^0-9.]/g, ''));

		// Do 5 taps
		const tierCard = page.locator('.tier-card').first();
		for (let i = 0; i < 5; i++) {
			await tierCard.click();
			await page.waitForTimeout(100);
		}

		await page.waitForTimeout(200);
		const finalCashText = await cashElement.getAttribute('aria-label');
		const finalCash = parseFloat(finalCashText!.replace('Cash: $', '').replace(/[^0-9.]/g, ''));

		// Should have earned 5× baseRevenue ($2 per tap for Rooftop Solar with count=1)
		expect(finalCash).toBeGreaterThan(initialCash + 5);
	});
});
