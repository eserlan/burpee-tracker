import type { Entry, ExportBlobV1 } from './types';
import {
  addEntry,
  deleteEntry,
  exportAll,
  getDailyGoal,
  importReplace,
  listEntries,
  setDailyGoal
} from './db';
import { buildHistory, currentStreak, longestStreak, totalsByDay } from './stats';
import { todayKey, trainingDayKey } from './time';

const DEFAULT_GOAL = 50;

export type DerivedState = {
  todayKey: string;
  todayTotal: number;
  canUndoToday: boolean;
  currentStreak: number;
  longestStreak: number;
  history: ReturnType<typeof buildHistory>;
};

export type AppState = {
  entries: Entry[];
  dailyGoal: number;
  derived: DerivedState;
};

const listeners = new Set<() => void>();

const deriveState = (entries: Entry[], dailyGoal: number): DerivedState => {
  const totals = totalsByDay(entries);
  const today = todayKey();
  const todayTotal = totals.get(today) ?? 0;
  const canUndoToday = entries.some((entry) => trainingDayKey(new Date(entry.timestamp)) === today);
  return {
    todayKey: today,
    todayTotal,
    canUndoToday,
    currentStreak: currentStreak(totals, today, dailyGoal),
    longestStreak: longestStreak(totals, dailyGoal),
    history: buildHistory(entries)
  };
};

export const state: AppState = {
  entries: [],
  dailyGoal: DEFAULT_GOAL,
  derived: {
    todayKey: todayKey(),
    todayTotal: 0,
    canUndoToday: false,
    currentStreak: 0,
    longestStreak: 0,
    history: []
  }
};

const emitChange = () => {
  state.derived = deriveState(state.entries, state.dailyGoal);
  listeners.forEach((listener) => listener());
};

export const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const initState = async (): Promise<void> => {
  try {
    const [goal, entries] = await Promise.all([getDailyGoal(), listEntries()]);
    state.dailyGoal = goal ?? DEFAULT_GOAL;
    state.entries = entries;
    emitChange();
  } catch (error) {
    console.error('Failed to initialize state:', error);
    window.alert('Failed to load your data. Please refresh the page.');
  }
};

export const addTen = async (): Promise<void> => {
  // crypto.randomUUID() requires a secure context (HTTPS or localhost).
  // This works on GitHub Pages (HTTPS) and during local development.
  const entry: Entry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    count: 10
  };
  try {
    await addEntry(entry);
    state.entries = [...state.entries, entry];
    emitChange();
  } catch (error) {
    console.error('Failed to add entry:', error);
    window.alert('Failed to save your burpees. Please try again.');
  }
};

export const undoLast = async (): Promise<void> => {
  // Find the most recent entry from today's training day only
  const today = todayKey();
  const todaysEntries = state.entries.filter(
    (entry) => trainingDayKey(new Date(entry.timestamp)) === today
  );

  if (todaysEntries.length === 0) {
    return;
  }

  // Get the last entry from today (entries are sorted by timestamp)
  const lastTodayEntry = todaysEntries[todaysEntries.length - 1];

  try {
    await deleteEntry(lastTodayEntry.id);
    state.entries = state.entries.filter((entry) => entry.id !== lastTodayEntry.id);
    emitChange();
  } catch (error) {
    console.error('Failed to undo entry:', error);
    window.alert('Failed to undo. Please try again.');
  }
};

const isValidGoal = (goal: number): boolean => goal >= 10 && goal <= 1000 && goal % 10 === 0;

export const setGoal = async (goal: number): Promise<void> => {
  if (!Number.isFinite(goal) || !isValidGoal(goal)) {
    window.alert('Goal must be between 10 and 1000, and divisible by 10.');
    return;
  }
  state.dailyGoal = goal;
  try {
    await setDailyGoal(goal);
    emitChange();
  } catch (error) {
    console.error('Failed to set goal:', error);
    window.alert('Failed to save your new goal. Please try again.');
  }
};

export const exportJson = async (): Promise<string> => {
  const blob = await exportAll();
  return JSON.stringify(blob, null, 2);
};

const isEntry = (entry: Entry): boolean => {
  if (typeof entry.id !== 'string' || entry.id.trim().length === 0) {
    return false;
  }
  if (typeof entry.timestamp !== 'string') {
    return false;
  }
  const parsedTimestamp = Date.parse(entry.timestamp);
  if (Number.isNaN(parsedTimestamp)) {
    return false;
  }
  return entry.count === 10;
};

export const importJson = async (blob: ExportBlobV1): Promise<void> => {
  if (blob.schemaVersion !== 1) {
    throw new Error('Unsupported schema version');
  }
  if (!blob.settings || !isValidGoal(blob.settings.dailyGoal)) {
    throw new Error('Invalid settings');
  }
  if (!Array.isArray(blob.entries) || !blob.entries.every(isEntry)) {
    throw new Error('Invalid entries');
  }
  await importReplace(blob);
  await initState();
};
