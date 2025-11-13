import "../styles/styles.css";
import App from "./pages/app";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";


delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(() => console.log('[SW] Registered'))
    .catch(err => console.error('[SW] Register failed:', err));
}



document.addEventListener("DOMContentLoaded", async () => {
  // BUAT APLIKASI
  
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });
  
  await app.renderPage();

  // Tambahkan listener agar halaman berubah saat hash berubah
  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});