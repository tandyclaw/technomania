import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',

	use: {
		baseURL: 'http://localhost:3000',
		trace: 'on-first-retry',
	},

	projects: [
		{
			name: 'mobile',
			use: {
				browserName: 'chromium',
				viewport: { width: 375, height: 667 },
				isMobile: true,
			},
		},
		{
			name: 'desktop',
			use: {
				browserName: 'chromium',
				viewport: { width: 1280, height: 720 },
			},
		},
	],

	webServer: {
		command: 'npm run dev -- --port 3000',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 30_000,
	},
});
