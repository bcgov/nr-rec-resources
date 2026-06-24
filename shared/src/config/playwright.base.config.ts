import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Limit to 1 worker in CI to prevent overwhelming the Docker-hosted server
  // and avoid "Premature close" asset-fetch errors under memory/CPU pressure.
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['line'],
    ['list', { printSteps: true }],
    // Never auto-open the HTML report in CI — it blocks the process.
    ['html', { open: process.env.CI ? 'never' : 'always' }],
  ],
  use: {
    bypassCSP: true,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'safari', use: { ...devices['Desktop Safari'] } },
    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        browserName: 'chromium', // Edge uses Chromium engine
        channel: 'msedge',
      },
    },
  ],
});
