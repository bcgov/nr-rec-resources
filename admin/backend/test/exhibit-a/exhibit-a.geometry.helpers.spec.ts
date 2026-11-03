import {
  calculateExtent,
  lineInfo,
  parseGeoJsonGeometry,
  toCoordinatePair,
  toCoordinatePath,
  toEsriGeometry,
} from '@/exhibit-a/exhibit-a.geometry.helpers';
import { BadGatewayException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

describe('exhibit-a.geometry.helpers', () => {
  describe('parseGeoJsonGeometry', () => {
    it('parses valid geometry payloads', () => {
      expect(
        parseGeoJsonGeometry('{"type":"Point","coordinates":[1,2]}', 'geojson'),
      ).toEqual({
        type: 'Point',
        coordinates: [1, 2],
      });
    });

    it('throws a detailed error for invalid JSON', () => {
      expect(() => parseGeoJsonGeometry('{oops', 'label_geojson')).toThrow(
        BadGatewayException,
      );
      expect(() => parseGeoJsonGeometry('{oops', 'label_geojson')).toThrow(
        /Invalid label_geojson geometry payload/i,
      );
    });

    it('throws when GeoJSON type is missing', () => {
      expect(() =>
        parseGeoJsonGeometry('{"coordinates":[1,2]}', 'geojson'),
      ).toThrow(/missing GeoJSON type/i);
    });
  });

  describe('coordinate converters', () => {
    it('converts valid coordinate pairs and rejects invalid nodes', () => {
      expect(toCoordinatePair([-123.1, 49.2])).toEqual([-123.1, 49.2]);
      expect(toCoordinatePair(['x', 49.2])).toBeNull();
      expect(toCoordinatePair([1])).toBeNull();
      expect(toCoordinatePair(null)).toBeNull();
    });

    it('builds coordinate paths with minimum vertex filtering', () => {
      expect(
        toCoordinatePath(
          [
            [-123.1, 49.2],
            [-123.0, 49.3],
            ['bad', 'data'],
          ],
          2,
        ),
      ).toEqual([
        [-123.1, 49.2],
        [-123.0, 49.3],
      ]);

      expect(
        toCoordinatePath(
          [
            [-123.1, 49.2],
            ['bad', 'data'],
          ],
          2,
        ),
      ).toBeNull();
    });
  });

  describe('toEsriGeometry', () => {
    it('maps Point to esriGeometryPoint', () => {
      expect(
        toEsriGeometry({ type: 'Point', coordinates: [-123.05, 49.25] }),
      ).toEqual({
        geometryType: 'esriGeometryPoint',
        geometry: {
          x: -123.05,
          y: 49.25,
          spatialReference: { wkid: 4326 },
        },
      });
    });

    it('maps line and polygon families to expected geometry payloads', () => {
      expect(
        toEsriGeometry({
          type: 'MultiLineString',
          coordinates: [
            [
              [-1, 1],
              [-2, 2],
            ],
            [
              [-3, 3],
              [-4, 4],
            ],
          ],
        }),
      ).toEqual({
        geometryType: 'esriGeometryPolyline',
        geometry: {
          paths: [
            [
              [-1, 1],
              [-2, 2],
            ],
            [
              [-3, 3],
              [-4, 4],
            ],
          ],
          spatialReference: { wkid: 4326 },
        },
      });

      expect(
        toEsriGeometry({
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [-1, 1],
                [-2, 2],
                [-3, 1],
              ],
            ],
          ],
        }),
      ).toEqual({
        geometryType: 'esriGeometryPolygon',
        geometry: {
          rings: [
            [
              [-1, 1],
              [-2, 2],
              [-3, 1],
            ],
          ],
          spatialReference: { wkid: 4326 },
        },
      });
    });

    it('returns null for unsupported or unrenderable geometry', () => {
      expect(
        toEsriGeometry({ type: 'GeometryCollection', coordinates: [] }),
      ).toBeNull();
      expect(
        toEsriGeometry({
          type: 'Polygon',
          coordinates: [
            [
              [-1, 1],
              ['bad', 'data'],
            ],
          ],
        }),
      ).toBeNull();
    });
  });

  describe('calculateExtent', () => {
    it('calculates a padded extent from nested geometries', () => {
      const extent = calculateExtent([
        { type: 'Point', coordinates: [-123.1, 49.2] },
        {
          type: 'Polygon',
          coordinates: [
            [
              [-123.0, 49.2],
              [-122.8, 49.5],
              [-123.0, 49.4],
            ],
          ],
        },
      ]);

      expect(extent.xmin).toBeLessThan(-123.1);
      expect(extent.ymin).toBeLessThan(49.2);
      expect(extent.xmax).toBeGreaterThan(-122.8);
      expect(extent.ymax).toBeGreaterThan(49.5);
    });

    it('throws when no finite coordinates are present', () => {
      expect(() =>
        calculateExtent([{ type: 'Point', coordinates: ['x', 'y'] }]),
      ).toThrow(BadGatewayException);
    });
  });

  describe('lineInfo', () => {
    const identityToUtm = ([x, y]: [number, number]): [number, number] => [
      x,
      y,
    ];

    it('returns line metrics for LineString', () => {
      const info = lineInfo(
        {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [3000, 4000],
          ],
        },
        identityToUtm,
      );

      expect(info?.startLL).toEqual([0, 0]);
      expect(info?.endLL).toEqual([3000, 4000]);
      expect(info?.lengthKm).toBe(5);
    });

    it('returns line metrics for MultiLineString and null for non-line geometry', () => {
      const info = lineInfo(
        {
          type: 'MultiLineString',
          coordinates: [
            [
              [0, 0],
              [0, 1000],
            ],
            [
              [0, 1000],
              [3000, 5000],
            ],
          ],
        },
        identityToUtm,
      );

      expect(info?.pofc).toEqual([0, 0]);
      expect(info?.poft).toEqual([3000, 5000]);
      expect(info && info.lengthKm > 0).toBe(true);
      expect(
        lineInfo({ type: 'Polygon', coordinates: [] }, identityToUtm),
      ).toBeNull();
    });
  });
});
