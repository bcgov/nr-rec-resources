import { CAMPSITE_STRUCTURE_CODE } from './campsiteGrouping';
import type { Asset, AssetSummary } from './types';

// TODO(backend): last_inspection_date / last_hzd_tree_assessment_date come from the
// recreation resource itself (last_rec_inspection_date / last_hzrd_tree_assess_date on
// rst.recreation_resource), not from any asset — placeholder until the resource DTO
// exposes them. See "Verify/implement API issues" in
// local-docs/structures/fe-be-integration-plan.md.
const MOCK_LAST_INSPECTION_DATE = '2024-09-11';
const MOCK_LAST_HZD_TREE_ASSESSMENT_DATE = '2024-05-02';

export function computeAssetSummary(assets: Asset[]): AssetSummary {
  const repairs = assets.flatMap(
    (asset) => asset.recreation_asset_repair ?? [],
  );

  return {
    total_assets: assets.length,
    total_campsites: assets.filter(
      (asset) => asset.asset_code === CAMPSITE_STRUCTURE_CODE,
    ).length,
    total_value: assets.reduce(
      (sum, asset) => sum + (asset.actual_value ?? asset.default_value ?? 0),
      0,
    ),
    outstanding_repairs: repairs.filter(
      (repair) => !repair.repair_completed_date,
    ).length,
    spent_to_date: repairs.reduce(
      (sum, repair) => sum + (repair.actual_repair_cost ?? 0),
      0,
    ),
    last_inspection_date: MOCK_LAST_INSPECTION_DATE,
    last_hzd_tree_assessment_date: MOCK_LAST_HZD_TREE_ASSESSMENT_DATE,
  };
}
