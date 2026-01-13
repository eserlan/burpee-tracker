import { openDB, type DBSchema } from 'idb';
import type { Entry, ExportBlobV1 } from './types';

interface BurpeeDB extends DBSchema {
  entries: {
    key: string;
    value: Entry;
    indexes: { 'by-timestamp': string };
  };
  settings: {
    key: string;
    value: { key: string; value: number };
  };
}

const DB_NAME = 'burpee-tracker';
const DB_VERSION = 1;

const dbPromise = openDB<BurpeeDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    const entriesStore = db.createObjectStore('entries', { keyPath: 'id' });
    entriesStore.createIndex('by-timestamp', 'timestamp');
    db.createObjectStore('settings', { keyPath: 'key' });
  }
});

export const listEntries = async (): Promise<Entry[]> => {
  const db = await dbPromise;
  return db.getAllFromIndex('entries', 'by-timestamp');
};

export const addEntry = async (entry: Entry): Promise<void> => {
  const db = await dbPromise;
  await db.put('entries', entry);
};

export const deleteEntry = async (id: string): Promise<void> => {
  const db = await dbPromise;
  await db.delete('entries', id);
};

export const getLastEntry = async (): Promise<Entry | null> => {
  const db = await dbPromise;
  const tx = db.transaction('entries');
  const index = tx.store.index('by-timestamp');
  const cursor = await index.openCursor(undefined, 'prev');
  await tx.done;
  return cursor?.value ?? null;
};

export const getDailyGoal = async (): Promise<number | null> => {
  const db = await dbPromise;
  const record = await db.get('settings', 'dailyGoal');
  return record?.value ?? null;
};

export const setDailyGoal = async (goal: number): Promise<void> => {
  const db = await dbPromise;
  await db.put('settings', { key: 'dailyGoal', value: goal });
};

export const exportAll = async (): Promise<ExportBlobV1> => {
  const db = await dbPromise;
  const entries = await db.getAllFromIndex('entries', 'by-timestamp');
  const record = await db.get('settings', 'dailyGoal');
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    settings: {
      dailyGoal: record?.value ?? 50
    },
    entries
  };
};

export const importReplace = async (blob: ExportBlobV1): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction(['entries', 'settings'], 'readwrite');
  await tx.objectStore('entries').clear();
  await tx.objectStore('settings').clear();

  await Promise.all([
    tx.objectStore('settings').put({ key: 'dailyGoal', value: blob.settings.dailyGoal }),
    ...blob.entries.map((entry) => tx.objectStore('entries').put(entry))
  ]);

  await tx.done;
};
