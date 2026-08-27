import {
  validateLatitude,
  validateLongitude,
} from '@/utils/coordinateValidation';
import { validateCoordinateRow } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/BulkAddModalShared';
import { describe, expect, it } from 'vitest';

describe('validateLatitude', () => {
  it('returns undefined for empty string', () => {
    expect(validateLatitude('')).toBeUndefined();
  });

  it('accepts valid latitude with no decimals', () => {
    expect(validateLatitude('49')).toBeUndefined();
  });

  it('accepts valid latitude with up to 6 decimal places', () => {
    expect(validateLatitude('49.882600')).toBeUndefined();
  });

  it('accepts boundary values -90 and 90', () => {
    expect(validateLatitude('-90')).toBeUndefined();
    expect(validateLatitude('90')).toBeUndefined();
  });

  it('rejects more than 6 decimal places', () => {
    expect(validateLatitude('49.8826001')).toMatch(/-90 and 90/);
  });

  it('rejects out-of-range value > 90', () => {
    expect(validateLatitude('90.1')).toMatch(/-90 and 90/);
  });

  it('rejects out-of-range value < -90', () => {
    expect(validateLatitude('-90.1')).toMatch(/-90 and 90/);
  });

  it('rejects non-numeric input', () => {
    expect(validateLatitude('abc')).toBeTruthy();
  });

  it('rejects values with letters mixed in', () => {
    expect(validateLatitude('49.88N')).toBeTruthy();
  });
});

describe('validateLongitude', () => {
  it('returns undefined for empty string', () => {
    expect(validateLongitude('')).toBeUndefined();
  });

  it('accepts valid longitude with up to 6 decimal places', () => {
    expect(validateLongitude('-123.123456')).toBeUndefined();
  });

  it('accepts boundary values -180 and 180', () => {
    expect(validateLongitude('-180')).toBeUndefined();
    expect(validateLongitude('180')).toBeUndefined();
  });

  it('rejects more than 6 decimal places', () => {
    expect(validateLongitude('-123.1234567')).toMatch(/-180 and 180/);
  });

  it('rejects out-of-range value > 180', () => {
    expect(validateLongitude('180.1')).toMatch(/-180 and 180/);
  });

  it('rejects out-of-range value < -180', () => {
    expect(validateLongitude('-180.1')).toMatch(/-180 and 180/);
  });

  it('rejects non-numeric input', () => {
    expect(validateLongitude('xyz')).toBeTruthy();
  });
});

describe('validateCoordinateRow', () => {
  it('returns no errors for two empty fields', () => {
    expect(validateCoordinateRow({ latitude: '', longitude: '' })).toEqual({});
  });

  it('returns no errors for valid coordinate pair', () => {
    expect(
      validateCoordinateRow({ latitude: '49.8826', longitude: '-123.1234' }),
    ).toEqual({});
  });

  it('requires longitude when latitude is set', () => {
    const errors = validateCoordinateRow({
      latitude: '49.8826',
      longitude: '',
    });
    expect(errors.longitude).toBeTruthy();
  });

  it('requires latitude when longitude is set', () => {
    const errors = validateCoordinateRow({
      latitude: '',
      longitude: '-123.1234',
    });
    expect(errors.latitude).toBeTruthy();
  });

  it('surfaces latitude format error', () => {
    const errors = validateCoordinateRow({
      latitude: '49.8826001',
      longitude: '-123.1234',
    });
    expect(errors.latitude).toMatch(/-90 and 90/);
  });

  it('surfaces longitude range error', () => {
    const errors = validateCoordinateRow({
      latitude: '49.8826',
      longitude: '181',
    });
    expect(errors.longitude).toMatch(/-180 and 180/);
  });
});
