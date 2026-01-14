import type { Entry } from './types';
import { trainingDayKey } from './time';

export type DaySummary = {
  dateKey: string;
  total: number;
  entries: Entry[];
};

const parseKeyToDate = (key: string): Date => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

const addDays = (date: Date, delta: number): Date => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + delta);
  return copy;
};

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// formatTime displays timestamps in the local timezone. If a user travels across
// timezones or changes their device timezone, displayed times will shift accordingly.
// This aligns with the training day calculation which uses 04:00 in local time.
export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const groupEntriesByDay = (entries: Entry[]): Map<string, Entry[]> => {
  const map = new Map<string, Entry[]>();
  entries.forEach((entry) => {
    const key = trainingDayKey(new Date(entry.timestamp));
    const list = map.get(key) ?? [];
    list.push(entry);
    map.set(key, list);
  });
  map.forEach((list) => list.sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
  return map;
};

export const buildHistory = (entries: Entry[]): DaySummary[] => {
  const grouped = groupEntriesByDay(entries);
  const dayKeys = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a));
  return dayKeys.map((dateKey) => {
    const dayEntries = grouped.get(dateKey) ?? [];
    const total = dayEntries.reduce((sum, entry) => sum + entry.count, 0);
    return {
      dateKey,
      total,
      entries: dayEntries
    };
  });
};

export const totalsByDay = (entries: Entry[]): Map<string, number> => {
  const grouped = groupEntriesByDay(entries);
  const totals = new Map<string, number>();
  grouped.forEach((dayEntries, key) => {
    totals.set(
      key,
      dayEntries.reduce((sum, entry) => sum + entry.count, 0)
    );
  });
  return totals;
};

export const currentStreak = (totals: Map<string, number>, today: string, goal: number): number => {
  let streak = 0;
  let cursor = parseKeyToDate(today);

  while (true) {
    const key = formatDateKey(cursor);
    const total = totals.get(key) ?? 0;
    if (total < goal) {
      break;
    }
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
};

export const longestStreak = (totals: Map<string, number>, goal: number): number => {
  const qualified = Array.from(totals.entries())
    .filter(([, total]) => total >= goal)
    .map(([key]) => key)
    .sort((a, b) => a.localeCompare(b));

  if (qualified.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let i = 1; i < qualified.length; i += 1) {
    const prevDate = parseKeyToDate(qualified[i - 1]);
    const currentDate = parseKeyToDate(qualified[i]);
    const nextExpected = addDays(prevDate, 1).toDateString();
    if (currentDate.toDateString() === nextExpected) {
      current += 1;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
  }

  longest = Math.max(longest, current);
  return longest;
};
