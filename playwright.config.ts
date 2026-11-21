import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against the production build (`pnpm build` first), served by
 * `astro preview`. Run with `pnpm test:e2e`.
 */
/*
 * Whether this runs in CI. Read through globalThis so the file type-checks without
 * @types/node (the project has no other need for Node's type definitions).
 */
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const CI = Boolean(env.CI);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'pnpm preview --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !CI,
    timeout: 60_000,
  },
});
