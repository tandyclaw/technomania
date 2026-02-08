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
		await expect(page.locator('.division-card').filter({ hasText: 'Tesla Energy' })).toBeVisible();
		await expect(page.locator('.division-card').filter({ hasText: 'SpaceX' })).toBeVisible();
		await expect(page.locator('.division-card').filter({ hasText: 'Tesla' }).first()).toBeVisible();
	});

	test('shows quick stats grid', async ({ page }) => {
		await expect(page.getByText('Tiers Owned')).toBeVisible();
		await expect(page.getByText('Prestige')).toBeVisible();
	});

	test('shows total income banner', async ({ page }) => {
		await expect(page.getByText('Total Income')).toBeVisible();
	});

	test('clicking a division card navigates to that division', async ({ page }) => {
		// Click Tesla Energy card
		const teslaEnergyCard = page.locator('.division-card').filter({ hasText: 'Tesla Energy' });
		await teslaEnergyCard.click();

		// Should navigate to Tesla Energy view
		await expect(page.getByText('Solar energy, Powerwall & Megapack')).toBeVisible();
		await expect(page.getByText('Production Tiers')).toBeVisible();
	});
});
