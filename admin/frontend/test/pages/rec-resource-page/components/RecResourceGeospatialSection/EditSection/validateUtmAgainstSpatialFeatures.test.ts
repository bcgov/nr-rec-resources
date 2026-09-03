import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  utmToAlbers,
  utmToWgs84,
  utmToSitePointGeometry,
  validateUtmAgainstSpatialFeatures,
} from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/utils/validateUtmAgainstSpatialFeatures';

// Realistic UTM Zone 10 coordinate inside BC (near Vancouver area)
const ZONE = 10;
const EASTING = 491000;
const NORTHING = 5458000;

describe('utmToAlbers', () => {
  it('returns [x, y] pair for a valid UTM coordinate', () => {
    const result = utmToAlbers(ZONE, EASTING, NORTHING);
    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
    expect(result!.length).toBe(2);
    expect(typeof result![0]).toBe('number');
    expect(typeof result![1]).toBe('number');
  });
});

describe('utmToWgs84', () => {
  it('returns latitude and longitude for a valid UTM coordinate', () => {
    const result = utmToWgs84(ZONE, EASTING, NORTHING);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('latitude');
    expect(result).toHaveProperty('longitude');
    // Roughly near BC
    expect(result!.latitude).toBeGreaterThan(48);
    expect(result!.latitude).toBeLessThan(60);
    expect(result!.longitude).toBeGreaterThan(-140);
    expect(result!.longitude).toBeLessThan(-110);
  });

  it('returns a WGS84 result consistent with zone 11 coordinate', () => {
    // Zone 11 central meridian is -117°
    const result = utmToWgs84(11, 400000, 5600000);
    expect(result).not.toBeNull();
    expect(result!.latitude).toBeGreaterThan(48);
    expect(result!.longitude).toBeLessThan(-114);
  });
});

describe('utmToSitePointGeometry', () => {
  it('returns a GeoJSON Point string for valid UTM coords', () => {
    const geoJson = utmToSitePointGeometry(ZONE, EASTING, NORTHING);
    expect(geoJson).not.toBeNull();
    const parsed = JSON.parse(geoJson!);
    expect(parsed.type).toBe('Point');
    expect(Array.isArray(parsed.coordinates)).toBe(true);
    expect(parsed.coordinates.length).toBe(2);
  });
});

