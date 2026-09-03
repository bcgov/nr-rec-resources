import {
  isTrailAssetCode,
  isTrailAssetTypeDescription,
  isValidStationValue,
  STATION_COORDINATE_ERROR,
  TRAIL_ASSET_TYPE_DESCRIPTIONS,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/trailStations';
import type { AssetCode } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { describe, expect, it } from 'vitest';

const assetCodes: AssetCode[] = [
  { asset_code: 1, description: 'Trail' },
  { asset_code: 2, description: 'Trail - Wheelchair Accessible' },
  { asset_code: 3, description: 'Bridge' },
  { asset_code: 4 },
];

describe('TRAIL_ASSET_TYPE_DESCRIPTIONS', () => {
  it('contains both trail asset type descriptions', () => {
    expect(Array.from(TRAIL_ASSET_TYPE_DESCRIPTIONS)).toEqual([
      'Trail',
      'Trail - Wheelchair Accessible',
    ]);
  });
});

describe('isTrailAssetTypeDescription', () => {
  it('accepts "Trail"', () => {
    expect(isTrailAssetTypeDescription('Trail')).toBe(true);
  });

  it('accepts "Trail - Wheelchair Accessible"', () => {
    expect(isTrailAssetTypeDescription('Trail - Wheelchair Accessible')).toBe(
      true,
    );
  });

  it('rejects a non-trail description', () => {
    expect(isTrailAssetTypeDescription('Bridge')).toBe(false);
  });

  it('rejects undefined', () => {
    expect(isTrailAssetTypeDescription(undefined)).toBe(false);
  });

  it('rejects an empty description', () => {
    expect(isTrailAssetTypeDescription('')).toBe(false);
  });

  it('is case sensitive so partial matches are rejected', () => {
    expect(isTrailAssetTypeDescription('trail')).toBe(false);
    expect(isTrailAssetTypeDescription('Trailhead')).toBe(false);
  });
});

describe('isTrailAssetCode', () => {
  it('returns true for an asset code whose description is a trail', () => {
    expect(isTrailAssetCode(1, assetCodes)).toBe(true);
  });

  it('returns true for the wheelchair accessible trail code', () => {
    expect(isTrailAssetCode(2, assetCodes)).toBe(true);
  });

  it('returns false for a non-trail asset code', () => {
    expect(isTrailAssetCode(3, assetCodes)).toBe(false);
  });

  it('returns false when the asset code has no description', () => {
    expect(isTrailAssetCode(4, assetCodes)).toBe(false);
  });

  it('returns false when the asset code is not in the code list', () => {
    expect(isTrailAssetCode(999, assetCodes)).toBe(false);
  });

  it('returns false for an empty code list', () => {
    expect(isTrailAssetCode(1, [])).toBe(false);
  });
});

describe('isValidStationValue', () => {
  it('treats undefined as valid because stations are optional', () => {
    expect(isValidStationValue(undefined)).toBe(true);
  });

  it('treats an empty string as valid', () => {
    expect(isValidStationValue('')).toBe(true);
  });

  it('treats whitespace only as valid', () => {
    expect(isValidStationValue('   ')).toBe(true);
  });

  it('accepts a lat,long pair', () => {
    expect(isValidStationValue('49.232423,-128.334343')).toBe(true);
  });

  it('accepts a lat,long pair with spaces around the comma', () => {
    expect(isValidStationValue('49.232423, -128.334343')).toBe(true);
  });

  it('accepts whole numbers', () => {
    expect(isValidStationValue('49,-128')).toBe(true);
  });

  it('accepts positive longitude values', () => {
    expect(isValidStationValue('49.1,128.3')).toBe(true);
  });

  it('rejects free text', () => {
    expect(isValidStationValue('not-a-coordinate')).toBe(false);
  });

  it('rejects a single number with no comma', () => {
    expect(isValidStationValue('49.1232')).toBe(false);
  });

  it('rejects a trailing comma with no second value', () => {
    expect(isValidStationValue('49.1232,')).toBe(false);
  });

  it('rejects three comma separated values', () => {
    expect(isValidStationValue('49.1,-128.3,12')).toBe(false);
  });

  it('rejects a value with a trailing unit', () => {
    expect(isValidStationValue('49.1,-128.3m')).toBe(false);
  });
});

describe('STATION_COORDINATE_ERROR', () => {
  it('explains the expected lat,long format', () => {
    expect(STATION_COORDINATE_ERROR).toMatch(/lat,long/);
  });
});
