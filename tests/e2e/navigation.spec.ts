import { test, expect } from '@playwright/test';
import { freshGame, getTabButton } from './helpers';

test.describe('Tab Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await freshGame(page);
	});

	test('switching tabs shows different division views', async ({ page }) => {
		// Start on dashboard
		await expect(page.getByText('Being Elon')).toBeVisible();

		// Navigate to Tesla Energy
		await getTabButton(page, 'Tesla Energy').click();
		await expect(page.getByText('Solar energy, Powerwall & Megapack')).toBeVisible();

		// Navigate to SpaceX
		await getTabButton(page, 'SpaceX').click();
		await expect(page.getByText('Reusable rockets & Mars colonization')).toBeVisible();

		// Navigate to Tesla
		await getTabButton(page, 'Tesla').click();
		await expect(page.getByText('Electric vehicles & Gigafactories')).toBeVisible();

		// Back to Dashboard
		await getTabButton(page, 'Dashboard').click();
		await expect(page.getByText('Being Elon')).toBeVisible();
	});

	test('active tab has visual indicator', async ({ page }) => {
		// Dashboard should be active by default
		const dashboardTab = getTabButton(page, 'Dashboard');
		await expect(dashboardTab).toHaveAttribute('aria-current', 'page');

		// Click Tesla Energy - it should become active
		const teslaEnergyTab = getTabButton(page, 'Tesla Energy');
		await teslaEnergyTab.click();
		await expect(teslaEnergyTab).toHaveAttribute('aria-current', 'page');

		// Dashboard should no longer be active
		await expect(dashboardTab).not.toHaveAttribute('aria-current', 'page');
	});
});
