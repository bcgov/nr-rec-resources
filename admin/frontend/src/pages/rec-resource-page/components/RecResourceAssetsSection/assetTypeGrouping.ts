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
  const codeMap = new Map(assetCodes.map((c) => [c.asset_code, c]));

  const assetsByCode = new Map<number, Asset[]>();
  for (const asset of assets) {
    const group = assetsByCode.get(asset.asset_code) ?? [];
    group.push(asset);
    assetsByCode.set(asset.asset_code, group);
  }

  return Array.from(assetsByCode.entries())
    .map(([structureCode, groupAssets]) => ({
      structureCode,
      description: codeMap.get(structureCode)?.description ?? 'Unknown',
      count: groupAssets.length,
      totalValue: groupAssets.reduce(
        (sum, a) =>
          sum +
          Number(
            a.actual_value ?? codeMap.get(a.asset_code)?.default_value ?? 0,
          ),
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
      assets: [...groupAssets].sort((a, b) =>
        (a.asset_name ?? '').localeCompare(b.asset_name ?? '', undefined, {
          numeric: true,
        }),
      ),
    }))
    .sort((a, b) => a.description.localeCompare(b.description));
}
