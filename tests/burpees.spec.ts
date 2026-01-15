import { test, expect } from '@playwright/test';

test.describe('Burpee Tracking', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Clear IndexedDB to have a clean state
        await page.evaluate(async () => {
            const databases = await window.indexedDB.databases();
            for (const db of databases) {
                if (db.name) window.indexedDB.deleteDatabase(db.name);
            }
            window.location.reload();
        });
        await page.waitForLoadState('networkidle');
    });

    test('should increment burpees and allow undo', async ({ page }) => {
        const addButton = page.getByLabel('Add 10 burpees');

        // Initial state check
        const totalDisplay = page.locator('div:has-text("Today total") >> p.text-3xl');
        await expect(totalDisplay).toHaveText('0');

        // Add 10
        await addButton.click();
        await expect(totalDisplay).toHaveText('10');

        // Add another 10
        await addButton.click();
        await expect(totalDisplay).toHaveText('20');

        // Undo last action
        const undoButton = page.getByLabel('Undo last 10 burpees');
        await expect(undoButton).toBeVisible();
        await undoButton.click();

        await expect(totalDisplay).toHaveText('10');

        // Undo again (until 0)
        await undoButton.click();
        await expect(totalDisplay).toHaveText('0');

        // Undo button should disappear
        await expect(undoButton).not.toBeVisible();
    });

    test('should show celebration message when adding burpees', async ({ page }) => {
        const addButton = page.getByLabel('Add 10 burpees');
        await addButton.click();

        // Check for celebration message (aria-live polite)
        const celebration = page.locator('.celebration-message');
        await expect(celebration).toBeVisible();
        // It should have some text from our list
        const text = await celebration.textContent();
        expect(text?.length).toBeGreaterThan(0);
    });

    test('should persist data across page reloads', async ({ page }) => {
        const addButton = page.getByLabel('Add 10 burpees');
        await addButton.click();

        const totalDisplay = page.locator('div:has-text("Today total") >> p.text-3xl');
        await expect(totalDisplay).toHaveText('10');

        // Reload page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Total should still be 10
        await expect(totalDisplay).toHaveText('10');
    });
});
