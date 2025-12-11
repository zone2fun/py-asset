// Minimal Service Worker to enable PWA "Add to Home Screen" feature
// This satisfies the browser's requirement for a fetch handler

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests. 
  // For offline capability, caching logic would go here.
  event.respondWith(fetch(event.request));
});