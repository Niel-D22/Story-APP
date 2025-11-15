import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'src', 'public'),
  
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  plugins: [
    VitePWA({
      // ✅ PERBAIKAN: Tambahkan strategies dengan benar
      strategies: 'injectManifest',
      
      srcDir: resolve(__dirname, 'src', 'public'),
      filename: 'sw.js',
      
      manifest: {
        name: "StoryMap-app",
        short_name: "App",
        icons: [
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
      },
      
      // Workbox options untuk injectManifest
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,ico}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      },
      
      devOptions: {
        enabled: true,
        type: 'module',
      }
    }),
  ],

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