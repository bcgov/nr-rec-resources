/**
 * Coordinate validation utilities.
 *
 * Latitude must be between -90 and 90 degrees.
 * Longitude must be between -180 and 180 degrees.
 * Both accept an optional decimal point with up to 6 decimal places.
 */

// Accepts optional sign, digits, optional decimal point with up to 6 decimal places.
const COORDINATE_FORMAT = /^-?\d{1,3}(\.\d{1,6})?$/;

export function validateLatitude(value: string): string | undefined {
  if (value === '') return undefined;
  const n = Number.parseFloat(value);
  if (Number.isNaN(n)) return 'Must be between -90 and 90';
  if (!COORDINATE_FORMAT.test(value.trim()) || n < -90 || n > 90)
    return 'Must be between -90 and 90';
  return undefined;
}

export function validateLongitude(value: string): string | undefined {
  if (value === '') return undefined;
  const n = Number.parseFloat(value);
  if (Number.isNaN(n)) return 'Must be between -180 and 180';
  if (!COORDINATE_FORMAT.test(value.trim()) || n < -180 || n > 180)
    return 'Must be between -180 and 180';
  return undefined;
}
