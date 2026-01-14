import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/burpee-tracker/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Burpee +10 Tracker',
        short_name: 'Burpee +10',
        start_url: '/burpee-tracker/#/today',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
          // TODO: Add PNG icons for better iOS support:
          // - icon-192.png (192x192)
          // - icon-512.png (512x512)
          // These can be generated from favicon.svg using image conversion tools
        ]
      },
      workbox: {
        cacheId: 'burpee-tracker-v2',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt}']
      }
    })
  ]
});
