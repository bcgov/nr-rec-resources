const R = 6378137.0;

/**
 * Converts Web Mercator y coordinate to EPSG:4326 WGS 84 latitude
 *
 * @param y - Web Mercator y coordinate
 * @returns Latitude number compatible with google maps
 */
export const webMercatorYToLat = (y: number) => {
  return (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) * (180 / Math.PI);
};

/**
 * Converts Web Mercator x coordinate to EPSG:4326 WGS 84 longitude
 *
 * @param x - Web Mercator x coordinate
 * @returns Longitude number compatible with google maps
 */
export const webMercatorXToLon = (x: number) => {
  return (x / R) * (180 / Math.PI);
};
