// File: src/scripts/index.js
import "../styles/styles.css";
import App from "./pages/app.js";
import PushNotificationInit from './init-push.js';
import L from "leaflet";
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const app = new App({
  content: document.getElementById("main-content"),
  navList: document.getElementById("nav-list"),
});

// Register Service Worker
if ("serviceWorker" in navigator&& !import.meta.env.DEV) {
  window.addEventListener("load", async () => {
    try {
      // ✅ Register dengan type classic (default)
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("[SW] Service Worker registered:", registration.scope);

      // Tunggu SW active
      await navigator.serviceWorker.ready;
      console.log('[SW] Service Worker ready');
      
      // ✅ Inisialisasi Push Notification setelah SW ready
     navigator.serviceWorker.ready.then(() => {
  PushNotificationInit.init();
});


    } catch (error) {
      console.error("[SW] Registration failed:", error);
    }
  });

  // Handle SW updates
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    console.log('[SW] Controller changed, reloading...');
    window.location.reload();
  });
}

// Initialize app routing
document.addEventListener("DOMContentLoaded", () => {
  app.renderPage();
  
  // Setup drawer button
  const drawerButton = document.getElementById("drawer-button");
  const navigationDrawer = document.getElementById("navigation-drawer");

  if (drawerButton && navigationDrawer) {
    drawerButton.addEventListener("click", (e) => {
      e.stopPropagation();
      navigationDrawer.classList.toggle("open");
      const isOpen = navigationDrawer.classList.contains("open");
      drawerButton.setAttribute("aria-expanded", isOpen);
    });

    document.addEventListener("click", (e) => {
      if (
        !navigationDrawer.contains(e.target) &&
        !drawerButton.contains(e.target)
      ) {
        navigationDrawer.classList.remove("open");
        drawerButton.setAttribute("aria-expanded", "false");
      }
    });
  }
});

// Handle hash changes
window.addEventListener("hashchange", () => {
  app.renderPage();
});

// ✅ Expose PushNotificationInit untuk debugging (opsional)
if (import.meta.env.DEV) {
  window.pushNotification = PushNotificationInit;
}

// Handle online/offline events
window.addEventListener('online', () => {
  console.log('[App] Back online');
  // Trigger sync jika ada data offline
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.sync.register('sync-stories');
    });
  }
});

window.addEventListener('offline', () => {
  console.log('[App] Gone offline');
});