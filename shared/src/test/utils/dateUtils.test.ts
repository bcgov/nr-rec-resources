import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  formatDateISO,
  formatDateReadable,
  formatDateFull,
  formatDateShort,
  formatYearMonth,
  formatMonthYear,
  formatDateCustom,
  isValidDate,
  getCurrentDateISO,
} from '../../utils/dateUtils';

describe('dateUtils', () => {
  // Use UTC dates for consistent testing across all timezones
  // Output should be in Pacific timezone
  const testDate = new Date('2023-12-25T10:30:00.000Z'); // UTC input
  const invalidDate = 'invalid-date';

  describe('formatDateISO', () => {
    it('should format valid date to ISO format in Pacific timezone', () => {
      expect(formatDateISO(testDate)).toBe('2023-12-25');
    });

    it('should handle string date input', () => {
      // Test with date-only string that gets converted to UTC, displayed in Pacific
      expect(formatDateISO('2023-12-25')).toBe('2023-12-24'); // UTC midnight becomes Dec 24 in PST
    });

    it('should handle edge case dates', () => {
      // These will show the Pacific timezone dates
      expect(formatDateISO('2024-01-01')).toBe('2023-12-31'); // UTC midnight becomes Dec 31 in PST
      expect(formatDateISO('2024-07-01')).toBe('2024-06-30'); // UTC midnight becomes Jun 30 in PDT
    });

    it('should return null for invalid date', () => {
      expect(formatDateISO(invalidDate)).toBeNull();
      expect(formatDateISO(null)).toBeNull();
      expect(formatDateISO(undefined)).toBeNull();
    });
  });

  describe('formatDateReadable', () => {
    it('should format valid date to readable format in Pacific timezone', () => {
      expect(formatDateReadable(testDate)).toBe('Dec 25, 2023');
    });

    it('should return null for invalid date', () => {
      expect(formatDateReadable(invalidDate)).toBeNull();
    });
  });

  describe('formatDateFull', () => {
    it('should format valid date to full format', () => {
      expect(formatDateFull(testDate)).toBe('December 25, 2023');
    });

    it('should return null for invalid date', () => {
      expect(formatDateFull(invalidDate)).toBeNull();
    });
  });

  describe('formatDateShort', () => {
    it('should format valid date to short format', () => {
      expect(formatDateShort(testDate)).toBe('23-12-25');
    });

    it('should return null for invalid date', () => {
      expect(formatDateShort(invalidDate)).toBeNull();
    });
  });

  describe('formatYearMonth', () => {
    it('should format valid date to year-month format', () => {
      expect(formatYearMonth(testDate)).toBe('2023-12');
    });

    it('should return null for invalid date', () => {
      expect(formatYearMonth(invalidDate)).toBeNull();
    });
  });

  describe('formatMonthYear', () => {
    it('should format valid date to month-year format', () => {
      expect(formatMonthYear(testDate)).toBe('Dec 2023');
    });

    it('should return null for invalid date', () => {
      expect(formatMonthYear(invalidDate)).toBeNull();
    });
  });

  describe('formatDateCustom', () => {
    it('should format date with custom options using Pacific timezone', () => {
      const result = formatDateCustom(testDate, 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      expect(result).toBe('Monday, December 25, 2023');
    });

    it('should force Pacific timezone even if not specified', () => {
      const result = formatDateCustom('2023-12-25T10:00:00.000Z', 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      expect(result).toBe('12/25/2023');
    });

    it('should return null for invalid date', () => {
      expect(formatDateCustom(invalidDate, 'en-US', {})).toBeNull();
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate(testDate)).toBe(true);
      expect(isValidDate('2023-12-25')).toBe(true);
      expect(isValidDate(1703505000000)).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isValidDate(invalidDate)).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
      expect(isValidDate(new Date('invalid'))).toBe(false);
    });
  });

  describe('getCurrentDateISO', () => {
    it('should return current date in ISO format', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2023-12-25T12:00:00.000Z'));

      expect(getCurrentDateISO()).toBe('2023-12-25');

      vi.useRealTimers();
    });
  });
});
