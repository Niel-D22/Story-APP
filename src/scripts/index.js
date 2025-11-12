import "../styles/styles.css";
import App from "./pages/app";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[App] Service Worker registered:", registration);
      })
      .catch((error) => {
        console.error("[App] Service Worker registration failed:", error);
      });
  });
}

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// ▲▲▲ SAMPAI DI SINI ▲▲▲

document.addEventListener("DOMContentLoaded", async () => {
  // ... (sisa kode Anda)
});
