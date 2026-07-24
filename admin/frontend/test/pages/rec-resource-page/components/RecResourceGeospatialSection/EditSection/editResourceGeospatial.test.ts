import { describe, it, expect } from 'vitest';
import { createEditResourceGeospatialSchema } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/schemas/editResourceGeospatial';

describe('editResourceGeospatial schema', () => {
  const schema = createEditResourceGeospatialSchema();

  it('accepts valid numeric values', () => {
    const valid = {
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5480000,
    };
    const parsed = schema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects non-integer utm_zone', () => {
    const payload = {
      utm_zone: 10.5,
      utm_easting: 500000,
      utm_northing: 5480000,
    };
    const parsed = schema.safeParse(payload);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const zoneError = parsed.error.issues.find(
        (e) => e.path[0] === 'utm_zone',
      );
      expect(zoneError).toBeDefined();
      expect(zoneError?.message).toContain('UTM zone must be an integer');
    }
  });

  it('rejects utm_zone below 1', () => {
    const parsed = schema.safeParse({
      utm_zone: 0,
      utm_easting: 500000,
      utm_northing: 5480000,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const err = parsed.error.issues.find((e) => e.path[0] === 'utm_zone');
      expect(err?.message).toContain('between 1 and 60');
    }
  });

  it('rejects utm_zone above 60', () => {
    const parsed = schema.safeParse({
      utm_zone: 61,
      utm_easting: 500000,
      utm_northing: 5480000,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const err = parsed.error.issues.find((e) => e.path[0] === 'utm_zone');
      expect(err?.message).toContain('between 1 and 60');
    }
  });

  it('rejects NaN utm_easting', () => {
    const payload = {
      utm_zone: 10,
      utm_easting: NaN,
      utm_northing: 5480000,
    };
    const parsed = schema.safeParse(payload);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const eastingError = parsed.error.issues.find(
        (e) => e.path[0] === 'utm_easting',
      );
      expect(eastingError).toBeDefined();
    }
  });

  it('rejects utm_easting below 100 000', () => {
    const parsed = schema.safeParse({
      utm_zone: 10,
      utm_easting: 99999,
      utm_northing: 5480000,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const err = parsed.error.issues.find((e) => e.path[0] === 'utm_easting');
      expect(err?.message).toContain('100 000');
    }
  });

  it('rejects utm_easting above 999 999', () => {
    const parsed = schema.safeParse({
      utm_zone: 10,
      utm_easting: 1000000,
      utm_northing: 5480000,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const err = parsed.error.issues.find((e) => e.path[0] === 'utm_easting');
      expect(err?.message).toContain('999 999');
    }
  });

  it('rejects utm_northing above 9 999 999', () => {
    const parsed = schema.safeParse({
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 10000000,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const err = parsed.error.issues.find((e) => e.path[0] === 'utm_northing');
      expect(err?.message).toContain('9 999 999');
    }
  });

  it('rejects negative utm_northing', () => {
    const parsed = schema.safeParse({
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: -1,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const err = parsed.error.issues.find((e) => e.path[0] === 'utm_northing');
      expect(err).toBeDefined();
    }
  });
});
