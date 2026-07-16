import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: 'Macromolecule Evidence Lab',
        short_name: 'Evidence Lab',
        description: 'A short formative biology diagnostic and misconception-repair activity.',
        theme_color: '#163c4a',
        background_color: '#f4f0e7',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,webp,json}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    maxWorkers: 1,
    setupFiles: './src/test/setup.ts',
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
