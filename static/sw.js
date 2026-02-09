/**
 * Service Worker for "Being Elon" PWA
 * Handles offline caching with a cache-first strategy for static assets
 * and network-first for navigation/API requests.
 */

const CACHE_NAME = 'being-elon-v1';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
	'/',
	'/game',
	'/manifest.json',
	'/favicon.png',
	'/favicon.svg',
	'/icon-192.png',
	'/icon-512.png'
];

// Install: pre-cache core assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(PRECACHE_ASSETS))
			.then(() => self.skipWaiting())
	);
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== CACHE_NAME)
						.map((key) => caches.delete(key))
				)
			)
			.then(() => self.clients.claim())
	);
});

// Fetch: cache-first for static assets, network-first for pages
self.addEventListener('fetch', (event) => {
	const { request } = event;

	// Skip non-GET requests
	if (request.method !== 'GET') return;

	// Skip cross-origin requests
	if (!request.url.startsWith(self.location.origin)) return;

	// For navigation requests (HTML pages): network-first
	if (request.mode === 'navigate') {
		event.respondWith(
			fetch(request)
				.then((response) => {
					// Cache the latest version
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
					return response;
				})
				.catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
		);
		return;
	}

	// For static assets (JS, CSS, images, fonts): cache-first
	event.respondWith(
		caches.match(request).then((cached) => {
			if (cached) {
				// Return cached version, but update cache in background
				fetch(request)
					.then((response) => {
						if (response.ok) {
							caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
						}
					})
					.catch(() => {
						/* offline, ignore */
					});
				return cached;
			}

			// Not in cache: fetch from network and cache it
			return fetch(request).then((response) => {
				if (response.ok) {
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
				}
				return response;
			});
		})
	);
});
