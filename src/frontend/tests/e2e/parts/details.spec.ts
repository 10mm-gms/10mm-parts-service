import { test, expect } from '@playwright/test';

test.describe('Part Details (REQ-PARTS-005)', () => {
    test('should view part details by clicking on part code', async ({ page }) => {
        // 1. Navigate to the Parts page
        await page.goto('/');

        // 2. Create a part
        await page.click('button:has-text("Add New Part")');
        await page.fill('#mpn', 'DETAILS-TEST-001');
        await page.fill('#description', 'Detailed description for testing');
        await page.fill('#type', 'Bushing');
        await page.selectOption('#system', 'Suspension');
        await page.click('#submit-part');

        // 3. Click on the part code link
        // We use a more robust selector that finds the link inside the row
        const row = page.locator('tr:has-text("DETAILS-TEST-001")');
        const codeLink = row.locator('td a').first();
        await codeLink.click();

        // 4. Verify we are on the details page
        await expect(page).toHaveURL(/\/parts\/[a-f0-9-]+/);
        await expect(page.locator('h1')).toHaveText('DETAILS-TEST-001');
        await expect(page.getByText('Detailed description for testing')).toBeVisible();
        await expect(page.getByText('Suspension')).toBeVisible();
    });
});
