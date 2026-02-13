import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://localhost:8001' });

test('landing page serves HTML not JSON', async ({ page }) => {
    // We expect the root to serve the React app (HTML), not a JSON health check or 404
    const response = await page.goto('/');

    // Verify response headers or content
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('text/html');

    // Verify we see some React app indicator, e.g., the title from App.tsx
    await expect(page).toHaveTitle(/Parts Service/);
});
