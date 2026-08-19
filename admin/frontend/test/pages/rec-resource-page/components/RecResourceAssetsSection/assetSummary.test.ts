import { computeAssetSummary } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/assetSummary';
import { CAMPSITE_STRUCTURE_CODE } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/campsiteGrouping';
import type {
  Asset,
  AssetRepair,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { describe, expect, it } from 'vitest';

const buildAsset = (overrides: Partial<Asset> = {}): Asset => ({
  asset_id: 1,
  parent_id: null,
  rec_resource_id: 'REC123',
  asset_code: 1,
  asset_name: 'Asset',
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
  ...overrides,
});

const buildRepair = (overrides: Partial<AssetRepair> = {}): AssetRepair => ({
  repair_id: 1,
  asset_id: 1,
  recreation_remed_repair_code: null,
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
  ...overrides,
});

describe('computeAssetSummary', () => {
  it('returns zeroed-out summary for no assets', () => {
    const summary = computeAssetSummary([]);

    expect(summary.total_assets).toBe(0);
    expect(summary.total_campsites).toBe(0);
    expect(summary.total_value).toBe(0);
    expect(summary.outstanding_repairs).toBe(0);
    expect(summary.spent_to_date).toBe(0);
  });

  it('counts total_assets and total_campsites', () => {
    const assets = [
      buildAsset({ asset_id: 1, asset_code: CAMPSITE_STRUCTURE_CODE }),
      buildAsset({ asset_id: 2, asset_code: 1 }),
      buildAsset({ asset_id: 3, asset_code: 1 }),
    ];

    const summary = computeAssetSummary(assets);

    expect(summary.total_assets).toBe(3);
    expect(summary.total_campsites).toBe(1);
  });

  it('sums total_value using actual_value, falling back to default_value', () => {
    const assets = [
      buildAsset({ asset_id: 1, actual_value: 100 }),
      buildAsset({ asset_id: 2, actual_value: null, default_value: 50 }),
      buildAsset({ asset_id: 3, actual_value: null, default_value: null }),
    ];

    const summary = computeAssetSummary(assets);

    expect(summary.total_value).toBe(150);
  });

  it('counts outstanding_repairs across all assets, excluding completed ones', () => {
    const assets = [
      buildAsset({
        asset_id: 1,
        recreation_asset_repair: [
          buildRepair({ repair_id: 1, repair_completed_date: null }),
          buildRepair({ repair_id: 2, repair_completed_date: '2024-01-01' }),
        ],
      }),
      buildAsset({
        asset_id: 2,
        recreation_asset_repair: [
          buildRepair({ repair_id: 3, repair_completed_date: null }),
        ],
      }),
    ];

    const summary = computeAssetSummary(assets);

    expect(summary.outstanding_repairs).toBe(2);
  });

  it('treats a null recreation_asset_repair as no repairs', () => {
    const assets = [buildAsset({ asset_id: 1, recreation_asset_repair: null })];

    const summary = computeAssetSummary(assets);

    expect(summary.outstanding_repairs).toBe(0);
    expect(summary.spent_to_date).toBe(0);
  });

  it('sums spent_to_date from actual_repair_cost across all repairs', () => {
    const assets = [
      buildAsset({
        asset_id: 1,
        recreation_asset_repair: [
          buildRepair({ repair_id: 1, actual_repair_cost: 200 }),
          buildRepair({ repair_id: 2, actual_repair_cost: null }),
        ],
      }),
    ];

    const summary = computeAssetSummary(assets);

    expect(summary.spent_to_date).toBe(200);
  });

  it('defaults inspection dates to null when not provided', () => {
    const summary = computeAssetSummary([]);

    expect(summary.last_inspection_date).toBeNull();
    expect(summary.last_hzd_tree_assessment_date).toBeNull();
  });

  it('passes through the provided inspection dates', () => {
    const lastInspectionDate = new Date('2024-09-11');
    const lastHzdTreeAssessmentDate = new Date('2024-05-02');

    const summary = computeAssetSummary(
      [],
      lastInspectionDate,
      lastHzdTreeAssessmentDate,
    );

    expect(summary.last_inspection_date).toBe(lastInspectionDate);
    expect(summary.last_hzd_tree_assessment_date).toBe(
      lastHzdTreeAssessmentDate,
    );
  });
});
