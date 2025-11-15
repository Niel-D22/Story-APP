// sw.js - Service Worker dengan Classic Script (bukan module)

// ✅ Load Workbox dengan importScripts (classic way)
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js'
);

// Cek apakah Workbox berhasil di-load
if (workbox) {
  console.log('[SW] Workbox loaded successfully');

  const { precaching, routing, strategies, cacheableResponse, expiration } = workbox;
  const { precacheAndRoute, cleanupOutdatedCaches } = precaching;
  const { registerRoute } = routing;
  const { NetworkFirst, StaleWhileRevalidate } = strategies;
  const { CacheableResponsePlugin } = cacheableResponse;
  const { ExpirationPlugin } = expiration;

  // Skip waiting dan claim clients
  self.skipWaiting();
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });

  // Cleanup outdated caches
  cleanupOutdatedCaches();

  // Precache files yang di-inject oleh Vite PWA
  precacheAndRoute(self.__WB_MANIFEST || []);

  // Cegah cache request non-GET
  self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
      return;
    }
  });

  // Caching untuk API Story Dicoding
  registerRoute(
    ({ url, request }) =>
      url.origin === 'https://story-api.dicoding.dev' &&
      request.method === 'GET',
    new NetworkFirst({
      cacheName: 'story-map-api-cache',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
        }),
      ],
      networkTimeoutSeconds: 10,
    })
  );

  // Cache untuk static assets (images, fonts, etc)
  registerRoute(
    ({ request }) =>
      request.destination === 'image' ||
      request.destination === 'font' ||
      request.destination === 'style',
    new StaleWhileRevalidate({
      cacheName: 'static-assets-cache',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 hari
        }),
      ],
    })
  );

} else {
  console.error('[SW] Workbox failed to load');
}

// ========================================
// PUSH NOTIFICATION HANDLERS
// ========================================

// Handle push event
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event.data ? event.data.text() : 'no data');

  let notificationData = {
    title: 'Story App',
    body: 'Ada notifikasi baru dari Story App!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
  };

  // Parse data dari push
  if (event.data) {
    try {
      const jsonData = event.data.json();
      notificationData.title = jsonData.title || notificationData.title;
      notificationData.body = jsonData.body || jsonData.options?.body || notificationData.body;
      
      // Custom data untuk routing
      if (jsonData.data) {
        notificationData.data = jsonData.data;
      }
    } catch (err) {
      // Jika bukan JSON, anggap plain text
      const textData = event.data.text();
      console.log('[SW] Push data (plain text):', textData);
      notificationData.body = textData;
    }
  }

  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [200, 100, 200],
    tag: `story-notification-${Date.now()}`, // ✅ Tag unik dengan timestamp
    renotify: true, // ✅ Force tampilkan notifikasi baru
    requireInteraction: false,
    data: {
      url: notificationData.data?.url || '/#/home',
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: 'open', title: 'Buka', icon: '/icons/icon-192x192.png' },
      { action: 'close', title: 'Tutup' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open atau focus app
  const urlToOpen = event.notification.data?.url || '/#/home';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Cek apakah ada window yang sudah buka
        for (const client of clientList) {
          if (client.url.includes('/#/') && 'focus' in client) {
            client.navigate(urlToOpen);
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

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// ========================================
// BACKGROUND SYNC (untuk offline stories)
// ========================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-stories') {
    event.waitUntil(syncOfflineStories());
  }
});

async function syncOfflineStories() {
  try {
    console.log('[SW Sync] Starting to sync offline stories...');

    // Buka IndexedDB
    const db = await openDB();
    const offlineStories = await getAllOfflineStories(db);

    if (offlineStories.length === 0) {
      console.log('[SW Sync] No offline stories to sync');
      return;
    }

    console.log(`[SW Sync] Found ${offlineStories.length} offline stories`);

    for (const story of offlineStories) {
      try {
        // Convert base64 back to blob
        const photoBlob = await base64ToBlob(story.photoBase64, story.photoType);

        const formData = new FormData();
        formData.append('description', story.description);
        formData.append('lat', story.lat);
        formData.append('lon', story.lon);
        formData.append('photo', photoBlob, story.photoName);

        // Send to API
        const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${story.token}`,
          },
          body: formData,
        });

        if (response.ok) {
          // Delete from IndexedDB setelah berhasil sync
          await deleteOfflineStory(db, story.id);
          console.log(`[SW Sync] Story ${story.id} synced successfully`);

          // Show notification
          await self.registration.showNotification('Story Ter-sync!', {
            body: `Story "${story.description.slice(0, 50)}..." berhasil di-upload`,
            icon: '/icons/icon-192x192.png',
            tag: 'sync-success',
          });
        } else {
          console.error(`[SW Sync] Failed to sync story ${story.id}:`, response.status);
        }
      } catch (error) {
        console.error(`[SW Sync] Error syncing story ${story.id}:`, error);
      }
    }

    console.log('[SW Sync] Sync completed');
  } catch (error) {
    console.error('[SW Sync] Sync failed:', error);
  }
}

// Helper functions untuk IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StoryMapDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offline-stories')) {
        db.createObjectStore('offline-stories', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('favorites')) {
        db.createObjectStore('favorites', { keyPath: 'id' });
      }
    };
  });
}

function getAllOfflineStories(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offline-stories'], 'readonly');
    const store = transaction.objectStore('offline-stories');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteOfflineStory(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offline-stories'], 'readwrite');
    const store = transaction.objectStore('offline-stories');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function base64ToBlob(base64, type) {
  return fetch(base64).then((res) => res.blob());
}

console.log('[SW] Service Worker initialized');
