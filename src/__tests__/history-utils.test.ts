import { describe, expect, it } from 'vitest';
import { clearExpandedDays, getExpandedDaysCount, toggleDay } from '../pages/history';

describe('clearExpandedDays', () => {
  it('actually clears the expanded days count', () => {
    const rerender = () => {};
    
    // Start empty
    clearExpandedDays();
    expect(getExpandedDaysCount()).toBe(0);
    
    // Expand a day
    toggleDay('2024-01-15', rerender);
    expect(getExpandedDaysCount()).toBe(1);
    
    // Expand another
    toggleDay('2024-01-16', rerender);
    expect(getExpandedDaysCount()).toBe(2);
    
    // Clear
    clearExpandedDays();
    expect(getExpandedDaysCount()).toBe(0);
  });
});
