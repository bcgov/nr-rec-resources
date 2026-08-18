import type { Asset, AssetRepair, RecreationStructureCode } from './types';

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
  structureCodes: RecreationStructureCode[],
  repairs: AssetRepair[],
): AssetTypeGroup[] {
  const descriptionByCode = new Map(
    structureCodes.map((c) => [c.structure_code, c.description]),
  );

  const assetsByCode = new Map<number, Asset[]>();
  for (const asset of assets) {
    const group = assetsByCode.get(asset.recreation_structure_code) ?? [];
    group.push(asset);
    assetsByCode.set(asset.recreation_structure_code, group);
  }

  return Array.from(assetsByCode.entries()).map(
    ([structureCode, groupAssets]) => {
      const assetIds = new Set(groupAssets.map((a) => a.asset_id));

      return {
        structureCode,
        description: descriptionByCode.get(structureCode) ?? 'Unknown',
        count: groupAssets.length,
        totalValue: groupAssets.reduce(
          (sum, a) => sum + (a.actual_value ?? a.default_value ?? 0),
          0,
        ),
        activeRepairsCount: repairs.filter(
          (repair) =>
            assetIds.has(repair.asset_id) && !repair.repair_completed_date,
        ).length,
        assets: groupAssets,
      };
    },
  );
}
