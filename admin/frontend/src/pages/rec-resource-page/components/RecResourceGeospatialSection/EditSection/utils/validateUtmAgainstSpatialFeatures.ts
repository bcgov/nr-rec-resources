import proj4 from 'proj4';
import GeoJSON from 'ol/format/GeoJSON';
import { LineString, MultiLineString, MultiPolygon, Polygon } from 'ol/geom';
import type { Geometry } from 'ol/geom';
import { BC_ALBERS_PROJ4_DEF } from '@shared/components/recreation-resource-map';

/** EPSG:3005 (BC Albers) proj string */
const BC_ALBERS = BC_ALBERS_PROJ4_DEF;

const WGS84 = 'EPSG:4326';

/** Maximum distance in metres that a UTM point may be from a linear feature. */
const LINEAR_TOLERANCE_M = 10;

const geojsonFormat = new GeoJSON();

/**
 * Euclidean distance between two 2-D coordinates (in metres when using a
 * projected CRS such as EPSG:3005).
 */
function distanceBetween(a: number[], b: number[]): number {
  const dx = a[0]! - b[0]!;
  const dy = a[1]! - b[1]!;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Returns true when the given EPSG:3005 coordinate [x, y] passes the
 * proximity / containment test against a single spatial-feature geometry.
 *
 * Rules:
 *  - LineString / MultiLineString  → point must be ≤ 10 m from the line.
 *  - Polygon / MultiPolygon        → point must be inside the polygon.
 *  - Any other geometry type       → returns false (conservatively invalid).
 */
function pointPassesGeometry(coord: number[], geom: Geometry): boolean {
  if (geom instanceof LineString || geom instanceof MultiLineString) {
    const closest = geom.getClosestPoint(coord);
    return distanceBetween(coord, closest) <= LINEAR_TOLERANCE_M;
  }

  if (geom instanceof Polygon) {
    return geom.containsXY(coord[0]!, coord[1]!);
  }

  if (geom instanceof MultiPolygon) {
    return geom.containsXY(coord[0]!, coord[1]!);
  }

  return false;
}

/**
 * Returns a proj4 UTM projection string for the given zone.
 */
function utmProjString(utmZone: number): string {
  return `+proj=utm +zone=${Math.trunc(utmZone)} +datum=WGS84 +units=m +no_defs`;
}

/**
 * Converts a UTM coordinate (zone, easting, northing) to EPSG:3005 (BC Albers).
 *
 * @returns [x, y] in EPSG:3005, or null when the conversion fails.
 */
export function utmToAlbers(
  utmZone: number,
  easting: number,
  northing: number,
): [number, number] | null {
  try {
    const result = proj4(utmProjString(utmZone), BC_ALBERS, [
      easting,
      northing,
    ]);
    return [result[0], result[1]];
  } catch {
    return null;
  }
}

/**
 * Converts a UTM coordinate (zone, easting, northing) to WGS84 (lat/lon).
 *
 * @returns { latitude, longitude } in decimal degrees, or null when conversion fails.
 */
export function utmToWgs84(
  utmZone: number,
  easting: number,
  northing: number,
): { latitude: number; longitude: number } | null {
  try {
    const [lon, lat] = proj4(utmProjString(utmZone), WGS84, [
      easting,
      northing,
    ]);
    return { latitude: lat, longitude: lon };
  } catch {
    return null;
  }
}

/**
 * Converts a UTM coordinate to a GeoJSON Point string in EPSG:3005,
 * suitable for use as `site_point_geometry` in the map component.
 *
 * @returns A GeoJSON Point JSON string, or null when conversion fails.
 */
export function utmToSitePointGeometry(
  utmZone: number,
  easting: number,
  northing: number,
): string | null {
  const albers = utmToAlbers(utmZone, easting, northing);
  if (!albers) return null;
  return JSON.stringify({ type: 'Point', coordinates: albers });
}

/**
 * Validates that a UTM point lies within the allowed distance of / inside
 * the provided spatial feature geometries (GeoJSON strings in EPSG:3005).
 *
 * @returns `true` when validation passes or when there are no features to
 *          check against (nothing to validate); `false` when the point fails
 *          every feature's check.
 */
export function validateUtmAgainstSpatialFeatures(
  utmZone: number,
  easting: number,
  northing: number,
  spatialFeatureGeometry: string[] | undefined,
): boolean {
  if (!spatialFeatureGeometry || spatialFeatureGeometry.length === 0) {
    // No features to validate against – allow the save
    return true;
  }

  const coord = utmToAlbers(utmZone, easting, northing);
  if (!coord) {
    // Conversion failed – fall back to allowing; backend will validate
    return true;
  }

  return spatialFeatureGeometry.some((geoJsonStr) => {
    try {
      const geom = geojsonFormat.readGeometry(geoJsonStr);
      return pointPassesGeometry(coord, geom);
    } catch {
      return false;
    }
  });
}
