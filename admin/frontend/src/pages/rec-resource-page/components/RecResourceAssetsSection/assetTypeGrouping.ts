import type { Asset, RecreationStructureCode } from './types';

export interface AssetTypeGroup {
  structureCode: number;
  description: string;
  count: number;
  totalValue: number;
  assets: Asset[];
}

export function groupAssetsByType(
  assets: Asset[],
  structureCodes: RecreationStructureCode[],
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
    ([structureCode, groupAssets]) => ({
      structureCode,
      description: descriptionByCode.get(structureCode) ?? 'Unknown',
      count: groupAssets.length,
      totalValue: groupAssets.reduce(
        (sum, a) => sum + (a.actual_value ?? a.default_value ?? 0),
        0,
      ),
      assets: groupAssets,
    }),
  );
}
