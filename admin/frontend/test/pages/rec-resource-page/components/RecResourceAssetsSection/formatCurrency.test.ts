import { formatCurrency } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/formatCurrency';
import { describe, expect, it } from 'vitest';

describe('formatCurrency', () => {
  it('formats a positive value as CAD currency with no decimal places', () => {
    expect(formatCurrency(1234)).toBe('$1,234');
  });

  it('rounds to the nearest whole dollar', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats negative values', () => {
    expect(formatCurrency(-500)).toBe('-$500');
  });
});
