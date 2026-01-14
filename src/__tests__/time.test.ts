import { describe, expect, it } from 'vitest';
import { trainingDayKey } from '../time';

describe('trainingDayKey', () => {
  it('uses previous day before rollover', () => {
    const date = new Date(2024, 0, 2, 3, 59);
    expect(trainingDayKey(date)).toBe('2024-01-01');
  });

  it('uses same day at rollover', () => {
    const date = new Date(2024, 0, 2, 4, 0);
    expect(trainingDayKey(date)).toBe('2024-01-02');
  });
});
