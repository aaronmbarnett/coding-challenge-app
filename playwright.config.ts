import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: 'e2e',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],

  // Global test timeout
  timeout: 30000,

  // Shared settings for all tests
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:4173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Record video only when retrying
    video: 'retain-on-failure',

    // Take screenshot only when retrying
    screenshot: 'only-on-failure',

    // Default timeout for each action
    actionTimeout: 10000,

    // Default timeout for navigation
    navigationTimeout: 10000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
