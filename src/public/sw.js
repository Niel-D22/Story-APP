// File: src/public/sw.js
// ✅ PERBAIKAN: Gunakan importScripts untuk Workbox (bukan ES6 import)

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

const { precacheAndRoute, cleanupOutdatedCaches } = workbox.precaching;
const { registerRoute } = workbox.routing;
const { NetworkFirst } = workbox.strategies;
const { CacheableResponsePlugin } = workbox.cacheableResponse;
const { ExpirationPlugin } = workbox.expiration;

// --- Kriteria 3: Caching Aset (Otomatis oleh InjectManifest) ---
self.skipWaiting();
cleanupOutdatedCaches();

// Precache semua aset yang di-generate oleh Vite
precacheAndRoute(self.__WB_MANIFEST || []);

// --- Kriteria 3: Caching untuk API (Mode Offline) ---
registerRoute(
  // Cache request ke API Dicoding
  ({ url }) => url.origin === 'https://story-api.dicoding.dev',

  new NetworkFirst({
    cacheName: 'story-map-api-cache',
    plugins: [
      // Hanya cache request GET
      {
        cacheWillUpdate: async ({ request, response }) => {
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

  // Coba parse data sebagai JSON, fallback ke text
  try {
    if (event.data) {
      const payload = event.data.json();
      notificationData.title = payload.title || notificationData.title;
      notificationData.body = payload.body || notificationData.body;
      notificationData.icon = payload.icon || notificationData.icon;
      notificationData.data = { url: payload.url || '/#/home' };
      notificationData.actions = [
        { action: 'open', title: 'Buka Cerita' },
        { action: 'close', title: 'Tutup' },
      ];
    }
  } catch (e) {
    // Jika bukan JSON, gunakan sebagai text
    console.warn('[SW] Push data was not JSON, treating as text.');
    if (event.data) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: '/icons/icon-192x192.png',
      tag: 'story-notification',
      data: notificationData.data,
      actions: notificationData.actions || [],
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
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
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