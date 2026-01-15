import { describe, expect, it } from 'vitest';
import { groupEntriesByDay, buildHistory, formatTime } from '../stats';
import type { Entry } from '../types';

const makeEntry = (id: string, timestamp: string): Entry => ({
  id,
  timestamp,
  count: 10
});

describe('groupEntriesByDay', () => {
  it('groups entries by training day', () => {
    const entries: Entry[] = [
      makeEntry('1', '2024-01-15T10:00:00Z'),
      makeEntry('2', '2024-01-15T14:00:00Z'),
      makeEntry('3', '2024-01-16T09:00:00Z')
    ];

    const grouped = groupEntriesByDay(entries);
    expect(grouped.size).toBe(2);
    expect(grouped.get('2024-01-15')?.length).toBe(2);
    expect(grouped.get('2024-01-16')?.length).toBe(1);
  });

  it('handles empty entries', () => {
    const grouped = groupEntriesByDay([]);
    expect(grouped.size).toBe(0);
  });
});

describe('buildHistory', () => {
  it('builds history sorted by date descending', () => {
    const entries: Entry[] = [
      makeEntry('1', '2024-01-15T10:00:00Z'),
      makeEntry('2', '2024-01-16T10:00:00Z')
    ];

    const history = buildHistory(entries);
    expect(history.length).toBe(2);
    expect(history[0].dateKey).toBe('2024-01-16');
    expect(history[1].dateKey).toBe('2024-01-15');
  });

  it('calculates totals correctly', () => {
    const entries: Entry[] = [
      makeEntry('1', '2024-01-15T10:00:00Z'),
      makeEntry('2', '2024-01-15T11:00:00Z'),
      makeEntry('3', '2024-01-15T12:00:00Z')
    ];

    const history = buildHistory(entries);
    expect(history[0].total).toBe(30);
    expect(history[0].entries.length).toBe(3);
  });

  it('handles empty entries', () => {
    const history = buildHistory([]);
    expect(history.length).toBe(0);
  });
});

describe('formatTime', () => {
  it('formats timestamp to HH:MM', () => {
    // Note: This test may be timezone-dependent
    const time = formatTime('2024-01-15T14:30:00Z');
    expect(time).toMatch(/^\d{2}:\d{2}$/);
  });
});
