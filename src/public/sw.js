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

// --- Kriteria 3: Caching untuk API (Mode Offline) ---
registerRoute(
  // Cache request ke API Dicoding
  ({ url }) => url.origin === 'https://story-api.dicoding.dev',

  new NetworkFirst({
    cacheName: 'story-map-api-cache',
    plugins: [
      // ▼▼▼ PERBAIKAN: Hanya cache request GET ▼▼▼
      {
        cacheWillUpdate: async ({ request, response, event, state }) => {
          if (request.method !== 'GET') {
            return null; // Jangan cache request POST, PUT, dll.
          }
          return response; // Lanjutkan cache untuk GET
        },
      },
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

// --- Kriteria 2: Handler Push Notification ---
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let notificationData = {
    title: 'Ada Story Baru!',
    body: 'Seseorang baru saja menambahkan cerita.',
    icon: '/icons/icon-192x192.png',
    data: { url: '/#/home' },
  };

  // ▼▼▼ PERBAIKAN: Tambahkan try...catch untuk JSON parse ▼▼▼
  try {
    // Coba baca data sebagai JSON
    if (event.data) {
      const payload = event.data.json();
      notificationData.title = payload.title || notificationData.title;
      notificationData.body = payload.body || 'Ada cerita baru';
      notificationData.icon = payload.icon || '/icons/icon-192x192.png';
      notificationData.data = { url: payload.url || '/#/home' };
      notificationData.actions = [
        { action: 'open', title: 'Buka Cerita' },
        { action: 'close', title: 'Tutup' },
      ];
    }
  } catch (e) {
    // JIKA GAGAL (karena menerima TEKS, bukan JSON):
    // Ambil data sebagai teks biasa dan gunakan sebagai 'body'
    console.warn('[SW] Push data was not JSON, treating as text.');
    notificationData.body = event.data.text();
  }
  // ▲▲▲ SELESAI PERBAIKAN ▲▲▲

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