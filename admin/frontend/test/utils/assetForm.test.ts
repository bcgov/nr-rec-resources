import { parseNumber, toDateInputValue } from '@/utils/assetForm';
import { describe, expect, it } from 'vitest';

describe('assetForm utils', () => {
  it('returns formatted date for valid date values', () => {
    expect(toDateInputValue('2026-01-15T12:34:56.000Z')).toBe('2026-01-15');
  });

  it('returns empty string when date value is missing or invalid', () => {
    expect(toDateInputValue(null)).toBe('');
    expect(toDateInputValue(undefined)).toBe('');
    expect(toDateInputValue('not-a-date')).toBe('');
  });

  it('parses numeric strings and trims whitespace', () => {
    expect(parseNumber(' 12.34 ')).toBe(12.34);
  });

  it('returns null for empty or non-numeric values', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('   ')).toBeNull();
    expect(parseNumber('abc')).toBeNull();
  });
});
