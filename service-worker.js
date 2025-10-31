/**
 * Service Worker for Offline Functionality
 * Enables PWA caching and offline support
 */

const CACHE_NAME = 'digit-recognition-v1';

// Files to cache on install
const STATIC_CACHE_FILES = [
    './index.html',
    './manifest.json',
    './css/styles.css',
    './js/app.js',
    './js/canvas.js',
    './js/model.js',
    './js/ui.js',
    './js/stats.js'
];

// CDN files to cache (cache-first strategy)
const CDN_CACHE_FILES = [
    'https://cdn.jsdelivr.net/npm/fabric@5.3.0/dist/fabric.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js'
];

/**
 * Install event - cache static files
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_CACHE_FILES);
            })
            .then(() => {
                // Try to cache CDN files, but don't fail if unavailable
                return caches.open(CACHE_NAME)
                    .then((cache) => {
                        return Promise.allSettled(
                            CDN_CACHE_FILES.map(url =>
                                cache.add(url).catch(err => {
                                    console.log('Failed to cache:', url, err);
                                })
                            )
                        );
                    });
            })
            .then(() => self.skipWaiting())
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cache) => {
                        if (cache !== CACHE_NAME) {
                            console.log('Service Worker: Clearing old cache:', cache);
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

/**
 * Fetch event - serve from cache or network
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // For CDN resources, use cache-first strategy
    if (url.origin !== location.origin) {
        event.respondWith(
            caches.match(request)
                .then((cached) => {
                    if (cached) {
                        console.log('Service Worker: Serving from cache:', request.url);
                        return cached;
                    }

                    return fetch(request)
                        .then((response) => {
                            // Cache successful responses
                            if (response && response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(request, responseClone);
                                    });
                            }
                            return response;
                        })
                        .catch((error) => {
                            console.log('Service Worker: Fetch failed:', request.url, error);
                            throw error;
                        });
                })
        );
        return;
    }

    // For local resources, use network-first strategy
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Cache successful responses
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(request, responseClone);
                        });
                }
                return response;
            })
            .catch(() => {
                // Fall back to cache if network fails
                return caches.match(request)
                    .then((cached) => {
                        if (cached) {
                            console.log('Service Worker: Network failed, serving from cache:', request.url);
                            return cached;
                        }
                        throw new Error('No cached version available');
                    });
            })
    );
});
