import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["line"],
    ["list", { printSteps: true }],
    ["html", { open: "always" }],
  ],
  use: {
    bypassCSP: true,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "safari", use: { ...devices["Desktop Safari"] } },
    {
      name: "Microsoft Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
  ],
});
