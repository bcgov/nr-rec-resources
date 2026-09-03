import { IMAP_URL } from '@/constants/urls';

/** EPSG WKID for WGS84 Lat/Long */
const WKID_WGS84 = 4326;

/**
 * Returns the EPSG WKID for a UTM zone (NAD83, northern hemisphere).
 * e.g. zone 10 → 26910, zone 11 → 26911
 */
function utmZoneWkid(zone: number): number {
  return 26900 + Math.trunc(zone);
}

/**
 * Generates an iMapBC URL centered on specific coordinates.
 *
 * @param x - Longitude (WGS84) or Easting (UTM metres)
 * @param y - Latitude (WGS84) or Northing (UTM metres)
 * @param wkid - Spatial reference: 4326 for WGS84, 26910/26911/… for UTM zone
 * @param scale - Optional map scale denominator (e.g. 20000 for 1:20,000)
 */
export function buildImapUrl(
  x: number,
  y: number,
  wkid: number = WKID_WGS84,
  scale?: number,
): string {
  const params = new URLSearchParams();
  params.set('center', `${x},${y},${wkid}`);
  if (scale != null) {
    params.set('scale', scale.toString());
  }
  return `${IMAP_URL}?${params.toString()}`;
}

/**
 * Builds an iMapBC URL from WGS84 lat/long coordinates.
 */
export function buildImapUrlFromLatLng(
  latitude: number,
  longitude: number,
  scale = 10000,
): string {
  return buildImapUrl(longitude, latitude, WKID_WGS84, scale);
}

/**
 * Builds an iMapBC URL from UTM coordinates (NAD83, northern hemisphere).
 */
export function buildImapUrlFromUtm(
  easting: number,
  northing: number,
  zone: number,
  scale = 10000,
): string {
  return buildImapUrl(easting, northing, utmZoneWkid(zone), scale);
}
