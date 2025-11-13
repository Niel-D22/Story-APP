// File: src/public/sw.js
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// --- INISIALISASI DASAR ---
self.skipWaiting();
self.addEventListener('activate', () => self.clients.claim());
cleanupOutdatedCaches();

// --- PRECACHE SEMUA FILE YANG DIGENERATE OLEH VITE ---
precacheAndRoute(self.__WB_MANIFEST || []);

// --- CEGAH CACHE UNTUK REQUEST SELAIN GET ---
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    // Jangan biarkan Workbox coba cache POST/PUT/DELETE
    return;
  }
});

// --- CACHING UNTUK API DICODING ---
registerRoute(
  ({ url, request }) =>
    url.origin === 'https://story-api.dicoding.dev' && request.method === 'GET',

  new NetworkFirst({
    cacheName: 'story-map-api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      }),
    ],
    networkTimeoutSeconds: 10,
  })
);

// --- HANDLER PUSH NOTIFICATION ---
self.addEventListener('push', (event) => {
  console.log('Service worker pushing...');
 
  async function chainPromise() {
    await self.registration.showNotification('Ada laporan baru untuk Anda!', {
      body: 'Terjadi kerusakan lampu jalan di Jl. Melati',
    });
  }
 
  event.waitUntil(chainPromise());
});

// --- HANDLER KLIK NOTIFIKASI ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/#/home';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});
