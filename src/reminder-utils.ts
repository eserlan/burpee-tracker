export const REMINDER_WINDOW_START = 8; // 8 AM
export const REMINDER_WINDOW_END = 21; // 9 PM
export const INACTIVITY_THRESHOLD_MS = 3 * 60 * 60 * 1000; // 3 hours

/**
 * Pure function to decide if a reminder notification should be shown.
 * @param now The current Date object
 * @param latestEntryTimestamp The timestamp of the most recent burpee entry, or null
 * @returns boolean
 */
export const shouldShowReminder = (now: Date, latestEntryTimestamp: number | null): boolean => {
    const hour = now.getHours();

    // Rule 1: Only notify during the daytime window
    if (hour < REMINDER_WINDOW_START || hour >= REMINDER_WINDOW_END) {
        return false;
    }

    // Rule 2: If no entries exist, we should definitely encourage a start
    if (latestEntryTimestamp === null) {
        return true;
    }

    // Rule 3: Only notify if the user has been inactive longer than the threshold
    const inactiveDuration = now.getTime() - latestEntryTimestamp;
    return inactiveDuration > INACTIVITY_THRESHOLD_MS;
};
