import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, retries: 0,
  reporter: 'list', use: { baseURL: 'http://localhost:5174', trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev -- --port 5174', url: 'http://localhost:5174', reuseExistingServer: false,
    env: { VITE_API_BASE_URL: 'http://localhost:3100/api/v1' } },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
