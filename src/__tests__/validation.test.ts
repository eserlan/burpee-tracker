import { describe, expect, it } from 'vitest';

// Test the isEntry validation logic extracted from state.ts
const isEntry = (entry: unknown): boolean => {
  if (typeof entry !== 'object' || entry === null) {
    return false;
  }
  const e = entry as Record<string, unknown>;
  if (typeof e.id !== 'string' || (e.id as string).trim().length === 0) {
    return false;
  }
  if (typeof e.timestamp !== 'string') {
    return false;
  }
  const parsedTimestamp = Date.parse(e.timestamp as string);
  if (Number.isNaN(parsedTimestamp)) {
    return false;
  }
  return e.count === 10;
};

const isValidGoal = (goal: number): boolean => goal >= 10 && goal <= 1000 && goal % 10 === 0;

describe('isEntry validation', () => {
  it('accepts valid entry', () => {
    expect(isEntry({ id: 'abc-123', timestamp: '2024-01-15T10:00:00Z', count: 10 })).toBe(true);
  });

  it('rejects empty id', () => {
    expect(isEntry({ id: '', timestamp: '2024-01-15T10:00:00Z', count: 10 })).toBe(false);
  });

  it('rejects whitespace-only id', () => {
    expect(isEntry({ id: '   ', timestamp: '2024-01-15T10:00:00Z', count: 10 })).toBe(false);
  });

  it('rejects invalid timestamp', () => {
    expect(isEntry({ id: 'abc', timestamp: 'not-a-date', count: 10 })).toBe(false);
  });

  it('rejects wrong count value', () => {
    expect(isEntry({ id: 'abc', timestamp: '2024-01-15T10:00:00Z', count: 5 })).toBe(false);
    expect(isEntry({ id: 'abc', timestamp: '2024-01-15T10:00:00Z', count: 20 })).toBe(false);
  });

  it('rejects non-object', () => {
    expect(isEntry(null)).toBe(false);
    expect(isEntry('string')).toBe(false);
    expect(isEntry(123)).toBe(false);
  });
});

describe('isValidGoal validation', () => {
  it('accepts valid goals', () => {
    expect(isValidGoal(10)).toBe(true);
    expect(isValidGoal(50)).toBe(true);
    expect(isValidGoal(100)).toBe(true);
    expect(isValidGoal(1000)).toBe(true);
  });

  it('rejects goals below 10', () => {
    expect(isValidGoal(0)).toBe(false);
    expect(isValidGoal(5)).toBe(false);
  });

  it('rejects goals above 1000', () => {
    expect(isValidGoal(1010)).toBe(false);
    expect(isValidGoal(2000)).toBe(false);
  });

  it('rejects goals not divisible by 10', () => {
    expect(isValidGoal(15)).toBe(false);
    expect(isValidGoal(23)).toBe(false);
    expect(isValidGoal(99)).toBe(false);
  });
});
