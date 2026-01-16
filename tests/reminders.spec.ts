import { test, expect } from '@playwright/test';

test.describe('Reminders', () => {
    test.beforeEach(async ({ page }) => {
        // Mock Notification and Service Worker APIs
        await page.addInitScript(() => {
            // @ts-ignore
            window.__notifications = [];
            // @ts-ignore
            window.Notification = class {
                static get permission() { return 'granted'; }
                static requestPermission() { return Promise.resolve('granted'); }
                // @ts-ignore
                constructor(title, options) {
                    // @ts-ignore
                    window.__notifications.push({ title, options });
                }
            };

            // Mock service worker to avoid hanging on .ready
            Object.defineProperty(navigator, 'serviceWorker', {
                value: {
                    ready: Promise.resolve({
                        periodicSync: {
                            getTags: () => Promise.resolve([])
                        }
                    }),
                    register: () => Promise.resolve()
                },
                configurable: true
            });
        });

        // Navigate to the settings page relative to baseURL
        await page.goto('/#/settings');
    });

    test('should show reminder section and allow enabling', async ({ page }) => {
        // Check if the reminder section exists
        const remindersHeader = page.getByText('Reminders', { exact: true });
        await expect(remindersHeader).toBeVisible();

        // Initial status check
        const statusText = page.locator('#status-text');
        const statusDot = page.locator('#status-dot');

        // Should transition from "Checking status..." to "Enabled (No Sync)" 
        // because of our mock (no burpee-reminder tag yet)
        await expect(statusText).toHaveText('Enabled (No Sync)');
        await expect(statusDot).toHaveClass(/bg-amber-500/);

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

        await testBtn.click();

        // Verify notification was "triggered" in our mock
        const notifications = await page.evaluate(() => (window as any).__notifications);
        expect(notifications.length).toBeGreaterThan(0);
        expect(notifications[0].title).toBe('Burpee Tracker Test');
    });
});
