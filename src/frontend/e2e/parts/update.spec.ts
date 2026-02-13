import { test, expect } from '@playwright/test';

test.describe('Part Update (REQ-PARTS-002)', () => {
    test('should update an existing part via UI', async ({ page }) => {
        await page.goto('/');

        await page.click('button:has-text("Add New Part")');
        await page.fill('#mpn', 'UPDATE-001');
        await page.fill('#description', 'Original Description');
        await page.fill('#type', 'Bushing');
        await page.selectOption('#system', 'Suspension');
        await page.click('#submit-part');

        // Wait for creation
        const row = page.locator('tr:has-text("UPDATE-001")');
        await expect(row).toBeVisible();

        // Click Edit
        await row.locator('.edit-part').click();

        // Wait for modal and verify current value
        await expect(page.locator('#description')).toHaveValue('Original Description');

        // Update the description
        await page.fill('#description', 'Updated Description');
        await page.click('#submit-part');

        // Wait for modal to close
        await expect(page.locator('#description')).not.toBeVisible();

        // Verify the update in the list
        await expect(row).toContainText('Updated Description');
    });
});
