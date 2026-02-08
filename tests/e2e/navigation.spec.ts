import { test, expect } from '@playwright/test';
import { freshGame, getTabButton } from './helpers';

test.describe('Tab Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await freshGame(page);
	});

	test('switching tabs shows different division views', async ({ page }) => {
		// Start on dashboard
		await expect(page.getByText('Frontier Industries')).toBeVisible();

		// Navigate to Helios
		await getTabButton(page, 'Helios Power').click();
		await expect(page.getByText('Solar energy, batteries & grid storage')).toBeVisible();

		// Navigate to Apex
		await getTabButton(page, 'Apex Rocketry').click();
		await expect(page.getByText('Reusable rockets & space exploration')).toBeVisible();

		// Navigate to Volt
		await getTabButton(page, 'Volt Motors').click();
		await expect(page.getByText('Electric vehicles & gigafactories')).toBeVisible();

		// Back to Dashboard
		await getTabButton(page, 'Dashboard').click();
		await expect(page.getByText('Frontier Industries')).toBeVisible();
	});

	test('active tab has visual indicator', async ({ page }) => {
		// Dashboard should be active by default
		const dashboardTab = getTabButton(page, 'Dashboard');
		await expect(dashboardTab).toHaveAttribute('aria-current', 'page');

		// Click Helios - it should become active
		const heliosTab = getTabButton(page, 'Helios Power');
		await heliosTab.click();
		await expect(heliosTab).toHaveAttribute('aria-current', 'page');

		// Dashboard should no longer be active
		await expect(dashboardTab).not.toHaveAttribute('aria-current', 'page');
	});
});
