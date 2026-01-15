import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test('should load the app and show core elements', async ({ page }) => {
        await page.goto('/');

        // Check title
        await expect(page).toHaveTitle(/Burpee/);

        // Check for the +10 button
        const addButton = page.getByLabel('Add 10 burpees');
        await expect(addButton).toBeVisible();

        // Check for today total section
        await expect(page.getByText('Today total', { exact: true })).toBeVisible();

        // Check for navigation (Settings and History should be visible)
        await expect(page.getByRole('link', { name: /History/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Settings/i })).toBeVisible();
    });
});
