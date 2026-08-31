import { describe, it, expect, vi } from 'vitest';
import {
  longitudeRegisterOptions,
  latitudeRegisterOptions,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/coordinateRegisterOptions';
import type { UseFormGetValues } from 'react-hook-form';
import type { AssetEditFormValues } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetCardEdit';

function makeGetValues(
  overrides: Partial<AssetEditFormValues> = {},
): UseFormGetValues<AssetEditFormValues> {
  const defaults: AssetEditFormValues = {
    asset_comment: '',
    asset_length: '',
    asset_width: '',
    asset_area: '',
    longitude: '',
    latitude: '',
    actual_value: '',
    ...overrides,
  };
  return vi.fn((field?: keyof AssetEditFormValues) =>
    field ? defaults[field] : defaults,
  ) as unknown as UseFormGetValues<AssetEditFormValues>;
}

type ValidateFn = (val: string) => string | boolean;

function getValidate(opts: { validate?: unknown }): ValidateFn {
  return opts.validate as ValidateFn;
}

describe('longitudeRegisterOptions', () => {
  it('returns true for a valid longitude', () => {
    const opts = longitudeRegisterOptions(makeGetValues());
    const result = getValidate(opts)('45.123456');
    expect(result).toBe(true);
  });

  it('returns true for empty value (not required alone)', () => {
    const opts = longitudeRegisterOptions(makeGetValues());
    const result = getValidate(opts)('');
    expect(result).toBe(true);
  });

  it('returns error when value exceeds 180', () => {
    const opts = longitudeRegisterOptions(makeGetValues());
    const result = getValidate(opts)('181');
    expect(result).toBe('Must be between -180 and 180');
  });

  it('returns error when value is below -180', () => {
    const opts = longitudeRegisterOptions(makeGetValues());
    const result = getValidate(opts)('-181');
    expect(result).toBe('Must be between -180 and 180');
  });

  it('returns error when longitude is empty but latitude is set', () => {
    const opts = longitudeRegisterOptions(makeGetValues({ latitude: '49.5' }));
    const result = getValidate(opts)('');
    expect(result).toBe('Longitude is required when latitude is set');
  });

  it('returns true when both latitude and longitude are set', () => {
    const opts = longitudeRegisterOptions(makeGetValues({ latitude: '49.5' }));
    const result = getValidate(opts)('-123.5');
    expect(result).toBe(true);
  });

  it('accepts boundary value 180', () => {
    const opts = longitudeRegisterOptions(makeGetValues());
    const result = getValidate(opts)('180');
    expect(result).toBe(true);
  });

  it('accepts boundary value -180', () => {
    const opts = longitudeRegisterOptions(makeGetValues());
    const result = getValidate(opts)('-180');
    expect(result).toBe(true);
  });
});

describe('latitudeRegisterOptions', () => {
  it('returns true for a valid latitude', () => {
    const opts = latitudeRegisterOptions(makeGetValues());
    const result = getValidate(opts)('49.123456');
    expect(result).toBe(true);
  });

  it('returns true for empty value (not required alone)', () => {
    const opts = latitudeRegisterOptions(makeGetValues());
    const result = getValidate(opts)('');
    expect(result).toBe(true);
  });

  it('returns error when value exceeds 90', () => {
    const opts = latitudeRegisterOptions(makeGetValues());
    const result = getValidate(opts)('91');
    expect(result).toBe('Must be between -90 and 90');
  });

  it('returns error when value is below -90', () => {
    const opts = latitudeRegisterOptions(makeGetValues());
    const result = getValidate(opts)('-91');
    expect(result).toBe('Must be between -90 and 90');
  });

  it('returns error when latitude is empty but longitude is set', () => {
    const opts = latitudeRegisterOptions(
      makeGetValues({ longitude: '-123.5' }),
    );
    const result = getValidate(opts)('');
    expect(result).toBe('Latitude is required when longitude is set');
  });

  it('returns true when both latitude and longitude are set', () => {
    const opts = latitudeRegisterOptions(
      makeGetValues({ longitude: '-123.5' }),
    );
    const result = getValidate(opts)('49.5');
    expect(result).toBe(true);
  });

  it('accepts boundary value 90', () => {
    const opts = latitudeRegisterOptions(makeGetValues());
    const result = getValidate(opts)('90');
    expect(result).toBe(true);
  });

  it('accepts boundary value -90', () => {
    const opts = latitudeRegisterOptions(makeGetValues());
    const result = getValidate(opts)('-90');
    expect(result).toBe(true);
  });
});
