// Di dalam file: src/scripts/index.js
import "../styles/styles.css";
import App from "./pages/app";

// ▼▼▼ TAMBAHKAN BLOK KODE INI ▼▼▼
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
// ▲▲▲ SAMPAI DI SINI ▲▲▲

document.addEventListener("DOMContentLoaded", async () => {
  // ... (sisa kode Anda)
});