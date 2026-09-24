import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  readSpatialFile,
  validateGeometry,
  validateSubmissionMetadata,
  type SubmissionMetadata,
} from '@/pages/rec-resource-page/components/RecResourceSpatial/spatialSubmissionUtils';

const { mockOpen } = vi.hoisted(() => ({
  mockOpen: vi.fn(),
}));

vi.mock('shapefile', () => ({
  open: mockOpen,
}));

const baseMetadata: SubmissionMetadata = {
  email: 'valid@example.com',
  telephone: '6045550100',
  contactName: 'Valid User',
  districtCode: 'Chilliwack',
  recreationDistrict: 'Coast',
  licenseRecNumber: 'REC000001',
  rootNamespace: 'esf',
  businessNamespace: 'ftc',
  actionCode: 'I',
  accuracyCode: '10',
  captureMethod: 'GPS',
  dataSource: 'Unknown',
};

const validFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [1000000, 1000000],
            [1000100, 1000000],
            [1000100, 1000100],
            [1000000, 1000100],
            [1000000, 1000000],
          ],
        ],
      },
    },
  ],
};

describe('spatialSubmissionUtils', () => {
  beforeEach(() => {
    mockOpen.mockReset();
    mockOpen.mockResolvedValue({
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: {
            type: 'Polygon',
            coordinates: [
              [
                [1000000, 1000000],
                [1000100, 1000000],
                [1000100, 1000100],
                [1000000, 1000100],
                [1000000, 1000000],
              ],
            ],
          },
        })
        .mockResolvedValueOnce({ done: true, value: undefined }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validates telephone and email formats', () => {
    const issues = validateSubmissionMetadata({
      ...baseMetadata,
      email: 'invalid-email',
      telephone: '604-555-0100',
    });

    expect(issues.some((x) => x.message.includes('valid email'))).toBe(true);
    expect(issues.some((x) => x.message.includes('exactly 10 digits'))).toBe(
      true,
    );
  });

  it('enforces action/accuracy/capture/data-source restrictions', () => {
    const issues = validateSubmissionMetadata({
      ...baseMetadata,
      actionCode: 'X',
      accuracyCode: '999',
      captureMethod: 'DRONE',
      dataSource: 'CUSTOM',
    });

    expect(issues.some((x) => x.message.includes('Action Code'))).toBe(true);
    expect(issues.some((x) => x.message.includes('Accuracy Code'))).toBe(true);
    expect(issues.some((x) => x.message.includes('Capture Method'))).toBe(true);
    expect(issues.some((x) => x.message.includes('Data Source'))).toBe(true);
  });

  it('detects unclosed polygon rings', () => {
    const bad = {
      ...validFeatureCollection,
      features: [
        {
          ...validFeatureCollection.features[0],
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [1000000, 1000000],
                [1000100, 1000000],
                [1000100, 1000100],
                [1000000, 1000100],
              ],
            ],
          },
        },
      ],
    };

    const issues = validateGeometry(bad, {
      expectedSrsName: 'EPSG:3005',
      enforceExpectedSrsName: true,
    });

    expect(
      issues.some((x) => x.message.includes('LinearRing is not closed')),
    ).toBe(true);
  });

  it('rejects non-.shp and double-extension uploads', async () => {
    const badFile = new File(['bad'], 'payload.shp.exe', {
      type: 'application/octet-stream',
    });

    await expect(readSpatialFile(badFile)).rejects.toThrow(
      'Upload either one .zip shapefile bundle or .shp with an optional matching .dbf.',
    );
  });

  it('accepts a single .shp upload', async () => {
    const shpFile = new File(['placeholder'], 'submission.shp', {
      type: 'application/octet-stream',
    });

    const buffer = new ArrayBuffer(100);
    const view = new DataView(buffer);
    view.setInt32(0, 9994, false);
    view.setFloat64(36, 900000, true);
    view.setFloat64(44, 900000, true);
    view.setFloat64(52, 1100000, true);
    view.setFloat64(60, 1100000, true);
    vi.spyOn(shpFile, 'arrayBuffer').mockResolvedValue(buffer);

    const result = await readSpatialFile(shpFile);

    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(1);
  });

  it('rejects non-.shp files', async () => {
    const dbfFile = new File(['dbf'], 'submission.dbf', {
      type: 'application/octet-stream',
    });

    await expect(readSpatialFile(dbfFile)).rejects.toThrow(
      'A .shp file is required.',
    );
  });

  it('rejects oversize uploads', async () => {
    const oversizedFile = new File(['x'], 'big.shp', {
      type: 'application/octet-stream',
    });
    Object.defineProperty(oversizedFile, 'size', {
      value: 11 * 1024 * 1024,
      configurable: true,
    });

    await expect(readSpatialFile(oversizedFile)).rejects.toThrow(
      /exceeds 10MB limit/,
    );
  });

  it('rejects files with invalid shapefile magic number', async () => {
    const validNameFile = new File(['placeholder'], 'invalid-magic.shp', {
      type: 'application/octet-stream',
    });
    const buffer = new ArrayBuffer(100);
    const view = new DataView(buffer);
    view.setInt32(0, 1234, false);
    view.setFloat64(36, 900000, true);
    view.setFloat64(44, 900000, true);
    view.setFloat64(52, 1100000, true);
    view.setFloat64(60, 1100000, true);
    vi.spyOn(validNameFile, 'arrayBuffer').mockResolvedValue(buffer);

    await expect(readSpatialFile(validNameFile)).rejects.toThrow(
      'Invalid shapefile signature (magic number mismatch).',
    );
  });

  it('enforces expected geometry type', () => {
    const lineFeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [1000000, 1000000],
              [1000100, 1000000],
            ],
          },
        },
      ],
    };

    const issues = validateGeometry(lineFeatureCollection, {
      expectedSrsName: 'EPSG:3005',
      enforceExpectedSrsName: true,
      expectedGeometryType: 'Polygon',
    });

    expect(issues.some((x) => x.message.includes('but expected Polygon'))).toBe(
      true,
    );
  });

  it('reports one geometry-type mismatch issue for multiple mismatched features', () => {
    const lineFeatures = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [1000000, 1000000],
              [1000100, 1000100],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [1000200, 1000200],
              [1000300, 1000300],
            ],
          },
        },
      ],
    };

    const issues = validateGeometry(lineFeatures, {
      expectedSrsName: 'EPSG:3005',
      enforceExpectedSrsName: true,
      expectedGeometryType: 'Polygon',
    });

    const geometryTypeMismatchIssues = issues.filter((issue) =>
      issue.message.includes('but expected Polygon'),
    );

    expect(geometryTypeMismatchIssues).toHaveLength(1);
    expect(geometryTypeMismatchIssues[0].message).toContain(
      '2 feature(s) have geometry type (LineString) but expected Polygon.',
    );
  });

  it('flags NaN/Infinity coordinates', () => {
    const bad = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [[Number.NaN, Number.POSITIVE_INFINITY]],
          },
        },
      ],
    };

    const issues = validateGeometry(bad, {
      expectedSrsName: 'EPSG:3005',
      enforceExpectedSrsName: true,
      expectedGeometryType: 'LineString',
    });

    expect(issues.some((x) => x.message.includes('NaN or Infinity'))).toBe(
      true,
    );
  });

  it('flags duplicate consecutive vertices', () => {
    const bad = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [1000000, 1000000],
              [1000000, 1000000],
              [1000100, 1000100],
            ],
          },
        },
      ],
    };

    const issues = validateGeometry(bad, {
      expectedSrsName: 'EPSG:3005',
      enforceExpectedSrsName: true,
      expectedGeometryType: 'LineString',
    });

    expect(
      issues.some((x) => x.message.includes('duplicate consecutive vertices')),
    ).toBe(true);
  });

  it('flags zero-area polygons', () => {
    const zeroArea = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [1000000, 1000000],
                [1000000, 1000000],
                [1000000, 1000000],
                [1000000, 1000000],
              ],
            ],
          },
        },
      ],
    };

    const issues = validateGeometry(zeroArea, {
      expectedSrsName: 'EPSG:3005',
      enforceExpectedSrsName: true,
      expectedGeometryType: 'Polygon',
    });

    expect(
      issues.some((x) => x.message.includes('zero or near-zero polygon area')),
    ).toBe(true);
  });

  it('flags overlapping polygon features', () => {
    const overlappingPolygons = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [1000000, 1000000],
                [1000200, 1000000],
                [1000200, 1000200],
                [1000000, 1000200],
                [1000000, 1000000],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [1000100, 1000100],
                [1000300, 1000100],
                [1000300, 1000300],
                [1000100, 1000300],
                [1000100, 1000100],
              ],
            ],
          },
        },
      ],
    };

    const issues = validateGeometry(overlappingPolygons, {
      expectedSrsName: 'EPSG:3005',
      enforceExpectedSrsName: true,
      expectedGeometryType: 'Polygon',
    });

    expect(
      issues.some((x) => x.message.includes('Polygon areas must not overlap')),
    ).toBe(true);
  });

  it('flags polygon features that are more than 500m apart', () => {
    const distantPolygons = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [1000000, 1000000],
                [1000100, 1000000],
                [1000100, 1000100],
                [1000000, 1000100],
                [1000000, 1000000],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [1000800, 1000000],
                [1000900, 1000000],
                [1000900, 1000100],
                [1000800, 1000100],
                [1000800, 1000000],
              ],
            ],
          },
        },
      ],
    };

    const issues = validateGeometry(distantPolygons, {
      expectedSrsName: 'EPSG:3005',
      enforceExpectedSrsName: true,
      expectedGeometryType: 'Polygon',
    });

    expect(issues.some((x) => x.message.includes('exceeds 500m'))).toBe(true);
  });

  it('flags multipolygon parts that are more than 500m apart', () => {
    const distantMultiPolygon = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [
                [
                  [1000000, 1000000],
                  [1000100, 1000000],
                  [1000100, 1000100],
                  [1000000, 1000100],
                  [1000000, 1000000],
                ],
              ],
              [
                [
                  [1000800, 1000000],
                  [1000900, 1000000],
                  [1000900, 1000100],
                  [1000800, 1000100],
                  [1000800, 1000000],
                ],
              ],
            ],
          },
        },
      ],
    };

    const issues = validateGeometry(distantMultiPolygon, {
      expectedSrsName: 'EPSG:3005',
      enforceExpectedSrsName: true,
      expectedGeometryType: 'Polygon',
    });

    expect(issues.some((x) => x.message.includes('exceeds 500m'))).toBe(true);
  });

  it('flags disjoint polygon rings that are more than 500m apart', () => {
    const polygonWithDistantRings = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [1000000, 1000000],
                [1000100, 1000000],
                [1000100, 1000100],
                [1000000, 1000100],
                [1000000, 1000000],
              ],
              [
                [1000800, 1000000],
                [1000900, 1000000],
                [1000900, 1000100],
                [1000800, 1000100],
                [1000800, 1000000],
              ],
            ],
          },
        },
      ],
    };

    const issues = validateGeometry(polygonWithDistantRings, {
      expectedSrsName: 'EPSG:3005',
      enforceExpectedSrsName: true,
      expectedGeometryType: 'Polygon',
    });

    expect(issues.some((x) => x.message.includes('exceeds 500m'))).toBe(true);
  });
});
