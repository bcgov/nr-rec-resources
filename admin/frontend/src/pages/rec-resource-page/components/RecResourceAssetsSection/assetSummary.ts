import { CAMPSITE_STRUCTURE_CODE } from './campsiteGrouping';
import type { Asset, AssetCode, AssetSummary } from './types';

// last_inspection_date / last_hzd_tree_assessment_date come from the recreation
// resource itself (last_rec_inspection_date / last_hzrd_tree_assess_date on
// rst.recreation_resource), not from any asset -- callers pass them in.
export function computeAssetSummary(
  assets: Asset[],
  lastInspectionDate: Date | null = null,
  lastHzdTreeAssessmentDate: Date | null = null,
  assetCodes: AssetCode[] = [],
): AssetSummary {
  const codeMap = new Map(assetCodes.map((c) => [c.asset_code, c]));
  const repairs = assets.flatMap(
    (asset) => asset.recreation_asset_repair ?? [],
  );

  return {
    total_assets: assets.length,
    total_campsites: assets.filter(
      (asset) => asset.asset_code === CAMPSITE_STRUCTURE_CODE,
    ).length,
    total_value: assets.reduce(
      (sum, asset) =>
        sum +
        (asset.actual_value ??
          codeMap.get(asset.asset_code)?.default_value ??
          0),
      0,
    ),
    outstanding_repairs: repairs.filter(
      (repair) => !repair.repair_completed_date,
    ).length,
    spent_to_date: repairs.reduce(
      (sum, repair) => sum + (repair.actual_repair_cost ?? 0),
      0,
    ),
    last_inspection_date: lastInspectionDate,
    last_hzd_tree_assessment_date: lastHzdTreeAssessmentDate,
  };
}
