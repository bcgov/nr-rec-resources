import {
  buildWebMapJson,
  extractArcGisDiagnostic,
  findOutputUrl,
} from '@/exhibit-a/exhibit-a.arcgis.helpers';
import { describe, expect, it } from 'vitest';

describe('exhibit-a.arcgis.helpers', () => {
  describe('findOutputUrl', () => {
    it('finds URL nested inside object-shaped ArcGIS results', () => {
      const payload = {
        results: {
          Output_File: {
            value: {
              link: 'ignored',
              url: 'https://example.com/map.jpg',
            },
          },
        },
      };

      expect(findOutputUrl(payload)).toBe('https://example.com/map.jpg');
    });

    it('finds first http URL in arbitrary nested fields and handles cycles', () => {
      const cyclic: Record<string, unknown> = { self: null };
      cyclic.self = cyclic;
      const payload = {
        meta: cyclic,
        deep: { values: ['not-a-url', 'http://example.com/from-array.png'] },
      };

      expect(findOutputUrl(payload)).toBe('http://example.com/from-array.png');
    });

    it('returns null when no http URL exists', () => {
      expect(
        findOutputUrl({ a: { b: 'ftp://example.com/file.jpg' } }),
      ).toBeNull();
    });
  });

  describe('extractArcGisDiagnostic', () => {
    it('formats ArcGIS error message with string details', () => {
      const message = extractArcGisDiagnostic({
        error: {
          message: 'Failed to render',
          details: ['layer 1 unavailable', 404, 'timed out'],
        },
      });

      expect(message).toBe(
        'ArcGIS error: Failed to render (layer 1 unavailable | timed out)',
      );
    });

    it('falls back to ArcGIS message descriptions when no error message exists', () => {
      expect(
        extractArcGisDiagnostic({
          messages: [
            { description: 'warning one' },
            null,
            { description: 'warning two' },
          ],
        }),
      ).toBe('ArcGIS messages: warning one | warning two');
    });

    it('returns empty string when no diagnostics are available', () => {
      expect(extractArcGisDiagnostic({})).toBe('');
    });
  });

  describe('buildWebMapJson', () => {
    it('builds expected operational layers and optional endpoint layers', () => {
      const webMap = buildWebMapJson({
        mapServerUrl: 'https://maps.example.com/fta/30000/MapServer',
        visibleLayers: [0, 2, 9],
        geometryFeatures: [
          {
            geometryType: 'esriGeometryPolygon',
            geometry: {
              rings: [
                [
                  [-123.1, 49.2],
                  [-123.0, 49.2],
                  [-123.0, 49.3],
                ],
              ],
            },
            attributes: { OBJECTID: 1, section_id: '1' },
          },
          {
            geometryType: 'esriGeometryPoint',
            geometry: { x: -123.05, y: 49.25 },
            attributes: { OBJECTID: 2, section_id: '2' },
          },
        ],
        labelFeatures: [
          {
            geometry: { x: -123.05, y: 49.25 },
            attributes: { text: '1' },
          },
        ],
        pofcPoints: [{ x: -123.1, y: 49.2 }],
        poftPoints: [{ x: -123.0, y: 49.3 }],
        extent: { xmin: -123.2, ymin: 49.1, xmax: -122.9, ymax: 49.4 },
        scale: 30000,
        outputSize: [1800, 1200],
        dpi: 150,
      }) as {
        operationalLayers: Array<{
          id?: string;
          visibleLayers?: number[];
          featureCollection?: {
            layers?: Array<{ layerDefinition?: { name?: string } }>;
          };
        }>;
        mapOptions?: { scale?: number };
      };

      const submissionLayer = webMap.operationalLayers.find(
        (layer) => layer.id === 'submission-geometry',
      );
      const layerNames =
        submissionLayer?.featureCollection?.layers
          ?.map((layer) => layer.layerDefinition?.name)
          .filter(Boolean) ?? [];

      expect(webMap.operationalLayers[0]?.visibleLayers).toEqual([0, 2, 9]);
      expect(layerNames).toContain('Submission Polygon');
      expect(layerNames).toContain('Submission Point');
      expect(layerNames).toContain('P of C');
      expect(layerNames).toContain('P of T');
      expect(layerNames).toContain('Submission Labels');
      expect(webMap.mapOptions?.scale).toBe(30000);
    });

    it('omits endpoint layers when P of C / P of T inputs are empty', () => {
      const webMap = buildWebMapJson({
        mapServerUrl: 'https://maps.example.com/fta/5000/MapServer',
        visibleLayers: [1],
        geometryFeatures: [],
        labelFeatures: [],
        pofcPoints: [],
        poftPoints: [],
        extent: { xmin: -123.2, ymin: 49.1, xmax: -122.9, ymax: 49.4 },
        scale: 5000,
        outputSize: [800, 600],
        dpi: 96,
      }) as {
        operationalLayers: Array<{
          id?: string;
          featureCollection?: {
            layers?: Array<{ layerDefinition?: { name?: string } }>;
          };
        }>;
      };

      const submissionLayer = webMap.operationalLayers.find(
        (layer) => layer.id === 'submission-geometry',
      );
      const layerNames =
        submissionLayer?.featureCollection?.layers
          ?.map((layer) => layer.layerDefinition?.name)
          .filter(Boolean) ?? [];

      expect(layerNames).toEqual(['Submission Labels']);
    });
  });
});
