// File: src/public/sw.js

// Import library Workbox
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// --- Kriteria 3: Caching Aset (Otomatis oleh InjectManifest) ---
self.skipWaiting();
cleanupOutdatedCaches();


precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  // Cache request ke API Dicoding
  ({ url }) => url.origin === 'https://story-api.dicoding.dev',

  new NetworkFirst({
    cacheName: 'story-map-api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200], // 0 untuk opaque responses (CORS)
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Hari
      }),
    ],
  })
);

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let notificationData = {
    title: 'Ada Story Baru!',
    body: 'Seseorang baru saja menambahkan cerita.',
    icon: '/icons/icon-192x192.png',
    data: { url: '/#/home' },
  };

  // Ambil data dari push event jika ada
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || 'Ada cerita baru',
        icon: payload.icon || '/icons/icon-192x192.png',
        data: {
          url: payload.url || '/#/home',
        },
        actions: [
          { action: 'open', title: 'Buka Cerita' },
          { action: 'close', title: 'Tutup' },
        ],
      };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: '/icons/icon-192x192.png',
      tag: 'story-notification',
      data: notificationData.data,
      actions: notificationData.actions,
      vibrate: [200, 100, 200],
    })
  );
});

// --- Kriteria 2: Handler Klik Notifikasi ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/#/home';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Cek jika ada window yang sudah terbuka
      if (clientList.length > 0) {
        let client = clientList.find(c => c.url.includes(urlToOpen));
        if (client) {
          // Fokus ke window yang ada
          return client.focus();
        }
      }
      // Jika tidak ada, buka window baru
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});