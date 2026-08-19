import type { Asset, AssetCode } from './types';

export interface AssetTypeGroup {
  structureCode: number;
  description: string;
  count: number;
  totalValue: number;
  activeRepairsCount: number;
  assets: Asset[];
}

export function groupAssetsByType(
  assets: Asset[],
  assetCodes: AssetCode[],
): AssetTypeGroup[] {
  const descriptionByCode = new Map(
    assetCodes.map((c) => [c.asset_code, c.description]),
  );

  const assetsByCode = new Map<number, Asset[]>();
  for (const asset of assets) {
    const group = assetsByCode.get(asset.asset_code) ?? [];
    group.push(asset);
    assetsByCode.set(asset.asset_code, group);
  }

  return Array.from(assetsByCode.entries())
    .map(([structureCode, groupAssets]) => ({
      structureCode,
      description: descriptionByCode.get(structureCode) ?? 'Unknown',
      count: groupAssets.length,
      totalValue: groupAssets.reduce(
        (sum, a) => sum + (a.actual_value ?? a.default_value ?? 0),
        0,
      ),
      activeRepairsCount: groupAssets.reduce(
        (sum, a) =>
          sum +
          (a.recreation_asset_repair ?? []).filter(
            (repair) => !repair.repair_completed_date,
          ).length,
        0,
      ),
      assets: groupAssets,
    }))
    .sort((a, b) => a.description.localeCompare(b.description));
}
