import { test, expect } from '@playwright/test';
import { freshGame, getTabButton } from './helpers';

test.describe('Game Layout', () => {
	test.beforeEach(async ({ page }) => {
		await freshGame(page);
	});

	test('renders resource bar', async ({ page }) => {
		const resourceBar = page.locator('header[aria-label="Player resources"]');
		await expect(resourceBar).toBeVisible();

		// Cash, Research, Power labels (scoped to resource bar to avoid ambiguity)
		await expect(resourceBar.getByText('Cash')).toBeVisible();
		await expect(resourceBar.getByText('Research')).toBeVisible();
		await expect(resourceBar.getByText('Power')).toBeVisible();
	});

	test('renders tab navigation', async ({ page }) => {
		const nav = page.locator('nav[aria-label="Division navigation"]');
		await expect(nav).toBeVisible();

		// Check all tab buttons exist (scoped to nav)
		await expect(getTabButton(page, 'Dashboard')).toBeVisible();
		await expect(getTabButton(page, 'Apex Rocketry')).toBeVisible();
		await expect(getTabButton(page, 'Volt Motors')).toBeVisible();
		await expect(getTabButton(page, 'Helios Power')).toBeVisible();
	});

	test('renders main content area with dashboard by default', async ({ page }) => {
		await expect(page.getByText('Frontier Industries')).toBeVisible();
		await expect(page.getByText('Welcome, Founder. Build your empire.')).toBeVisible();
	});
});
