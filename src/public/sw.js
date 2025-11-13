// --- LOAD WORKBOX ---
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js"
);

const { precaching, routing, strategies, cacheableResponse, expiration } =
  workbox;
const { precacheAndRoute, cleanupOutdatedCaches } = precaching;
const { registerRoute } = routing;
const { NetworkFirst } = strategies;
const { CacheableResponsePlugin } = cacheableResponse;
const { ExpirationPlugin } = expiration;

// --- INISIALISASI DASAR ---
self.skipWaiting();
self.addEventListener("activate", () => self.clients.claim());
cleanupOutdatedCaches();

// --- PRECACHE SEMUA FILE BUILD ---
precacheAndRoute(self.__WB_MANIFEST || []);

// --- CEGAH CACHE REQUEST NON-GET ---
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
});

// --- CACHING UNTUK API STORY DICODING ---
registerRoute(
  ({ url, request }) =>
    url.origin === "https://story-api.dicoding.dev" && request.method === "GET",
  new NetworkFirst({
    cacheName: "story-map-api-cache",
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

// --- PUSH NOTIFICATION HANDLER ---
self.addEventListener("push", (event) => {
  console.log(
    "[SW] Push received:",
    event.data ? event.data.text() : "no data"
  );

  let data = {
    title: "Story App",
    body: "Ada notifikasi baru dari Story App!",
  };

  if (event.data) {
    try {
      const jsonData = event.data.json();
      data.title = jsonData.title || data.title;
      data.body = jsonData.body || jsonData.options?.body || data.body;
    } catch (err) {
      const textData = event.data.text();
      console.warn("[SW] Push data was plain text:", textData);
      data.body = textData;
    }
  }

  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    vibrate: [200, 100, 200],
    data: {
      url: "/#/home",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// --- HANDLE KLIK NOTIFIKASI ---
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes("/#/home") && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data?.url || "/#/home");
        }
      })
  );
});
