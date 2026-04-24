import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'opencv/opencv.js', 'corpus/*', 'samples/*', 'tesseract/*'],
      manifest: {
        name: 'Evidence Scout',
        short_name: 'EvScout',
        description: 'Clinical evidence, at the bedside.',
        theme_color: '#0d9488', // teal-600
        background_color: '#f9fafb',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,wasm,traineddata}']
      }
    })
  ]
})
