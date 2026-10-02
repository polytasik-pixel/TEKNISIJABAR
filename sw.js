// Service Worker for PWA Installability
const CACHE_NAME = 'teknisi-jabar-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Pass-through fetch for live data
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
