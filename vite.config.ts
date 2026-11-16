import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/ — Vitest reads the `test` block from this same file.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    /*
     * Makes XO Lab an installable app that plays offline (decision D-53). At build time it
     * writes the web app manifest and a Workbox service worker that caches the whole build,
     * every variant's chunk included, and adds the script that registers it to index.html.
     * A new deploy's service worker waits until every XO Lab tab or window is closed before
     * it takes over, so an update never reloads, or breaks, a game in progress.
     * The icons come from public/icon.svg (`npm run icons`).
     */
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'XO Lab',
        short_name: 'XO Lab',
        description: 'Tic-tac-toe and its stranger cousins, for two or three players on one device.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        // The dark theme's page colour, which the icon is drawn on: the splash screen and title bar.
        theme_color: '#0b1020',
        background_color: '#0b1020',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // The Google Fonts stylesheet and font files, kept once fetched so the fonts work offline too.
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 20 } },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
