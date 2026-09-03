import type { AssetCode } from './types';

// Asset type descriptions (rst.recreation_asset_code) whose repairs are
// recorded against a trail segment, so they carry start/end station coordinates.
export const TRAIL_ASSET_TYPE_DESCRIPTIONS = new Set([
  'Trail',
  'Trail - Wheelchair Accessible',
]);

export function isTrailAssetTypeDescription(
  description: string | undefined,
): boolean {
  return Boolean(description && TRAIL_ASSET_TYPE_DESCRIPTIONS.has(description));
}

/** True when the asset's type (looked up in the code list) is a trail. */
export function isTrailAssetCode(
  assetCode: number,
  assetCodes: AssetCode[],
): boolean {
  return isTrailAssetTypeDescription(
    assetCodes.find((code) => code.asset_code === assetCode)?.description,
  );
}

// Station fields are optional, but when filled must be "lat,long" — two
// decimal numbers separated by a comma, e.g. "49.1232,-128.3030".
const STATION_COORDINATE_REGEX = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;

export const STATION_COORDINATE_ERROR =
  'Enter coordinates as lat,long (e.g. 49.1232,-128.3030)';

export function isValidStationValue(value: string | undefined): boolean {
  const trimmed = value?.trim();
  return !trimmed || STATION_COORDINATE_REGEX.test(trimmed);
}
