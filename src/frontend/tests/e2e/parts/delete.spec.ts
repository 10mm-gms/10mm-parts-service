import { test, expect } from '@playwright/test';

test.describe('Part Deletion (REQ-PARTS-003)', () => {
    test('should delete an existing part via UI', async ({ page }) => {
        // 1. Navigate to the Parts page
        await page.goto('/');

        // 2. Create a part first to ensure we have one to delete
        await page.click('button:has-text("Add New Part")');
        await page.fill('#mpn', 'DELETE-TEST-001');
        await page.fill('#description', 'Part to be deleted');
        await page.fill('#type', 'Bushing');
        await page.selectOption('#system', 'Suspension');
        await page.click('#submit-part');

        // 3. Find the row
        const row = page.locator('tr:has-text("DELETE-TEST-001")');
        await expect(row).toBeVisible();

        // 4. Click Delete and confirm
        page.on('dialog', dialog => dialog.accept());
        await row.locator('.delete-part').click();

        // 5. Verify the part is gone from the list
        await expect(row).not.toBeVisible();
    });
});
