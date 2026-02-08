import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
	test('loads correctly with title and start button', async ({ page }) => {
		await page.goto('/');

		// Check page title
		await expect(page).toHaveTitle(/Being Elon/);

		// Check hero text
		await expect(page.getByText('BEING').first()).toBeVisible();
		await expect(page.getByText('ELON').first()).toBeVisible();
		await expect(page.getByText('Build SpaceX. Scale Tesla. Launch Starlink.')).toBeVisible();

		// Check start button
		const startButton = page.getByRole('button', { name: /Start Game/i });
		await expect(startButton).toBeVisible();
	});

	test('shows all seven division cards', async ({ page }) => {
		await page.goto('/');

		const divisionNames = [
			'SpaceX',
			'Tesla',
			'xAI',
			'The Boring Company',
			'Neuralink',
			'Starlink',
			'Tesla Energy',
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
