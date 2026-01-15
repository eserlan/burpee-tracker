import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare let self: ServiceWorkerGlobalScope & {
    __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

// @ts-expect-error - clientsClaim is not yet in the types for self
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

const DB_NAME = 'burpee-tracker';
const DB_VERSION = 1;

// Simple non-idb implementation for the SW to avoid extra dependencies/bundling issues
const getLatestEntryTimestamp = (): Promise<number | null> => {
    return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('entries')) {
                resolve(null);
                return;
            }
            const transaction = db.transaction('entries', 'readonly');
            const store = transaction.objectStore('entries');
            const index = store.index('by-timestamp');
            const cursorRequest = index.openCursor(null, 'prev');

            cursorRequest.onsuccess = (e) => {
                const cursor = (e.target as IDBRequest).result;
                if (cursor) {
                    resolve(Date.parse(cursor.value.timestamp));
                } else {
                    resolve(null);
                }
            };
            cursorRequest.onerror = () => resolve(null);
        };
        request.onerror = () => resolve(null);
    });
};

import { shouldShowReminder } from './reminder-utils';

const checkAndNotify = async () => {
    const now = new Date();
    const latestTimestamp = await getLatestEntryTimestamp();

    if (shouldShowReminder(now, latestTimestamp)) {
        self.registration.showNotification('Time for 10?', {
            body: "You haven't logged any burpees in a while. Keep the momentum going!",
            icon: '/burpee-tracker/favicon.svg',
            badge: '/burpee-tracker/favicon.svg',
            tag: 'burpee-reminder',
            renotify: true
        });
    }
};

interface PeriodicSyncEvent extends ExtendableEvent {
    readonly tag: string;
}

function isPeriodicSyncEvent(event: Event): event is PeriodicSyncEvent {
    return 'tag' in event && typeof (event as Record<string, unknown>).tag === 'string';
}

self.addEventListener('periodicsync' as const, (event: Event) => {
    if (!isPeriodicSyncEvent(event)) {
        return;
    }
    if (event.tag === 'burpee-reminder') {
        event.waitUntil(checkAndNotify());
    }
});

// Also check on install/activate for debugging or immediate testing
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(self.clients.openWindow('/burpee-tracker/#/today'));
});
