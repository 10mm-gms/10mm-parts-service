import { test, expect } from '@playwright/test';

test.describe('Part Lifecycle (REQ-PARTS-001)', () => {
    test('should create a new part via UI and verify it in the list', async ({ page }) => {
        await page.goto('/');

        await page.click('button:has-text("Add New Part")');

        await page.fill('#mpn', 'LIFECYCLE-001');
        await page.fill('#description', 'UI-based part creation test');
        await page.fill('#type', 'Bushing');
        await page.selectOption('#system', 'Suspension');

        await page.click('#submit-part');

        // Wait for modal to close
        await expect(page.locator('#mpn')).not.toBeVisible();

        const row = page.locator('tr:has-text("LIFECYCLE-001")');
        await expect(row).toBeVisible();

        // The code is in the first td, possibly inside an <a>
        const codeCell = row.locator('td').first();
        await expect(codeCell).toContainText(/.*-SUS-BUS-\d+/);
    });
});
