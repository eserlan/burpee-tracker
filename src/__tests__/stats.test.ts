import { describe, expect, it } from 'vitest';
import { currentStreak, longestStreak } from '../stats';

const totalsMap = (entries: Array<[string, number]>) => new Map(entries);

describe('streaks', () => {
  it('counts current streak ending today', () => {
    const totals = totalsMap([
      ['2024-01-01', 50],
      ['2024-01-02', 60],
      ['2024-01-03', 0]
    ]);
    expect(currentStreak(totals, '2024-01-02', 50)).toBe(2);
    expect(currentStreak(totals, '2024-01-03', 50)).toBe(0);
  });

  it('breaks streak on missing day', () => {
    const totals = totalsMap([
      ['2024-01-01', 50],
      ['2024-01-03', 50]
    ]);
    expect(currentStreak(totals, '2024-01-03', 50)).toBe(1);
  });

  it('forgives a missed day when the next day makes up the deficit', () => {
    const totals = totalsMap([
      ['2024-01-01', 50],
      ['2024-01-02', 20],
      ['2024-01-03', 80]
    ]);
    expect(currentStreak(totals, '2024-01-03', 50)).toBe(3);
    expect(longestStreak(totals, 50)).toBe(3);
  });

  it('does not forgive when the next day falls short of the deficit', () => {
    const totals = totalsMap([
      ['2024-01-01', 50],
      ['2024-01-02', 20],
      ['2024-01-03', 70]
    ]);
    expect(currentStreak(totals, '2024-01-03', 50)).toBe(1);
    expect(longestStreak(totals, 50)).toBe(1);
  });

  it('computes longest streak across gaps', () => {
    const totals = totalsMap([
      ['2024-01-01', 50],
      ['2024-01-02', 50],
      ['2024-01-04', 50],
      ['2024-01-05', 50],
      ['2024-01-06', 40]
    ]);
    expect(longestStreak(totals, 50)).toBe(2);
  });
});
