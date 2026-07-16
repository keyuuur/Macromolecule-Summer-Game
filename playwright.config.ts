import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:49317',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'ipad-portrait',
      use: { ...devices['iPad (gen 7)'], browserName: 'chromium', viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'ipad-landscape',
      use: { ...devices['iPad (gen 7) landscape'], browserName: 'chromium', viewport: { width: 1024, height: 768 } },
    },
  ],
  webServer: {
    command: 'npm run preview:test',
    url: 'http://127.0.0.1:49317',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
