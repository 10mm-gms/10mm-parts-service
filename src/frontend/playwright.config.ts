import { defineConfig, devices } from '@playwright/test';

/**
 * Standard Playwright Configuration (Standard Version: 0.1)
 * Reference: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: [['html', { open: 'never' }]],
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: [
        {
            command: 'cd ../.. && rm -f e2e-test.db && DATABASE_URL=sqlite:///./e2e-test.db PYTHONPATH=src/backend uv run uvicorn main:app --port 8001 > e2e-backend.log 2>&1',
            url: 'http://localhost:8001/health',
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'npm run dev',
            url: 'http://localhost:5173',
            reuseExistingServer: !process.env.CI,
        }
    ],
});
