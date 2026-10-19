import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as shapefile from 'shapefile';
import * as turf from '@turf/turf';
import shp from 'shpjs';
import {
  validateSubmissionMetadata,
  readSpatialFile,
  validateGeometry,
  extractSectionIdDetails,
} from '@/pages/rec-resource-page/components/RecResourceSpatial/shapefile-validation';

// Mock external library modules
vi.mock('shapefile', () => ({
  open: vi.fn(),
}));

vi.mock('shpjs', () => ({
  default: vi.fn(),
}));

describe('Shapefile Validation Module - 100% Coverage Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Metadata & Attribute Validation (`validateSubmissionMetadata`)', () => {
    const validMetadata = {
      email: 'felipe@example.com',
      telephone: '1234567890',
      contactName: 'Felipe Developer',
      districtCode: 'DIST01',
      recreationDistrict: 'North',
      licenseRecNumber: 'REC12345',
      rootNamespace: 'esf',
      businessNamespace: 'ftc',
      actionCode: 'I',
      accuracyCode: '1',
      captureMethod: 'GPS',
      dataSource: 'Survey',
    };

    it('should pass valid metadata with zero issues', () => {
      const issues = validateSubmissionMetadata(validMetadata);
      expect(issues).toHaveLength(0);
    });

    it('should catch invalid email addresses', () => {
      const issues = validateSubmissionMetadata({
        ...validMetadata,
        email: 'not-an-email',
      });
      expect(issues).toContainEqual(
        expect.objectContaining({
          type: 'METADATA',
          severity: 'ERROR',
          message: 'Email address must be a valid email string.',
        }),
      );
    });

    it('should catch invalid telephone formats (not 10 digits)', () => {
      const issues = validateSubmissionMetadata({
        ...validMetadata,
        telephone: '12345',
      });
      expect(issues).toContainEqual(
        expect.objectContaining({
          type: 'METADATA',
          severity: 'ERROR',
          message:
            'Telephone Number must be exactly 10 digits (pattern: [0-9]{10}).',
        }),
      );
    });

    it('should catch invalid root namespace', () => {
      const issues = validateSubmissionMetadata({
        ...validMetadata,
        rootNamespace: 'invalid',
      });
      expect(issues).toContainEqual(
        expect.objectContaining({
          type: 'METADATA',
          severity: 'ERROR',
          message: 'Root Namespace must be "esf".',
        }),
      );
    });

    it('should catch empty or whitespace business namespace', () => {
      const issues = validateSubmissionMetadata({
        ...validMetadata,
        businessNamespace: '   ',
      });
      expect(issues).toContainEqual(
        expect.objectContaining({
          type: 'METADATA',
          severity: 'ERROR',
          message: 'Business namespace is required (example: ftc).',
        }),
      );
    });

    it('should catch invalid action, accuracy, capture method, and data source codes', () => {
      const issues = validateSubmissionMetadata({
        ...validMetadata,
        actionCode: 'X',
        accuracyCode: '999',
        captureMethod: 'InvalidMethod',
        dataSource: 'InvalidSource',
      });
      expect(issues.length).toBeGreaterThanOrEqual(4);
    });

    it('should validate alphanumeric length and unsupported characters', () => {
      const issues = validateSubmissionMetadata({
        ...validMetadata,
        licenseRecNumber: 'A'.repeat(11), // Exceeds max length of 10
        contactName: 'Name_With_Invalid$Char!', // Contains unsupported chars
      });
      expect(issues).toContainEqual(
        expect.objectContaining({
          type: 'ATTRIBUTE',
          severity: 'ERROR',
          message: 'REC# exceeds AlphaNumeric10 length.',
        }),
      );
      expect(issues).toContainEqual(
        expect.objectContaining({
          type: 'ATTRIBUTE',
          severity: 'ERROR',
          message: 'Contact name contains unsupported characters.',
        }),
      );
    });
  });

  describe('Section ID & Map Label Extraction (`extractSectionIdDetails`)', () => {
    it('should extract section IDs using standard candidate field names', () => {
      const fc = {
        type: 'FeatureCollection',
        features: [
          { properties: { section_id: '101' } },
          { properties: { section_id: '102' } },
          { properties: { section_id: '103' } },
        ],
      };
      const result = extractSectionIdDetails(fc);
      expect(result.fieldName).toBeTruthy();
      expect(result.sectionIds).toEqual(['101', '102', '103']);
    });

    it('should extract section IDs using fuzzy substring matching for section/segment id', () => {
      const fc = {
        type: 'FeatureCollection',
        features: [{ properties: { custom_section_identifier: 'A1' } }],
      };
      const result = extractSectionIdDetails(fc);
      expect(result.fieldName).toBe('custom_section_identifier');
      expect(result.sectionIds).toEqual(['A1']);
    });

    it('should fall back to map label extraction if primary section fields are missing', () => {
      const fc = {
        type: 'FeatureCollection',
        features: [
          { properties: { map_label: 'Zone 301' } },
          { properties: { maplabel: 'Zone 305' } },
        ],
      };
      const result = extractSectionIdDetails(fc);
      expect(result.fieldName).toBe('map_label');
      expect(result.sectionIds).toEqual(['301']);
    });

    it('should return null fieldName and empty array if no matching properties exist', () => {
      const fc = {
        type: 'FeatureCollection',
        features: [{ properties: { randomProp: 'test' } }],
      };
      const result = extractSectionIdDetails(fc);
      expect(result.fieldName).toBeNull();
      expect(result.sectionIds).toHaveLength(0);
    });

    it('should handle null/missing feature collection gracefully', () => {
      const result = extractSectionIdDetails(null);
      expect(result.sectionIds).toHaveLength(0);
    });
  });

  describe('Spatial File Reading & Normalization (`readSpatialFile`)', () => {
    it('should throw error when zero files are provided', async () => {
      await expect(readSpatialFile([])).rejects.toThrow(
        'A .shp file is required.',
      );
    });

    it('should handle single File instance input', async () => {
      const file = new File(['short'], 'test.txt', { type: 'text/plain' });
      await expect(readSpatialFile(file)).rejects.toThrow();
    });

    it('should validate allowed extensions and file size limits', async () => {
      const invalidExt = new File(['data'], 'test.exe', {
        type: 'application/exe',
      });
      await expect(readSpatialFile([invalidExt])).rejects.toThrow();

      const tooLarge = new File(
        [new ArrayBuffer(11 * 1024 * 1024)],
        'test.shp',
      );
      await expect(readSpatialFile([tooLarge])).rejects.toThrow(
        /Spatial file exceeds/,
      );
    });

    it('should throw error when multiple .zip files or mixed .zip and part files are uploaded', async () => {
      const zip1 = new File([new ArrayBuffer(10)], 'a.zip');
      const zip2 = new File([new ArrayBuffer(10)], 'b.zip');
      await expect(readSpatialFile([zip1, zip2])).rejects.toThrow(
        'Please upload only one .zip file at a time.',
      );

      const shpFile = new File([new ArrayBuffer(10)], 'a.shp');
      await expect(readSpatialFile([zip1, shpFile])).rejects.toThrow(
        'Upload either one .zip file or .shp/.dbf files, not both.',
      );
    });

    it('should process ZIP files successfully when FeatureCollection with attributes is returned', async () => {
      const zipFile = new File([new ArrayBuffer(100)], 'bundle.zip');
      vi.mocked(shp).mockResolvedValueOnce({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { id: 1 },
            geometry: { type: 'Point', coordinates: [1, 2] },
          },
        ],
      } as any);

      const result = await readSpatialFile(zipFile);
      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(1);
    });

    it('should process ZIP files with array or object structures (shpjs variations)', async () => {
      const zipFile = new File([new ArrayBuffer(100)], 'bundle.zip');
      vi.mocked(shp).mockResolvedValueOnce([
        {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { id: 1 },
              geometry: { type: 'Point', coordinates: [1, 2] },
            },
          ],
        },
      ] as any);

      const result = await readSpatialFile(zipFile);
      expect(result.features).toHaveLength(1);
    });

    it('should throw error if ZIP contains no features or lacks attributes', async () => {
      const zipFile = new File([new ArrayBuffer(100)], 'empty.zip');
      vi.mocked(shp).mockResolvedValueOnce({
        type: 'FeatureCollection',
        features: [],
      } as any);
      await expect(readSpatialFile(zipFile)).rejects.toThrow(
        'No features found in uploaded .zip shapefile bundle.',
      );

      vi.mocked(shp).mockResolvedValueOnce({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: [1, 2] },
          },
        ],
      } as any);
      await expect(readSpatialFile(zipFile)).rejects.toThrow(
        /Zip parsed geometry but no attributes were found/,
      );

      vi.mocked(shp).mockResolvedValueOnce(null as any);
      await expect(readSpatialFile(zipFile)).rejects.toThrow(
        'Unable to parse uploaded .zip shapefile bundle.',
      );
    });

    it('should validate shp and dbf count limits and basename matching', async () => {
      const shp1 = new File([new ArrayBuffer(100)], 'layer1.shp');
      const shp2 = new File([new ArrayBuffer(100)], 'layer2.shp');
      await expect(readSpatialFile([shp1, shp2])).rejects.toThrow(
        'Please upload only one .shp file at a time.',
      );

      const dbf1 = new File([new ArrayBuffer(100)], 'layer1.dbf');
      const dbf2 = new File([new ArrayBuffer(100)], 'layer2.dbf');
      await expect(readSpatialFile([shp1, dbf1, dbf2])).rejects.toThrow(
        'Please upload only one .dbf file at a time.',
      );

      const mismatchedDbf = new File([new ArrayBuffer(100)], 'other.dbf');
      await expect(readSpatialFile([shp1, mismatchedDbf])).rejects.toThrow(
        'The .dbf filename must match the uploaded .shp filename.',
      );
    });

    it('should validate shapefile header magic number, incomplete buffers, and extent bounds', async () => {
      const smallFile = new File([new ArrayBuffer(50)], 'small.shp');
      await expect(readSpatialFile([smallFile])).rejects.toThrow(
        'Invalid shapefile: header is incomplete.',
      );

      const badMagicBuf = new ArrayBuffer(100);
      new DataView(badMagicBuf).setInt32(0, 1234, false);
      const badMagicFile = new File([badMagicBuf], 'bad.shp');
      await expect(readSpatialFile([badMagicFile])).rejects.toThrow(
        'Invalid shapefile signature (magic number mismatch).',
      );

      const outOfBoundsBuf = new ArrayBuffer(100);
      const view = new DataView(outOfBoundsBuf);
      view.setInt32(0, 9994, false); // Correct magic number
      view.setFloat64(36, -200, true); // minX out of BC extent
      view.setFloat64(44, 0, true);
      view.setFloat64(52, 100, true);
      view.setFloat64(60, 100, true);
      const outOfBoundsFile = new File([outOfBoundsBuf], 'out.shp');
      await expect(readSpatialFile([outOfBoundsFile])).rejects.toThrow(
        'Shapefile header extent lies outside supported BC bounds (EPSG:3005).',
      );
    });

    it('should parse valid .shp and .dbf files successfully using shapefile.open', async () => {
      const validHeaderBuf = new ArrayBuffer(100);
      const view = new DataView(validHeaderBuf);
      view.setInt32(0, 9994, false); // Correct magic number
      view.setFloat64(36, 100000, true);
      view.setFloat64(44, 100000, true);
      view.setFloat64(52, 200000, true);
      view.setFloat64(60, 200000, true);
      const shpFile = new File([validHeaderBuf], 'layer.shp');
      const dbfFile = new File([new ArrayBuffer(100)], 'layer.dbf');

      const mockSource = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: {
              properties: { id: 1 },
              geometry: { type: 'Point', coordinates: [105000, 105000] },
            },
          })
          .mockResolvedValueOnce({ done: true, value: null }),
      };
      vi.mocked(shapefile.open).mockResolvedValueOnce(mockSource as any);

      const result = await readSpatialFile([shpFile, dbfFile]);
      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(1);
    });

    it('should throw error if shapefile contains zero features', async () => {
      const validHeaderBuf = new ArrayBuffer(100);
      const view = new DataView(validHeaderBuf);
      view.setInt32(0, 9994, false); // Correct magic number
      view.setFloat64(36, 100000, true);
      view.setFloat64(44, 100000, true);
      view.setFloat64(52, 200000, true);
      view.setFloat64(60, 200000, true);
      const shpFile = new File([validHeaderBuf], 'layer.shp');

      const mockSource = {
        read: vi.fn().mockResolvedValue({ done: true, value: null }),
      };
      vi.mocked(shapefile.open).mockResolvedValueOnce(mockSource as any);

      await expect(readSpatialFile([shpFile])).rejects.toThrow(
        'No features found in shapefile.',
      );
    });
  });

  describe('Geometry Validation (`validateGeometry`)', () => {
    it('should return error if feature collection has no features', () => {
      const issues = validateGeometry(
        { type: 'FeatureCollection', features: [] },
        { expectedSrsName: 'EPSG:3005', enforceExpectedSrsName: false },
      );
      expect(issues).toContainEqual(
        expect.objectContaining({
          message: 'Shapefile contains no feature geometries.',
        }),
      );
    });

    it('should warn when CRS does not match expected SRS name and enforcement is active', () => {
      const fc = {
        type: 'FeatureCollection',
        crs: { type: 'name', properties: { name: 'EPSG:4326' } },
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [1, 2] },
            properties: {},
          },
        ],
      };
      const issues = validateGeometry(fc, {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: true,
      });
      expect(issues).toContainEqual(
        expect.objectContaining({
          severity: 'WARNING',
          message: expect.stringContaining('Source CRS'),
        }),
      );
    });

    it('should detect missing geometry and non-finite coordinate values', () => {
      const fc = {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', geometry: null, properties: {} },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [NaN, Infinity] },
            properties: {},
          },
        ],
      };
      const issues = validateGeometry(fc, {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: false,
      });
      expect(issues).toContainEqual(
        expect.objectContaining({ message: 'Feature #1 has no geometry.' }),
      );
      expect(issues).toContainEqual(
        expect.objectContaining({
          message: 'Feature #2 contains NaN or Infinity coordinate values.',
        }),
      );
    });

    it('should detect geometry type mismatch when expectedGeometryType is enforced', () => {
      const fc = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [100, 100] },
            properties: {},
          },
        ],
      };
      const issues = validateGeometry(fc, {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: false,
        expectedGeometryType: 'Polygon',
      });
      expect(issues).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('expected Polygon'),
        }),
      );
    });

    it('should validate polygon parts, overlapping polygons, and separation distance limits', () => {
      const poly1 = turf.polygon([
        [
          [0, 0],
          [0, 10],
          [10, 10],
          [10, 0],
          [0, 0],
        ],
      ]);
      const poly2 = turf.polygon([
        [
          [1000, 1000],
          [1000, 1010],
          [1010, 1010],
          [1010, 1000],
          [1000, 1000],
        ],
      ]);

      const fc = {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', geometry: poly1.geometry, properties: {} },
          { type: 'Feature', geometry: poly2.geometry, properties: {} },
        ],
      };

      const issues = validateGeometry(fc, {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: false,
      });
      expect(issues.some((i) => i.message.includes('exceeds'))).toBe(true);
    });

    it('should detect overlapping polygons', () => {
      const poly1 = turf.polygon([
        [
          [0, 0],
          [0, 10],
          [10, 10],
          [10, 0],
          [0, 0],
        ],
      ]);
      const poly2 = turf.polygon([
        [
          [5, 5],
          [5, 15],
          [15, 15],
          [15, 5],
          [5, 5],
        ],
      ]);

      const fc = {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', geometry: poly1.geometry, properties: {} },
          { type: 'Feature', geometry: poly2.geometry, properties: {} },
        ],
      };

      const issues = validateGeometry(fc, {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: false,
      });
      expect(issues).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('overlaps'),
        }),
      );
    });
  });
});
