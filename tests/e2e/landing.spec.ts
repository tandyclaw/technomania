import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
	test('loads correctly with title and start button', async ({ page }) => {
		await page.goto('/');

		// Check page title
		await expect(page).toHaveTitle(/Technomania/);

		// Check hero text
		await expect(page.getByText('TECHNOMANIA').first()).toBeVisible();
		await expect(page.getByText('Build rockets. Train AI. Bore tunnels.')).toBeVisible();

		// Check start button
		const startButton = page.getByRole('button', { name: /Start Game/i });
		await expect(startButton).toBeVisible();
	});

	test('shows all seven division cards', async ({ page }) => {
		await page.goto('/');

		const divisionNames = [
			'Apex Rocketry',
			'Volt Motors',
			'Nexus AI',
			'Underpass Co.',
			'Synapse Labs',
			'Orbital Net',
			'Helios Power',
		];

		for (const name of divisionNames) {
			await expect(page.getByText(name).first()).toBeVisible();
		}
	});

	test('"Start Game" navigates to /game', async ({ page }) => {
		await page.goto('/');

		const startButton = page.getByRole('button', { name: /Start Game/i });
		await startButton.click();

		// Should navigate to /game
		await page.waitForURL('**/game');
		expect(page.url()).toContain('/game');
	});
});
