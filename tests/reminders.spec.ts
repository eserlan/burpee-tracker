import { test, expect } from '@playwright/test';

test.describe('Reminders', () => {
    test.beforeEach(async ({ page }) => {
        // Mock Notification API to behave as if granted
        await page.addInitScript(() => {
            // @ts-ignore
            window.Notification = class {
                static get permission() { return 'granted'; }
                static requestPermission() { return Promise.resolve('granted'); }
                // @ts-ignore
                constructor(title, options) { console.log('Mock Notification:', title); }
            };
        });

        // Navigate to the settings page
        await page.goto('/burpee-tracker/#/settings');
    });

    test('should show reminder section and allow enabling', async ({ page }) => {


        // Check if the reminder section exists
        const remindersHeader = page.getByText('Reminders', { exact: true });
        await expect(remindersHeader).toBeVisible();

        // Initial status check (might be "Enabled (No Sync)" in desktop chrome)
        const statusText = page.locator('#status-text');
        await expect(statusText).toBeVisible();

        // Mock periodicSync if possible or just check the interaction
        // Playwright doesn't fully support mocking periodicSync yet, 
        // but we can check if the button exists and triggers the status update.
        const enableBtn = page.locator('#enable-reminders-btn');
        await expect(enableBtn).toBeVisible();
        await enableBtn.click();

        // Check for the "Test" button which only appears after permission is granted
        const testBtn = page.locator('#test-notification-btn');
        await expect(testBtn).toBeVisible();
    });

    test('should trigger a test notification', async ({ page }) => {
        // Permission already granted in beforeEach

        // Click the test button
        const testBtn = page.locator('#test-notification-btn');
        await expect(testBtn).toBeVisible();

        // We can't easily "capture" the notification in a standard Playwright test
        // without more advanced setup, but we can verify clicking the button
        // doesn't crash and the button is present.
        await testBtn.click();
    });
});
