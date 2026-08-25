import { buildBulkRepairPayload } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/buildBulkRepairPayload';
import { createRepairGroupFormState } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/RepairAssetEntry';
import type {
  Asset,
  AssetCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { describe, expect, it } from 'vitest';

const REC_RESOURCE_ID = 'REC0001';

const baseAsset: Asset = {
  asset_id: 0,
  parent_id: null,
  rec_resource_id: REC_RESOURCE_ID,
  asset_code: 0,
  asset_name: null,
  asset_tag: null,
  asset_comment: null,
  legacy_structure_id: null,
  asset_length: null,
  asset_width: null,
  asset_area: null,
  default_value: null,
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

describe('buildBulkRepairPayload', () => {
  it('collapses a non-trail group into a single change covering every selected asset', () => {
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 1, asset_name: 'Table 1' },
      { ...baseAsset, asset_id: 2, asset_code: 1, asset_name: 'Table 2' },
    ];

    const group = {
      ...createRepairGroupFormState(0),
      assetTypeCode: '1',
      selectedAssetIds: [1, 2],
      estimatedCost: 50,
      actualCost: 40,
    };

    const dto = buildBulkRepairPayload(
      'R1',
      '2026-01-01',
      [group],
      assets,
      assetCodes,
    );

    expect(dto).toEqual({
      recreation_remed_repair_code: 'R1',
      completed_date: '2026-01-01',
      changes: [
        {
          estimated_repair_cost: 50,
          actual_repair_cost: 40,
          asset_ids: [1, 2],
        },
      ],
    });
  });

  it('splits a trail group into one change per selected asset, carrying its own stations', () => {
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 2, asset_name: 'Trail A' },
      { ...baseAsset, asset_id: 2, asset_code: 2, asset_name: 'Trail B' },
    ];

    const group = {
      ...createRepairGroupFormState(0),
      assetTypeCode: '2',
      selectedAssetIds: [1, 2],
      estimatedCost: 100,
      actualCost: undefined,
      trailStations: {
        1: { startStation: '49.1,-128.1', endStation: '49.2,-128.2' },
      },
    };

    const dto = buildBulkRepairPayload('R1', '', [group], assets, assetCodes);

    expect(dto.changes).toEqual([
      {
        estimated_repair_cost: 100,
        actual_repair_cost: undefined,
        station_start: '49.1,-128.1',
        station_end: '49.2,-128.2',
        asset_ids: [1],
      },
      {
        estimated_repair_cost: 100,
        actual_repair_cost: undefined,
        station_start: undefined,
        station_end: undefined,
        asset_ids: [2],
      },
    ]);
  });

  it('omits completed_date when it is empty', () => {
    const dto = buildBulkRepairPayload('R1', '', [], [], assetCodes);

    expect(dto.completed_date).toBeUndefined();
  });

  it('skips groups with no asset type selected', () => {
    const untouchedGroup = createRepairGroupFormState(0);

    const dto = buildBulkRepairPayload(
      'R1',
      '2026-01-01',
      [untouchedGroup],
      [],
      assetCodes,
    );

    expect(dto.changes).toEqual([]);
  });

  it('defaults estimated_repair_cost to 0 when unset', () => {
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 1, asset_name: 'Table 1' },
    ];
    const group = {
      ...createRepairGroupFormState(0),
      assetTypeCode: '1',
      selectedAssetIds: [1],
      estimatedCost: undefined,
    };

    const dto = buildBulkRepairPayload(
      'R1',
      '2026-01-01',
      [group],
      assets,
      assetCodes,
    );

    expect(dto.changes[0].estimated_repair_cost).toBe(0);
  });
});
