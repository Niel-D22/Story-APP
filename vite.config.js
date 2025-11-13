import { defineConfig } from 'vite';
import { resolve } from 'path'; // <-- PASTIKAN INI ADA
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // ▼▼▼ BAGIAN YANG HILANG & PENTING ▼▼▼
  // Memberitahu Vite di mana root (index.html) berada
  root: resolve(__dirname, 'src'),
  
  // Memberitahu Vite di mana folder public (icons/sw.js) berada
  publicDir: resolve(__dirname, 'src', 'public'),
  
  // Memberitahu Vite di mana harus meletakkan hasil build
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // ▲▲▲ SELESAI BAGIAN YANG HILANG ▲▲▲

  plugins: [
    VitePWA({
      
      // ▼▼▼ PERBAIKAN DARI REVIEWER ▼▼▼
      // 1. Perbaiki typo: 'strategies' -> 'strategy'
      strategy: 'injectManifest',
      
      // 2. Tentukan lokasi sw.js
      srcDir: resolve(__dirname, 'src', 'public'),
      filename: 'sw.js',
      // ▲▲▲ SELESAI PERBAIKAN PWA ▲▲▲
      
      manifest: {
        name: "StoryMap-app",
        short_name: "App",
        icons: [
          // Daftar icon Anda...
          { "src": "icons/icon-48x48.png", "sizes": "48x48", "type": "image/png" },
          { "src": "icons/icon-72x72.png", "sizes": "72x72", "type": "image/png" },
          { "src": "icons/icon-96x96.png", "sizes": "96x96", "type": "image/png" },
          { "src": "icons/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
          { "src": "icons/icon-144x144.png", "sizes": "144x144", "type": "image/png" },
          { "src": "icons/icon-152x152.png", "sizes": "152x152", "type": "image/png" },
          { "src": "icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
          { "src": "icons/icon-256x256.png", "sizes": "256x256", "type": "image/png" },
          { "src": "icons/icon-384x384.png", "sizes": "384x384", "type": "image/png" },
          { "src": "icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
        ],
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000"
      }
    }),
  ],

  // Pengaturan server Anda
  server: {
    host: true,
    port: 5173,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 5173,
      overlay: true,
    },
  },
});