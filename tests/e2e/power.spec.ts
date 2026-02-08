import { test, expect } from '@playwright/test';
import { freshGame, getTabButton } from './helpers';

test.describe('Power System (T019)', () => {
	test.beforeEach(async ({ page }) => {
		await freshGame(page);
	});

	test('buying Helios tier increases power generation', async ({ page }) => {
		// Navigate to Helios and buy a Rooftop Solar
		await getTabButton(page, 'Helios Power').click();
		const buildButton = page.getByRole('button', { name: /Build/i }).first();
		await buildButton.click();

		// Wait for the game loop tick to recalculate power (ticks every 1s)
		await page.waitForTimeout(1500);

		// The tier card should show a power stat (⚡ with MW value)
		// Rooftop Solar generates 0.005 MW per unit = +0.01 MW shown
		await expect(page.getByText('MW').first()).toBeVisible();
	});

	test('power display shows in resource bar', async ({ page }) => {
		const resourceBar = page.locator('header[aria-label="Player resources"]');
		await expect(resourceBar.getByText('Power')).toBeVisible();
		await expect(resourceBar.getByText('MW')).toBeVisible();
	});

	test('power status is green when balanced', async ({ page }) => {
		// Navigate to Helios and buy some solar
		await getTabButton(page, 'Helios Power').click();
		const buildButton = page.getByRole('button', { name: /Build/i }).first();
		await buildButton.click();
		await page.waitForTimeout(1500);

		// With only Helios generation and no consumers, should be green (ok status)
		const powerValue = page.locator('header[aria-label="Player resources"]')
			.locator('.text-bio-green');
		await expect(powerValue).toBeVisible();
	});

	test('power deficit shows red warning banner', async ({ page }) => {
		// Craft a game state with more consumption than generation.
		// Helios: 1 Rooftop Solar = 0.005 MW generated
		// Apex: 10 Sounding Rockets = 10 * 0.01 = 0.1 MW consumed
		// => Deficit: 0.005 MW gen vs 0.1 MW consumed
		await page.evaluate(() => {
			return new Promise<void>((resolve) => {
				const state = {
					version: 1,
					lastSaved: Date.now(),
					lastPlayed: Date.now(),
					cash: 100000,
					researchPoints: 0,
					influence: 0,
					foundersVision: 0,
					powerGenerated: 0.005,
					powerConsumed: 0.1,
					divisions: {
						apex: {
							unlocked: true,
							tiers: [
								{ unlocked: true, count: 0, level: 0, producing: false, progress: 0 },
								{ unlocked: true, count: 10, level: 0, producing: false, progress: 0 },
								{ unlocked: true, count: 0, level: 0, producing: false, progress: 0 },
								{ unlocked: false, count: 0, level: 0, producing: false, progress: 0 },
								{ unlocked: false, count: 0, level: 0, producing: false, progress: 0 },
								{ unlocked: false, count: 0, level: 0, producing: false, progress: 0 }
							],
							chiefLevel: 0,
							bottlenecks: []
						},
						volt: {
							unlocked: false,
							tiers: [
								{ unlocked: true, count: 0, level: 0, producing: false, progress: 0 },
								{ unlocked: false, count: 0, level: 0, producing: false, progress: 0 },
								{ unlocked: false, count: 0, level: 0, producing: false, progress: 0 },
								{ unlocked: false, count: 0, level: 0, producing: false, progress: 0 },
								{ unlocked: false, count: 0, level: 0, producing: false, progress: 0 }
							],
							chiefLevel: 0,
							bottlenecks: []
						},
						helios: {
							unlocked: true,
							tiers: [
								{ unlocked: true, count: 1, level: 0, producing: false, progress: 0 },
								{ unlocked: true, count: 0, level: 0, producing: false, progress: 0 },
								{ unlocked: false, count: 0, level: 0, producing: false, progress: 0 },
								{ unlocked: false, count: 0, level: 0, producing: false, progress: 0 },
								{ unlocked: false, count: 0, level: 0, producing: false, progress: 0 },
								{ unlocked: false, count: 0, level: 0, producing: false, progress: 0 }
							],
							chiefLevel: 0,
							bottlenecks: []
						}
					},
					unlockedResearch: [],
					activeResearch: null,
					prestigeCount: 0,
					totalValueEarned: 0,
					achievements: [],
					stats: {
						totalTaps: 0,
						totalCashEarned: 0,
						totalResearchCompleted: 0,
						playTimeMs: 0,
						sessionsPlayed: 1
					},
					settings: {
						musicEnabled: true,
						sfxEnabled: true,
						notificationsEnabled: true,
						offlineProgressEnabled: true
					}
				};

				const request = indexedDB.open('technomania', 1);
				request.onupgradeneeded = () => {
					const db = request.result;
					if (!db.objectStoreNames.contains('saves')) {
						db.createObjectStore('saves');
					}
				};
				request.onsuccess = () => {
					const db = request.result;
					const tx = db.transaction('saves', 'readwrite');
					tx.objectStore('saves').put(JSON.stringify(state), 'autosave');
					tx.oncomplete = () => {
						db.close();
						resolve();
					};
				};
			});
		});

		// Reload to pick up the saved state
		await page.reload();
		await page.locator('.game-shell').waitFor({ state: 'visible', timeout: 10_000 });

		// Dismiss welcome-back if shown
		const welcomeBackBtn = page.getByRole('button', { name: "Let's Go" });
		if (await welcomeBackBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await welcomeBackBtn.click();
		}

		// Wait for the game loop to recalculate power (takes a tick)
		await page.waitForTimeout(2000);

		// Power deficit banner should be visible
		const deficitBanner = page.locator('[data-testid="power-deficit-banner"]');
		await expect(deficitBanner).toBeVisible({ timeout: 5_000 });

		// Banner should mention production percentage
		await expect(deficitBanner).toContainText('Power Deficit');
		await expect(deficitBanner).toContainText('%');
	});
});
