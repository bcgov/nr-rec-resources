import { describe, it, expect } from 'vitest';
import {
  webMercatorXToLon,
  webMercatorYToLat,
} from '@shared/components/recreation-resource-map/helpers/coordinatesConversion';

// The same radius used in the implementation
const R = 6378137.0;

describe('webMercatorXToLon', () => {
  it('returns 0 for x = 0', () => {
    expect(webMercatorXToLon(0)).toBeCloseTo(0, 12);
  });

  it('returns 180 degrees for x = Math.PI * R (theoretically)', () => {
    const x = Math.PI * R;
    // (x / R) * (180 / Math.PI) === Math.PI * (180 / Math.PI) === 180
    expect(webMercatorXToLon(x)).toBeCloseTo(180, 12);
  });

  it('returns expected value for x = R (1 radian in web mercator space)', () => {
    const x = R;
    const expected = 1 * (180 / Math.PI); // ≈ 57.29577951308232
    expect(webMercatorXToLon(x)).toBeCloseTo(expected, 12);
  });

  it('propagates NaN to NaN', () => {
    const out = webMercatorXToLon(NaN);
    expect(Number.isNaN(out)).toBe(true);
  });

  it('returns Infinity for +Infinity input and -Infinity for -Infinity', () => {
    expect(webMercatorXToLon(Infinity)).toBe(Infinity);
    expect(webMercatorXToLon(-Infinity)).toBe(-Infinity);
  });
});

describe('webMercatorYToLat', () => {
  it('returns 0 for y = 0', () => {
    expect(webMercatorYToLat(0)).toBeCloseTo(0, 12);
  });

  it('maps +Infinity to 90 and -Infinity to -90', () => {
    expect(webMercatorYToLat(Infinity)).toBeCloseTo(90, 12);
    expect(webMercatorYToLat(-Infinity)).toBeCloseTo(-90, 12);
  });

  it('propagates NaN to NaN', () => {
    const out = webMercatorYToLat(NaN);
    expect(Number.isNaN(out)).toBe(true);
  });

  it('returns ~45 degrees for y computed from 45 deg latitude (round-trip check)', () => {
    // construct a Web Mercator y that should decode to lat = 45°
    const latDeg = 45;
    const latRad = (latDeg * Math.PI) / 180;
    // inverse formula of lat = 2*atan(exp(y/R)) - PI/2
    // => exp(y/R) = tan((latRad + PI/2)/2)
    // => y = R * ln(tan((latRad + PI/2)/2))
    const y = R * Math.log(Math.tan((latRad + Math.PI / 2) / 2));
    const outputLat = webMercatorYToLat(y);
    expect(outputLat).toBeCloseTo(latDeg, 10);
  });

  it('returns expected values for a couple of other sample y values (positive and negative)', () => {
    // pick a small positive y and small negative y
    const y1 = 100000; // positive
    const y2 = -100000; // negative

    const lat1 = webMercatorYToLat(y1);
    const lat2 = webMercatorYToLat(y2);

    // sanity checks: lat1 should be > 0, lat2 should be < 0, and symmetric-ish
    expect(lat1).toBeGreaterThan(0);
    expect(lat2).toBeLessThan(0);

    // also check approximate symmetry: lat1 ≈ -lat2
    expect(lat1).toBeCloseTo(-lat2, 2); // 2 decimal places is sufficient for sanity
  });
});
