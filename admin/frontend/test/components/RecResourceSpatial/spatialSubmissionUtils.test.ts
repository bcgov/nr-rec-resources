import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  readSpatialFile,
  validateGeometry,
} from '@/components/RecResourceSpatial/spatialSubmissionUtils';

const { mockOpen, mockShpParse, mockZipLoadAsync } = vi.hoisted(() => ({
  mockOpen: vi.fn(),
  mockShpParse: vi.fn(),
  mockZipLoadAsync: vi.fn(),
}));

vi.mock('shapefile', () => ({
  open: mockOpen,
}));

vi.mock('shpjs', () => ({
  default: mockShpParse,
}));

vi.mock('jszip', () => ({
  default: {
    loadAsync: mockZipLoadAsync,
  },
}));

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
    mockShpParse.mockReset();
    mockZipLoadAsync.mockReset();
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
      issues.some((x: { message: string | string[] }) =>
        x.message.includes('LinearRing is not closed'),
      ),
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

  it('rejects uploading multiple zip files at once', async () => {
    const zipOne = new File(['a'], 'one.zip', {
      type: 'application/zip',
    });
    const zipTwo = new File(['b'], 'two.zip', {
      type: 'application/zip',
    });

    await expect(readSpatialFile([zipOne, zipTwo])).rejects.toThrow(
      'Please upload only one .zip file at a time.',
    );
  });

  it('rejects mixing a zip upload with shp/dbf files', async () => {
    const zipFile = new File(['zip'], 'bundle.zip', {
      type: 'application/zip',
    });
    const shpFile = new File(['shp'], 'trail.shp', {
      type: 'application/octet-stream',
    });

    await expect(readSpatialFile([zipFile, shpFile])).rejects.toThrow(
      'Upload either one .zip file or .shp/.dbf files, not both.',
    );
  });

  it('rejects multiple shapefiles in one upload', async () => {
    const shpFileOne = new File(['a'], 'one.shp', {
      type: 'application/octet-stream',
    });
    const shpFileTwo = new File(['b'], 'two.shp', {
      type: 'application/octet-stream',
    });

    await expect(readSpatialFile([shpFileOne, shpFileTwo])).rejects.toThrow(
      'Please upload only one .shp file at a time.',
    );
  });

  it('rejects multiple dbf files in one upload', async () => {
    const shpFile = new File(['shp'], 'trail.shp', {
      type: 'application/octet-stream',
    });
    const dbfOne = new File(['a'], 'trail.dbf', {
      type: 'application/octet-stream',
    });
    const dbfTwo = new File(['b'], 'trail-copy.dbf', {
      type: 'application/octet-stream',
    });

    await expect(readSpatialFile([shpFile, dbfOne, dbfTwo])).rejects.toThrow(
      'Please upload only one .dbf file at a time.',
    );
  });

  it('rejects mismatched shp/dbf basenames', async () => {
    const shpFile = new File(['placeholder'], 'trail-a.shp', {
      type: 'application/octet-stream',
    });
    const dbfFile = new File(['placeholder'], 'trail-b.dbf', {
      type: 'application/octet-stream',
    });

    await expect(readSpatialFile([shpFile, dbfFile])).rejects.toThrow(
      'The .dbf filename must match the uploaded .shp filename.',
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

  it('rejects zip uploads that contain a shp without matching dbf', async () => {
    const zipFile = new File(['zip'], 'submission.zip', {
      type: 'application/zip',
    });
    vi.spyOn(zipFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(8));
    mockZipLoadAsync.mockResolvedValue({
      files: {
        'folder/trail.shp': { dir: false, name: 'folder/trail.shp' },
      },
    });

    await expect(readSpatialFile(zipFile)).rejects.toThrow('but no .dbf file');
  });

  it('rejects zip uploads with mismatched shp and dbf basenames', async () => {
    const zipFile = new File(['zip'], 'submission.zip', {
      type: 'application/zip',
    });
    vi.spyOn(zipFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(8));
    mockZipLoadAsync.mockResolvedValue({
      files: {
        'trail.shp': { dir: false, name: 'trail.shp' },
        'other.dbf': { dir: false, name: 'other.dbf' },
      },
    });

    await expect(readSpatialFile(zipFile)).rejects.toThrow(
      "their filenames don't match",
    );
  });

  it('parses a valid zip upload and normalizes output to EPSG:3005', async () => {
    const zipFile = new File(['zip'], 'submission.zip', {
      type: 'application/zip',
    });
    vi.spyOn(zipFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(16));
    mockZipLoadAsync.mockResolvedValue({
      files: {
        'trail.shp': { dir: false, name: 'trail.shp' },
        'trail.dbf': { dir: false, name: 'trail.dbf' },
      },
    });
    mockShpParse.mockResolvedValue({
      type: 'FeatureCollection',
      crs: { type: 'name', properties: { name: 'EPSG:4326' } },
      features: [
        {
          type: 'Feature',
          properties: { section_id: 'S1' },
          geometry: {
            type: 'Point',
            coordinates: [-123.3656, 48.4284],
          },
        },
      ],
    });

    const result = await readSpatialFile(zipFile);

    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(1);
    expect(result.crs?.properties?.name).toBe('EPSG:3005');
    expect(result.features[0].properties.section_id).toBe('S1');
  });

  it('rejects zip uploads when parsed features have no attributes', async () => {
    const zipFile = new File(['zip'], 'submission.zip', {
      type: 'application/zip',
    });
    vi.spyOn(zipFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(16));
    mockZipLoadAsync.mockResolvedValue({
      files: {
        'trail.shp': { dir: false, name: 'trail.shp' },
        'trail.dbf': { dir: false, name: 'trail.dbf' },
      },
    });
    mockShpParse.mockResolvedValue({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [1200000, 500000],
          },
        },
      ],
    });

    await expect(readSpatialFile(zipFile)).rejects.toThrow(
      'Zip parsed geometry but no attributes were found',
    );
  });

  it('parses a zip when shpjs returns an array of feature collections', async () => {
    const zipFile = new File(['zip'], 'submission.zip', {
      type: 'application/zip',
    });
    vi.spyOn(zipFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(16));
    mockZipLoadAsync.mockResolvedValue({
      files: {
        'trail.shp': { dir: false, name: 'trail.shp' },
        'trail.dbf': { dir: false, name: 'trail.dbf' },
      },
    });
    mockShpParse.mockResolvedValue([
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { section_id: 'A1' },
            geometry: {
              type: 'Point',
              coordinates: [1200000, 500000],
            },
          },
        ],
      },
    ]);

    const result = await readSpatialFile(zipFile);

    expect(result.features).toHaveLength(1);
    expect(result.features[0].properties.section_id).toBe('A1');
  });

  it('parses a zip when shpjs returns object layers', async () => {
    const zipFile = new File(['zip'], 'submission.zip', {
      type: 'application/zip',
    });
    vi.spyOn(zipFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(16));
    mockZipLoadAsync.mockResolvedValue({
      files: {
        'trail.shp': { dir: false, name: 'trail.shp' },
        'trail.dbf': { dir: false, name: 'trail.dbf' },
      },
    });
    mockShpParse.mockResolvedValue({
      layerA: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { section_id: 'B1' },
            geometry: {
              type: 'Point',
              coordinates: [1200000, 500000],
            },
          },
        ],
      },
    });

    const result = await readSpatialFile(zipFile);

    expect(result.features).toHaveLength(1);
    expect(result.features[0].properties.section_id).toBe('B1');
  });

  it('rejects zip uploads when parsed output has features without geometry', async () => {
    const zipFile = new File(['zip'], 'submission.zip', {
      type: 'application/zip',
    });
    vi.spyOn(zipFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(16));
    mockZipLoadAsync.mockResolvedValue({
      files: {
        'trail.shp': { dir: false, name: 'trail.shp' },
        'trail.dbf': { dir: false, name: 'trail.dbf' },
      },
    });
    mockShpParse.mockResolvedValue({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { section_id: 'C1' },
          geometry: null,
        },
      ],
    });

    await expect(readSpatialFile(zipFile)).rejects.toThrow(
      'features without geometry',
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
      issues.some((x) => x.message.includes('separate polygon records')),
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

    expect(
      issues.some((x) => x.message.includes('separate polygon records')),
    ).toBe(true);
  });

  it('treats multipolygon parts in the same feature as one feature', () => {
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

    expect(issues).toHaveLength(0);
  });

  it('rejects polygon features with multiple disjoint parts', () => {
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

    expect(
      issues.some((x) => x.message.includes('Use MultiPolygon instead')),
    ).toBe(true);
  });

  it('returns error when feature collection is empty', () => {
    const issues = validateGeometry(
      {
        type: 'FeatureCollection',
        features: [],
      },
      {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: true,
      },
    );

    expect(issues[0]?.message).toContain('contains no feature geometries');
  });

  it('warns when source CRS differs after URN normalization', () => {
    const issues = validateGeometry(
      {
        type: 'FeatureCollection',
        crs: { properties: { name: 'urn:ogc:def:crs:EPSG::4326' } },
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [1200000, 500000],
            },
          },
        ],
      },
      {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: true,
        expectedGeometryType: 'Point',
      },
    );

    expect(issues.some((issue) => issue.type === 'CRS')).toBe(true);
  });

  it('flags features without geometry', () => {
    const issues = validateGeometry(
      {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: {} }],
      },
      {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: true,
      },
    );

    expect(
      issues.some((issue) => issue.message.includes('has no geometry')),
    ).toBe(true);
  });

  it('flags zero-length linestring geometry', () => {
    const issues = validateGeometry(
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [1200000, 500000],
                [1200000, 500000],
              ],
            },
          },
        ],
      },
      {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: true,
        expectedGeometryType: 'LineString',
      },
    );

    expect(
      issues.some((issue) => issue.message.includes('near-zero line length')),
    ).toBe(true);
  });

  it('warns when feature extent is outside BC bounds', () => {
    const issues = validateGeometry(
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [50, 50],
            },
          },
        ],
      },
      {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: false,
        expectedGeometryType: 'Point',
      },
    );

    expect(
      issues.some(
        (issue) =>
          issue.type === 'EXTENT' &&
          issue.code === 'EXTENT_VERIFICATION_RECOMMENDED',
      ),
    ).toBe(true);
  });

  it('checks polygon overlap pairwise when polygons are uploaded as non-polygon type', () => {
    const issues = validateGeometry(
      {
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
      },
      {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: true,
        expectedGeometryType: 'LineString',
      },
    );

    expect(issues.some((issue) => issue.code === 'POLYGON_OVERLAP')).toBe(true);
  });

  it('checks polygon separation pairwise when polygons are uploaded as non-polygon type', () => {
    const issues = validateGeometry(
      {
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
      },
      {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: true,
        expectedGeometryType: 'LineString',
      },
    );

    expect(
      issues.some((issue) => issue.code === 'POLYGON_SEPARATION_EXCEEDED'),
    ).toBe(true);
  });

  it('flags duplicate lines even when the coordinate order is reversed', () => {
    const issues = validateGeometry(
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [1000000, 1000000],
                [1000200, 1000200],
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
                [1000000, 1000000],
              ],
            },
          },
        ],
      },
      {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: true,
        expectedGeometryType: 'LineString',
      },
    );

    expect(issues.some((issue) => issue.code === 'LINE_DUPLICATE')).toBe(true);
  });

  it('flags overlapping lines', () => {
    const issues = validateGeometry(
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [1000000, 1000000],
                [1000200, 1000000],
              ],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [1000100, 1000000],
                [1000300, 1000000],
              ],
            },
          },
        ],
      },
      {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: true,
        expectedGeometryType: 'LineString',
      },
    );

    expect(issues.some((issue) => issue.code === 'LINE_OVERLAP')).toBe(true);
  });

  it('flags overlapping nodes for point geometries', () => {
    const issues = validateGeometry(
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [1000000, 1000000],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [1000000, 1000000],
            },
          },
        ],
      },
      {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: true,
        expectedGeometryType: 'Point',
      },
    );

    expect(issues.some((issue) => issue.code === 'NODE_OVERLAP')).toBe(true);
  });
});