describe('validateUtmAgainstSpatialFeatures', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when spatialFeatureGeometry is undefined', () => {
    expect(
      validateUtmAgainstSpatialFeatures(ZONE, EASTING, NORTHING, undefined),
    ).toBe(true);
  });

  it('returns true when spatialFeatureGeometry is an empty array', () => {
    expect(validateUtmAgainstSpatialFeatures(ZONE, EASTING, NORTHING, [])).toBe(
      true,
    );
  });

  it('returns false when the point is outside all polygon geometries', () => {
    // Small polygon far from our coordinate (around 0,0 in Albers)
    const polygon = JSON.stringify({
      type: 'Polygon',
      coordinates: [
        [
          [1000000, 400000],
          [1000100, 400000],
          [1000100, 400100],
          [1000000, 400100],
          [1000000, 400000],
        ],
      ],
    });
    const result = validateUtmAgainstSpatialFeatures(ZONE, EASTING, NORTHING, [
      polygon,
    ]);
    expect(result).toBe(false);
  });

  it('returns true when the point is inside a polygon geometry', () => {
    const albers = utmToAlbers(ZONE, EASTING, NORTHING)!;
    const [ax, ay] = albers;
    const polygon = JSON.stringify({
      type: 'Polygon',
      coordinates: [
        [
          [ax - 1000, ay - 1000],
          [ax + 1000, ay - 1000],
          [ax + 1000, ay + 1000],
          [ax - 1000, ay + 1000],
          [ax - 1000, ay - 1000],
        ],
      ],
    });
    const result = validateUtmAgainstSpatialFeatures(ZONE, EASTING, NORTHING, [
      polygon,
    ]);
    expect(result).toBe(true);
  });

  it('returns true when the point is within 10 m of a LineString', () => {
    const albers = utmToAlbers(ZONE, EASTING, NORTHING)!;
    const [ax, ay] = albers;
    const lineString = JSON.stringify({
      type: 'LineString',
      coordinates: [
        [ax - 100, ay],
        [ax + 100, ay],
      ],
    });
    const result = validateUtmAgainstSpatialFeatures(ZONE, EASTING, NORTHING, [
      lineString,
    ]);
    expect(result).toBe(true);
  });

  it('returns false when the point is more than 10 m from a LineString', () => {
    const albers = utmToAlbers(ZONE, EASTING, NORTHING)!;
    const [ax, ay] = albers;
    const lineString = JSON.stringify({
      type: 'LineString',
      coordinates: [
        [ax - 100, ay + 500],
        [ax + 100, ay + 500],
      ],
    });
    const result = validateUtmAgainstSpatialFeatures(ZONE, EASTING, NORTHING, [
      lineString,
    ]);
    expect(result).toBe(false);
  });

  it('returns true when the point is within 10 m of a MultiLineString', () => {
    const albers = utmToAlbers(ZONE, EASTING, NORTHING)!;
    const [ax, ay] = albers;
    const multiLine = JSON.stringify({
      type: 'MultiLineString',
      coordinates: [
        [
          [ax - 100, ay],
          [ax + 100, ay],
        ],
      ],
    });
    const result = validateUtmAgainstSpatialFeatures(ZONE, EASTING, NORTHING, [
      multiLine,
    ]);
    expect(result).toBe(true);
  });

  it('returns true when the point is inside a MultiPolygon', () => {
    const albers = utmToAlbers(ZONE, EASTING, NORTHING)!;
    const [ax, ay] = albers;
    const multiPolygon = JSON.stringify({
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [ax - 1000, ay - 1000],
            [ax + 1000, ay - 1000],
            [ax + 1000, ay + 1000],
            [ax - 1000, ay + 1000],
            [ax - 1000, ay - 1000],
          ],
        ],
      ],
    });
    const result = validateUtmAgainstSpatialFeatures(ZONE, EASTING, NORTHING, [
      multiPolygon,
    ]);
    expect(result).toBe(true);
  });

  it('returns false for an unsupported geometry type (Point)', () => {
    const albers = utmToAlbers(ZONE, EASTING, NORTHING)!;
    const [ax, ay] = albers;
    const point = JSON.stringify({ type: 'Point', coordinates: [ax, ay] });
    const result = validateUtmAgainstSpatialFeatures(ZONE, EASTING, NORTHING, [
      point,
    ]);
    expect(result).toBe(false);
  });

  it('returns false when GeoJSON is invalid (parse error)', () => {
    const result = validateUtmAgainstSpatialFeatures(ZONE, EASTING, NORTHING, [
      'not-valid-json',
    ]);
    expect(result).toBe(false);
  });

  it('returns true when at least one feature passes even if others fail', () => {
    const albers = utmToAlbers(ZONE, EASTING, NORTHING)!;
    const [ax, ay] = albers;
    const outsidePolygon = JSON.stringify({
      type: 'Polygon',
      coordinates: [
        [
          [1000000, 400000],
          [1000100, 400000],
          [1000100, 400100],
          [1000000, 400100],
          [1000000, 400000],
        ],
      ],
    });
    const insidePolygon = JSON.stringify({
      type: 'Polygon',
      coordinates: [
        [
          [ax - 1000, ay - 1000],
          [ax + 1000, ay - 1000],
          [ax + 1000, ay + 1000],
          [ax - 1000, ay + 1000],
          [ax - 1000, ay - 1000],
        ],
      ],
    });
    const result = validateUtmAgainstSpatialFeatures(ZONE, EASTING, NORTHING, [
      outsidePolygon,
      insidePolygon,
    ]);
    expect(result).toBe(true);
  });

  it('returns true when utmToAlbers returns null (conversion fails) with features present', () => {
    // Pass NaN to cause conversion failure - should return true (allow through)
    const result = validateUtmAgainstSpatialFeatures(NaN, NaN, NaN, [
      '{"type":"Point","coordinates":[1000000,500000]}',
    ]);
    expect(result).toBe(true);
  });
});
