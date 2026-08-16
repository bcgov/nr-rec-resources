import type { Asset } from './types';

// rst.recreation_structure_code for "Campsite" (see MOCK_STRUCTURE_CODES).
export const CAMPSITE_STRUCTURE_CODE = 1;

export interface CampsiteGroup {
  campsite: Asset;
  children: Asset[];
}

export function groupAssetsByCampsite(assets: Asset[]): CampsiteGroup[] {
  const campsites = assets.filter(
    (asset) => asset.recreation_structure_code === CAMPSITE_STRUCTURE_CODE,
  );

  return campsites.map((campsite) => ({
    campsite,
    children: assets.filter((asset) => asset.parent_id === campsite.asset_id),
  }));
}
