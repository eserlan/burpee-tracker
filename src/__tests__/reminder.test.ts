import { describe, it, expect } from 'vitest';
import { shouldShowReminder, REMINDER_WINDOW_START, REMINDER_WINDOW_END, INACTIVITY_THRESHOLD_MS } from '../reminder-utils';

describe('shouldShowReminder', () => {
    it('returns true if there are no entries and it is within the window', () => {
        const now = new Date();
        now.setHours(10, 0, 0, 0); // 10 AM
        expect(shouldShowReminder(now, null)).toBe(true);
    });

    it('returns false if it is before the reminder window', () => {
        const now = new Date();
        now.setHours(REMINDER_WINDOW_START - 1, 59, 0, 0); // 7:59 AM
        expect(shouldShowReminder(now, null)).toBe(false);
    });

    it('returns false if it is after the reminder window', () => {
        const now = new Date();
        now.setHours(REMINDER_WINDOW_END, 0, 0, 0); // 9:00 PM
        expect(shouldShowReminder(now, null)).toBe(false);
    });

    it('returns true if inactivity period exceeded within the window', () => {
        const now = new Date();
        now.setHours(14, 0, 0, 0); // 2 PM
        const latest = now.getTime() - (INACTIVITY_THRESHOLD_MS + 1000); // 3h 1s ago
        expect(shouldShowReminder(now, latest)).toBe(true);
    });

    it('returns false if user was recently active', () => {
        const now = new Date();
        now.setHours(14, 0, 0, 0); // 2 PM
        const latest = now.getTime() - (INACTIVITY_THRESHOLD_MS - 1000); // 2h 59m 59s ago
        expect(shouldShowReminder(now, latest)).toBe(false);
    });

    it('respects the exact window boundary (8 AM)', () => {
        const now = new Date();
        now.setHours(REMINDER_WINDOW_START, 0, 0, 0); // 8:00 AM
        expect(shouldShowReminder(now, null)).toBe(true);
    });

    it('respects the exact window boundary (9 PM)', () => {
        const now = new Date();
        now.setHours(REMINDER_WINDOW_END, 0, 0, 0); // 9:00 PM
        expect(shouldShowReminder(now, null)).toBe(false);
    });
});
