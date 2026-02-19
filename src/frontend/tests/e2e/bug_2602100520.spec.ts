import { test, expect } from '@playwright/test';

test.use({ baseURL: process.env.PLAYWRIGHT_MODE === 'SYSTEM' ? 'http://localhost:8001' : 'http://localhost:5173' });

test('Part Create Modal has all fields from US-001', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Parts');
    await page.click('button:has-text("Add New Part")', { timeout: 10000 });

    // Existing fields
    await expect(page.locator('#mpn')).toBeVisible();
    await expect(page.locator('#description')).toBeVisible();
    await expect(page.locator('#type')).toBeVisible();
    await expect(page.locator('#system')).toBeVisible();

    // Missing fields (these should fail)
    await expect(page.locator('#oe-number')).toBeVisible();
    await expect(page.locator('#price')).toBeVisible();
    await expect(page.locator('#supplier')).toBeVisible();
    await expect(page.locator('#url')).toBeVisible();
    await expect(page.locator('#notes')).toBeVisible();
    await expect(page.locator('#oe-description')).toBeVisible();
    await expect(page.locator('#availability')).toBeVisible();
    await expect(page.locator('#image')).toBeVisible();
    await expect(page.locator('#alternatives')).toBeVisible();
});

test('successfully creates a part with all fields', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Parts');
    await page.click('button:has-text("Add New Part")', { timeout: 10000 });

    await page.fill('#mpn', 'TEST-MPN-1');
    await page.fill('#description', 'Test Description');
    await page.fill('#type', 'Test Type');
    await page.selectOption('#system', 'Suspension');
    await page.fill('#oe-number', 'OE-12345');
    await page.selectOption('#availability', 'Available');
    await page.fill('#price', '99.99');
    await page.fill('#supplier', 'Test Supplier');
    await page.fill('#url', 'https://example.com');
    await page.fill('#image', 'https://example.com/image.png');
    await page.fill('#oe-description', 'OE Test Description');
    await page.fill('#notes', 'Test Notes');
    await page.fill('#alternatives', '');

    await page.click('#submit-part');

    // Wait for the part to appear in the table
    await expect(page.locator('table')).toContainText('TEST-MPN-1');
    await expect(page.locator('table')).toContainText('Test Description');
});
