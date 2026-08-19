import {
  CAMPSITE_STRUCTURE_CODE,
  groupAssetsByCampsite,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/campsiteGrouping';
import type { Asset } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
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

describe('groupAssetsByCampsite', () => {
  it('returns an empty array when there are no assets', () => {
    expect(groupAssetsByCampsite([])).toEqual([]);
  });

  it('returns an empty array when there are no campsite assets', () => {
    const assets = [buildAsset({ asset_id: 1, asset_code: 1 })];

    expect(groupAssetsByCampsite(assets)).toEqual([]);
  });

  it('groups a campsite with its children by parent_id', () => {
    const campsite = buildAsset({
      asset_id: 10,
      asset_code: CAMPSITE_STRUCTURE_CODE,
      asset_name: 'Campsite A',
    });
    const child1 = buildAsset({ asset_id: 11, asset_code: 1, parent_id: 10 });
    const child2 = buildAsset({ asset_id: 12, asset_code: 2, parent_id: 10 });
    const unrelated = buildAsset({
      asset_id: 13,
      asset_code: 3,
      parent_id: 99,
    });

    const groups = groupAssetsByCampsite([campsite, child1, child2, unrelated]);

    expect(groups).toHaveLength(1);
    expect(groups[0].campsite.asset_id).toBe(10);
    expect(groups[0].children.map((c) => c.asset_id)).toEqual([11, 12]);
  });

  it('returns an empty children list when the campsite has no children', () => {
    const campsite = buildAsset({
      asset_id: 10,
      asset_code: CAMPSITE_STRUCTURE_CODE,
      asset_name: 'Campsite A',
    });

    const groups = groupAssetsByCampsite([campsite]);

    expect(groups[0].children).toEqual([]);
  });

  it('sorts campsite groups by asset_name alphabetically', () => {
    const campsiteB = buildAsset({
      asset_id: 20,
      asset_code: CAMPSITE_STRUCTURE_CODE,
      asset_name: 'Zebra site',
    });
    const campsiteA = buildAsset({
      asset_id: 10,
      asset_code: CAMPSITE_STRUCTURE_CODE,
      asset_name: 'Alpha site',
    });

    const groups = groupAssetsByCampsite([campsiteB, campsiteA]);

    expect(groups.map((g) => g.campsite.asset_id)).toEqual([10, 20]);
  });

  it('treats a null asset_name as an empty string when sorting', () => {
    const campsiteNoName = buildAsset({
      asset_id: 10,
      asset_code: CAMPSITE_STRUCTURE_CODE,
      asset_name: null,
    });
    const campsiteNamed = buildAsset({
      asset_id: 20,
      asset_code: CAMPSITE_STRUCTURE_CODE,
      asset_name: 'Alpha site',
    });

    const groups = groupAssetsByCampsite([campsiteNamed, campsiteNoName]);

    expect(groups.map((g) => g.campsite.asset_id)).toEqual([10, 20]);
  });
});
