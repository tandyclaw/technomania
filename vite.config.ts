import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		allowedHosts: [
			'tandys-mac-mini-1.tailb1bd5e.ts.net',
			'localhost',
			'127.0.0.1',
		],
	},
});
