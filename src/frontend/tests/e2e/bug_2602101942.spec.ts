import { test, expect } from '@playwright/test';

test.describe('BUG-2602101942: Missing fields in Add Vehicle modal', () => {
    test('Add Vehicle modal should have all properties from US-006', async ({ page }) => {
        await page.goto('/vehicles');

        // Wait for the page to load
        await expect(page.locator('h1')).toContainText('Vehicle Fleet');

        // Open the modal
        await page.click('button:has-text("Add New Vehicle")');

        // Check for required fields from US-006
        await expect(page.locator('#make')).toBeVisible();
        await expect(page.locator('#model')).toBeVisible();
        await expect(page.locator('#from_year')).toBeVisible();
        await expect(page.locator('#power_type')).toBeVisible();
        await expect(page.locator('#body_style')).toBeVisible();
        await expect(page.locator('#drive_type')).toBeVisible();

        // Check for optional/other fields
        await expect(page.locator('#to_year')).toBeVisible();
        await expect(page.locator('#variant')).toBeVisible();
        await expect(page.locator('#trim_level')).toBeVisible();
    });
});
