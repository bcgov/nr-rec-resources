import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('returns null for undefined', () => {
    expect(formatDate(undefined)).toBeNull();
  });

  it('returns null for null', () => {
    expect(formatDate(null)).toBeNull();
  });

  it('returns null for invalid date', () => {
    expect(formatDate('not-a-date')).toBeNull();
  });

  it('formats a valid date string', () => {
    expect(formatDate('2024-06-01')).toBe('May 31, 2024');
  });

  it('formats a timestamp', () => {
    expect(formatDate(Date.UTC(2024, 5, 1))).toBe('May 31, 2024');
  });

  it('formats a Date object', () => {
    expect(formatDate(new Date('2024-06-01'))).toBe('May 31, 2024');
  });
});
