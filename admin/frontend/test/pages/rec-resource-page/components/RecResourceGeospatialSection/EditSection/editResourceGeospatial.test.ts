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
});
