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

// Streaks can forgive a single missed day if the following day (chronologically)
// meets both its own goal and the missed day's deficit.
export const currentStreak = (totals: Map<string, number>, today: string, goal: number): number => {
  let streak = 0;
  let cursor = parseKeyToDate(today);
  let carryover = 0;

  while (true) {
    const key = formatDateKey(cursor);
    const total = totals.get(key) ?? 0;
    if (streak === 0) {
      if (total < goal) {
        break;
      }
      streak = 1;
      carryover = total - goal;
    } else if (total >= goal) {
      streak += 1;
      carryover = total - goal;
    } else if (carryover > 0 && total + carryover >= goal) {
      streak += 1;
      carryover = 0;
    } else {
      break;
    }
    cursor = addDays(cursor, -1);
  }

  return streak;
};

export const longestStreak = (totals: Map<string, number>, goal: number): number => {
  const keys = Array.from(totals.keys()).sort((a, b) => a.localeCompare(b));

  if (keys.length === 0) {
    return 0;
  }

  let longest = 0;
  let current = 0;
  // pendingDeficit/pendingBase track a single day that missed the goal and the streak
  // length immediately before it. The next day can clear the deficit if it meets the
  // goal plus the missing amount.
  let pendingDeficit: number | null = null;
  let pendingBase = 0;

  const processDay = (total: number) => {
    if (pendingDeficit !== null) {
      if (total >= goal + pendingDeficit) {
        current = pendingBase + 2;
        longest = Math.max(longest, current);
        pendingDeficit = null;
      } else if (total >= goal) {
        current = 1;
        longest = Math.max(longest, current);
        pendingDeficit = null;
      } else {
        current = 0;
        pendingDeficit = goal - total;
        pendingBase = 0;
      }
      return;
    }

    if (total >= goal) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      pendingDeficit = goal - total;
      pendingBase = current;
      current = 0;
    }
  };

  const dayDiff = (prev: Date, next: Date): number => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const start = Date.UTC(prev.getFullYear(), prev.getMonth(), prev.getDate());
    const end = Date.UTC(next.getFullYear(), next.getMonth(), next.getDate());
    return Math.round((end - start) / msPerDay);
  };

  let prevDate: Date | null = null;
  keys.forEach((key) => {
    const currentDate = parseKeyToDate(key);
    if (prevDate) {
      const gap = dayDiff(prevDate, currentDate);
      if (gap > 2) {
        current = 0;
        pendingDeficit = null;
        pendingBase = 0;
      } else if (gap === 2) {
        processDay(0);
      }
    }
    processDay(totals.get(key) ?? 0);
    prevDate = currentDate;
  });

  return longest;
};
