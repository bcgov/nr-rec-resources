import {
  createRepairGroupFormState,
  getRepairGroupContext,
  isRepairGroupValid,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/RepairAssetEntry';
import type {
  Asset,
  AssetCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { describe, expect, it } from 'vitest';

const baseAsset: Asset = {
  asset_id: 0,
  parent_id: null,
  rec_resource_id: 'REC0001',
  asset_code: 0,
  asset_name: null,
  asset_tag: null,
  asset_comment: null,
  legacy_structure_id: null,
  asset_length: null,
  asset_width: null,
  asset_area: null,
  actual_value: null,
  installation_date: null,
  updated_by: null,
  updated_at: null,
  geometry_type_code: null,
  latitude: null,
  longitude: null,
  recreation_asset_repair: null,
};

const assetCodes: AssetCode[] = [
  { asset_code: 1, description: 'Picnic table' },
  { asset_code: 2, description: 'Trail' },
];

describe('createRepairGroupFormState', () => {
  it('returns an empty group with the given id', () => {
    expect(createRepairGroupFormState(3)).toEqual({
      id: 3,
      assetTypeCode: '',
      selectedAssetIds: [],
      estimatedCost: undefined,
      actualCost: undefined,
      trailStations: {},
    });
  });
});

describe('getRepairGroupContext', () => {
  it('returns no matching assets when no asset type is selected', () => {
    const context = getRepairGroupContext(
      createRepairGroupFormState(0),
      [{ ...baseAsset, asset_id: 1, asset_code: 1 }],
      assetCodes,
    );

    expect(context.matchingAssets).toEqual([]);
    expect(context.selectedAssets).toEqual([]);
    expect(context.isTrailAssetType).toBe(false);
  });

  it('sorts matching assets alphabetically by name', () => {
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 1, asset_name: 'B table' },
      { ...baseAsset, asset_id: 2, asset_code: 1, asset_name: 'A table' },
    ];
    const entry = { ...createRepairGroupFormState(0), assetTypeCode: '1' };

    const context = getRepairGroupContext(entry, assets, assetCodes);

    expect(context.matchingAssets.map((a) => a.asset_id)).toEqual([2, 1]);
  });

  it('returns only the selected subset as selectedAssets', () => {
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 1, asset_name: 'Table 1' },
      { ...baseAsset, asset_id: 2, asset_code: 1, asset_name: 'Table 2' },
    ];
    const entry = {
      ...createRepairGroupFormState(0),
      assetTypeCode: '1',
      selectedAssetIds: [2],
    };

    const context = getRepairGroupContext(entry, assets, assetCodes);

    expect(context.selectedAssets.map((a) => a.asset_id)).toEqual([2]);
  });

  it('identifies trail asset types by description', () => {
    const entry = { ...createRepairGroupFormState(0), assetTypeCode: '2' };

    const context = getRepairGroupContext(entry, [], assetCodes);

    expect(context.isTrailAssetType).toBe(true);
  });

  it('treats non-trail descriptions as not a trail asset type', () => {
    const entry = { ...createRepairGroupFormState(0), assetTypeCode: '1' };

    const context = getRepairGroupContext(entry, [], assetCodes);

    expect(context.isTrailAssetType).toBe(false);
  });
});

describe('isRepairGroupValid', () => {
  it('is valid when no asset type has been selected yet', () => {
    expect(isRepairGroupValid(createRepairGroupFormState(0), [], [])).toBe(
      true,
    );
  });

  it('is invalid when no assets are selected', () => {
    const entry = { ...createRepairGroupFormState(0), assetTypeCode: '1' };

    expect(isRepairGroupValid(entry, [], assetCodes)).toBe(false);
  });

  it('is invalid when estimated cost is missing', () => {
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 1, asset_name: 'Table 1' },
    ];
    const entry = {
      ...createRepairGroupFormState(0),
      assetTypeCode: '1',
      selectedAssetIds: [1],
      estimatedCost: undefined,
    };

    expect(isRepairGroupValid(entry, assets, assetCodes)).toBe(false);
  });

  it('is valid for a non-trail group with assets selected and a cost', () => {
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 1, asset_name: 'Table 1' },
    ];
    const entry = {
      ...createRepairGroupFormState(0),
      assetTypeCode: '1',
      selectedAssetIds: [1],
      estimatedCost: 50,
    };

    expect(isRepairGroupValid(entry, assets, assetCodes)).toBe(true);
  });

  it('is valid for a trail group when all stations are well-formed', () => {
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 2, asset_name: 'Trail A' },
    ];
    const entry = {
      ...createRepairGroupFormState(0),
      assetTypeCode: '2',
      selectedAssetIds: [1],
      estimatedCost: 50,
      trailStations: {
        1: { startStation: '49.1,-128.1', endStation: '49.2,-128.2' },
      },
    };

    expect(isRepairGroupValid(entry, assets, assetCodes)).toBe(true);
  });

  it('is valid for a trail group when stations are left blank', () => {
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 2, asset_name: 'Trail A' },
    ];
    const entry = {
      ...createRepairGroupFormState(0),
      assetTypeCode: '2',
      selectedAssetIds: [1],
      estimatedCost: 50,
    };

    expect(isRepairGroupValid(entry, assets, assetCodes)).toBe(true);
  });

  it('is invalid for a trail group when a station is malformed', () => {
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 2, asset_name: 'Trail A' },
    ];
    const entry = {
      ...createRepairGroupFormState(0),
      assetTypeCode: '2',
      selectedAssetIds: [1],
      estimatedCost: 50,
      trailStations: {
        1: { startStation: 'not-a-coordinate', endStation: '' },
      },
    };

    expect(isRepairGroupValid(entry, assets, assetCodes)).toBe(false);
  });
});
