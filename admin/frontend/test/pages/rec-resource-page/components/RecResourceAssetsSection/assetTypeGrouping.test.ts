import { groupAssetsByType } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/assetTypeGrouping';
import type {
  Asset,
  AssetCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { describe, expect, it } from 'vitest';

const buildAsset = (overrides: Partial<Asset> = {}): Asset => ({
  asset_id: 1,
  parent_id: null,
  rec_resource_id: 'REC123',
  asset_code: 100,
  asset_name: 'Asset 1',
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
  ...overrides,
});

describe('groupAssetsByType', () => {
  it('returns an empty array when there are no assets', () => {
    expect(groupAssetsByType([], [])).toEqual([]);
  });

  it('groups assets by asset_code and counts them', () => {
    const assets = [
      buildAsset({ asset_id: 1, asset_code: 100 }),
      buildAsset({ asset_id: 2, asset_code: 100 }),
      buildAsset({ asset_id: 3, asset_code: 200 }),
    ];

    const groups = groupAssetsByType(assets, []);

    expect(groups).toHaveLength(2);
    const bridgeGroup = groups.find((g) => g.structureCode === 100);
    expect(bridgeGroup?.count).toBe(2);
    expect(bridgeGroup?.assets).toHaveLength(2);
  });

  it('resolves description from asset codes, falling back to Unknown', () => {
    const assets = [
      buildAsset({ asset_id: 1, asset_code: 100 }),
      buildAsset({ asset_id: 2, asset_code: 200 }),
    ];
    const codes: AssetCode[] = [{ asset_code: 100, description: 'Bridge' }];

    const groups = groupAssetsByType(assets, codes);

    expect(groups.find((g) => g.structureCode === 100)?.description).toBe(
      'Bridge',
    );
    expect(groups.find((g) => g.structureCode === 200)?.description).toBe(
      'Unknown',
    );
  });

  it('sums totalValue using actual_value, falling back to default_value from asset code', () => {
    const assets = [
      buildAsset({ asset_id: 1, asset_code: 100, actual_value: 500 }),
      buildAsset({ asset_id: 2, asset_code: 100, actual_value: null }),
      buildAsset({ asset_id: 3, asset_code: 100, actual_value: null }),
    ];
    const codes: AssetCode[] = [{ asset_code: 100, default_value: 300 }];

    const groups = groupAssetsByType(assets, codes);

    expect(groups[0].totalValue).toBe(1100);
  });

  it('counts only repairs without a completed date as active', () => {
    const assets = [
      buildAsset({
        asset_id: 1,
        asset_code: 100,
        recreation_asset_repair: [
          {
            repair_id: 1,
            asset_id: 1,
            recreation_remed_repair_code: 'R1',
            estimated_repair_cost: null,
            actual_repair_cost: null,
            repair_completed_date: null,
            urgency: null,
            trail_segment_start: null,
            trail_segment_end: null,
            created_by: null,
            created_at: null,
            updated_by: null,
            updated_at: null,
          },
          {
            repair_id: 2,
            asset_id: 1,
            recreation_remed_repair_code: 'R2',
            estimated_repair_cost: null,
            actual_repair_cost: null,
            repair_completed_date: '2024-01-01',
            urgency: null,
            trail_segment_start: null,
            trail_segment_end: null,
            created_by: null,
            created_at: null,
            updated_by: null,
            updated_at: null,
          },
        ],
      }),
    ];

    const groups = groupAssetsByType(assets, []);

    expect(groups[0].activeRepairsCount).toBe(1);
  });

  it('treats a null recreation_asset_repair as no repairs', () => {
    const assets = [
      buildAsset({
        asset_id: 1,
        asset_code: 100,
        recreation_asset_repair: null,
      }),
    ];

    const groups = groupAssetsByType(assets, []);

    expect(groups[0].activeRepairsCount).toBe(0);
  });

  it('sorts assets within a group numerically when names share a prefix', () => {
    const assets = [
      buildAsset({ asset_id: 1, asset_code: 100, asset_name: 'Fire ring 10' }),
      buildAsset({ asset_id: 2, asset_code: 100, asset_name: 'fire ring 3' }),
      buildAsset({ asset_id: 3, asset_code: 100, asset_name: 'Fire ring 1' }),
    ];

    const groups = groupAssetsByType(assets, []);

    expect(groups[0].assets.map((a) => a.asset_name)).toEqual([
      'Fire ring 1',
      'fire ring 3',
      'Fire ring 10',
    ]);
  });

  it('sorts groups by description alphabetically', () => {
    const assets = [
      buildAsset({ asset_id: 1, asset_code: 200 }),
      buildAsset({ asset_id: 2, asset_code: 100 }),
    ];
    const codes: AssetCode[] = [
      { asset_code: 200, description: 'Zebra' },
      { asset_code: 100, description: 'Alpha' },
    ];

    const groups = groupAssetsByType(assets, codes);

    expect(groups.map((g) => g.description)).toEqual(['Alpha', 'Zebra']);
  });
});
