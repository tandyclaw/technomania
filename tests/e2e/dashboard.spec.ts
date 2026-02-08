import { test, expect } from '@playwright/test';
import { freshGame } from './helpers';

test.describe('Dashboard', () => {
	test.beforeEach(async ({ page }) => {
		await freshGame(page);
	});

	test('shows division summary cards', async ({ page }) => {
		// All three divisions should appear as cards
		const divisionCards = page.locator('.division-card');
		await expect(divisionCards).toHaveCount(3);

		// Division names should be visible
		await expect(page.locator('.division-card').filter({ hasText: 'Helios Power' })).toBeVisible();
		await expect(page.locator('.division-card').filter({ hasText: 'Apex Rocketry' })).toBeVisible();
		await expect(page.locator('.division-card').filter({ hasText: 'Volt Motors' })).toBeVisible();
	});

	test('shows quick stats grid', async ({ page }) => {
		await expect(page.getByText('Tiers Owned')).toBeVisible();
		await expect(page.getByText('Prestige')).toBeVisible();
	});

	test('shows total income banner', async ({ page }) => {
		await expect(page.getByText('Total Income')).toBeVisible();
	});

	test('clicking a division card navigates to that division', async ({ page }) => {
		// Click Helios card
		const heliosCard = page.locator('.division-card').filter({ hasText: 'Helios Power' });
		await heliosCard.click();

		// Should navigate to Helios view
		await expect(page.getByText('Solar energy, batteries & grid storage')).toBeVisible();
		await expect(page.getByText('Production Tiers')).toBeVisible();
	});
});
