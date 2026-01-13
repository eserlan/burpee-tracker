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
        start_url: './#/today',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        cacheId: 'burpee-tracker-v1',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt}']
      }
    })
  ]
});
