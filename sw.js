const CACHE = 'timeplanner-v1';
const ASSETS = [
  '/time-planner/',
  '/time-planner/index.html',
  '/time-planner/manifest.json',
  '/time-planner/icon-192.png',
  '/time-planner/icon-512.png',
];

// Install: cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', e => {
  // Only handle same-origin or GAS requests with GET
  if (e.request.method !== 'GET') return;

  // For Google Apps Script (sync) — always network, never cache
  if (e.request.url.includes('script.google.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache a fresh copy of our own assets
        if (res.ok && e.request.url.includes('time-planner')) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
