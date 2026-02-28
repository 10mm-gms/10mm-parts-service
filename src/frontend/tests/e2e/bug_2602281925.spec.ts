import { test, expect } from '@playwright/test';

test('parts page is visible', async ({ page }) => {
    // Navigate to parts page
    await page.goto('/');

    // Check if parts header is visible
    const header = page.getByRole('heading', { name: 'Parts', exact: true });
    await expect(header).toBeVisible();
});
