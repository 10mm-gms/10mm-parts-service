import { test, expect } from '@playwright/test';

test.describe('BUG-2602102127: Navigation Tabs and Locations/Stock features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should have navigation tabs for Parts, Vehicles, and Locations', async ({ page }) => {
        const nav = page.locator('nav');
        await expect(nav).toBeVisible();
        await expect(nav.locator('a:has-text("Parts")')).toBeVisible();
        await expect(nav.locator('a:has-text("Vehicles")')).toBeVisible();
        await expect(nav.locator('a:has-text("Locations")')).toBeVisible();
    });

    test('should be able to navigate to Locations and perform CRUD', async ({ page }) => {
        await page.click('a:has-text("Locations")');

        await expect(page).toHaveURL(/\/locations/);
        await expect(page.locator('h1')).toContainText('Locations');

        // Add Location
        await page.click('button:has-text("Add New Location")');
        await page.fill('#name', 'Main Warehouse');
        await page.fill('#address', '123 Storage Lane');
        await page.click('#submit-location');

        await expect(page.locator('table')).toContainText('Main Warehouse');
    });

    test('should manage stock levels on Part Details page', async ({ page }) => {
        // Ensure a location exists first
        await page.click('a:has-text("Locations")');
        if (!await page.locator('text=Main Warehouse').isVisible()) {
            await page.click('button:has-text("Add New Location")');
            await page.fill('#name', 'Main Warehouse');
            await page.fill('#address', '123 Storage Lane');
            await page.click('#submit-location');
        }

        // Create a part
        await page.click('a:has-text("Parts")');
        await page.click('#add-new-part');
        await page.fill('#mpn', 'STOCK-PN-999');
        await page.fill('#description', 'Stock Test Part');
        await page.fill('#type', 'Mechanical');
        await page.selectOption('#system', 'Brakes');
        await page.click('#submit-part');
        await page.waitForTimeout(1000);

        // Go to parts list and wait for it to appear
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        // Find the link in the same row as the MPN
        const link = page.locator('tr', { hasText: 'STOCK-PN-999' }).locator('a').first();
        await link.click();

        await expect(page).toHaveURL(/\/parts\/[a-f0-9-]+/);

        // Check for Stock section
        await expect(page.locator('label:has-text("Warehouse Status")')).toBeVisible();

        // Check ability to add stock level
        await page.click('button:has-text("+ Add Stock")');
        await page.selectOption('#location', { label: 'Main Warehouse' });
        await page.fill('#quantity', '50');
        await page.click('#save-stock');

        await expect(page.locator('.stock-item')).toContainText('50');
        await expect(page.locator('.stock-item')).toContainText('Main Warehouse');
    });
});
