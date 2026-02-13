import { test, expect } from '@playwright/test';

test.describe('Vehicle Lifecycle (REQ-VEH-001/2/3/5)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/vehicles');
    });

    test('should create a new vehicle via UI and verify it in the list', async ({ page }) => {
        await page.click('button:has-text("Add New Vehicle")');

        await page.fill('#make', 'Rivian');
        await page.fill('#model', 'R1S');
        await page.fill('#from_year', '2022');
        await page.selectOption('#power_type', 'EV');

        await page.click('#submit-vehicle');

        const row = page.locator('tr:has-text("Rivian")');
        await expect(row).toBeVisible();
        await expect(row).toContainText('R1S');
    });

    test('should update an existing vehicle', async ({ page }) => {
        // Assume seeding or the previous test left a vehicle
        const editButton = page.locator('tr:has-text("Rivian") .edit-vehicle').first();
        await editButton.click();

        await page.fill('#model', 'R1S Adventure');
        await page.click('#submit-vehicle');

        await expect(page.locator('tr:has-text("R1S Adventure")')).toBeVisible();
    });

    test('should delete a vehicle', async ({ page }) => {
        const deleteButton = page.locator('tr:has-text("Rivian") .delete-vehicle').first();

        page.on('dialog', dialog => dialog.accept());
        await deleteButton.click();

        await expect(page.locator('tr:has-text("Rivian")')).not.toBeVisible();
    });
});
