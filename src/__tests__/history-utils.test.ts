import { describe, expect, it } from 'vitest';
import { clearExpandedDays } from '../pages/history';

describe('clearExpandedDays', () => {
  it('does not throw when called', () => {
    // Basic smoke test - the function should not throw
    expect(() => clearExpandedDays()).not.toThrow();
  });

  it('can be called multiple times', () => {
    clearExpandedDays();
    clearExpandedDays();
    // Should not throw
    expect(true).toBe(true);
  });
});
