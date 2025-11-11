import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa'; // <-- 1. IMPORT PLUGIN

// https://vitejs.dev/config/
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

  // ▼▼▼ 2. TAMBAHKAN SELURUH BLOK PLUGIN INI ▼▼▼
  plugins: [
    VitePWA({
      // Mengaktifkan PWA dan pendaftaran SW otomatis
      registerType: 'autoUpdate',

      
      manifest: {
        name: 'Story Map - Share Your Stories',
        short_name: 'Story Map',
        description: 'Bagikan kisahmu lewat peta interaktif...',
        theme_color: '#667eea',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
    
          {
            src: '/icons/icon-72x72.svg',
            sizes: '72x72',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-96x96.svg',
            sizes: '96x96',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-128x128.svg',
            sizes: '128x128',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-144x144.svg',
            sizes: '144x144',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-152x152.svg',
            sizes: '152x152',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-384x384.svg',
            sizes: '384x384',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },

      workbox: {
     
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],

     
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://story-api.dicoding.dev',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'story-map-api-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Hari
              },
              cacheableResponse: {
                statuses: [0, 200], 
              },
            },
          },
        ],
      },
    }),
  ],
});