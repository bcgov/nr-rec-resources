import { describe, expect, it, vi } from 'vitest';
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

  describe('UTC calendar date regression — DB date values must not shift by timezone', () => {
    // Prisma maps PostgreSQL `date` columns to JS Date objects at UTC midnight.
    // These tests verify that a UTC-midnight date always formats to the same
    // calendar day regardless of the environment's local timezone. In PST (UTC−8)
    // the old code would shift "2024-06-30T00:00:00.000Z" back to June 29.
    const utcMidnight = '2024-06-30T00:00:00.000Z';

    it('formatDateFull should preserve calendar date for UTC midnight input', () => {
      expect(formatDateFull(utcMidnight)).toBe('June 30, 2024');
    });

    it('formatDateReadable should preserve calendar date for UTC midnight input', () => {
      expect(formatDateReadable(utcMidnight)).toBe('Jun 30, 2024');
    });

    it('formatDateISO should preserve calendar date for UTC midnight input', () => {
      expect(formatDateISO(utcMidnight)).toBe('2024-06-30');
    });

    it('formatDateShort should preserve calendar date for UTC midnight input', () => {
      expect(formatDateShort(utcMidnight)).toBe('24-06-30');
    });

    it('formatYearMonth should preserve calendar month for UTC midnight input', () => {
      expect(formatYearMonth(utcMidnight)).toBe('2024-06');
    });

    it('formatMonthYear should preserve calendar month for UTC midnight input', () => {
      expect(formatMonthYear(utcMidnight)).toBe('Jun 2024');
    });

    it('America/Vancouver override formats timestamp in Pacific time', () => {
      // A UTC midnight date at Vancouver in summer is June 29 at 5:00 PM PDT (UTC−7).
      // This confirms the override works as expected for real timestamps.
      const result = formatDateFull(utcMidnight, {
        timeZone: 'America/Vancouver',
      });
      expect(result).toBe('June 29, 2024');
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
