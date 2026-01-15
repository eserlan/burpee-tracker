import { test, expect } from '@playwright/test';

test.describe('PWA Features', () => {
    test('should have a registered service worker', async ({ page }) => {
        await page.goto('/');

        // Wait for SW registration
        const swStatus = await page.evaluate(async () => {
            if (!('serviceWorker' in navigator)) return 'not-supported';

            // Wait a bit for registration to happen
            for (let i = 0; i < 50; i++) {
                const regs = await navigator.serviceWorker.getRegistrations();
                if (regs.length > 0) return 'registered';
                await new Promise(r => setTimeout(r, 100));
            }
            return 'not-registered';
        });

        expect(swStatus).toBe('registered');
    });

    test('should have a valid web manifest link', async ({ page }) => {
        await page.goto('/');
        const manifestLink = page.locator('link[rel="manifest"]');
        await expect(manifestLink).toHaveAttribute('href', /manifest\.webmanifest|manifest\.json/);
    });

    test('should have theme color meta tag', async ({ page }) => {
        await page.goto('/');
        const themeColor = page.locator('meta[name="theme-color"]');
        await expect(themeColor).toHaveAttribute('content', '#0f172a');
    });
});
