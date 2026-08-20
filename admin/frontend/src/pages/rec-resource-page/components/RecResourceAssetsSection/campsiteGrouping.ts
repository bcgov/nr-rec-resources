import type { Asset } from './types';

// rst.recreation_asset_code for "Campsite" — legacy, non-sequential value from
// migrations/rst/sql/V1.1.83__recreation_asset_code_update.sql. Hardcoded for now;
// TODO(backend): resolve dynamically once asset-code categorization exists.
export const CAMPSITE_STRUCTURE_CODE = 227;

export interface CampsiteGroup {
  campsite: Asset;
  children: Asset[];
}

export function groupAssetsByCampsite(assets: Asset[]): CampsiteGroup[] {
  const campsites = assets.filter(
    (asset) => asset.asset_code === CAMPSITE_STRUCTURE_CODE,
  );

  return campsites
    .map((campsite) => ({
      campsite,
      children: assets
        .filter((asset) => asset.parent_id === campsite.asset_id)
        .sort((a, b) =>
          (a.asset_name ?? '').localeCompare(b.asset_name ?? '', undefined, {
            numeric: true,
          }),
        ),
    }))
    .sort((a, b) =>
      (a.campsite.asset_name ?? '').localeCompare(
        b.campsite.asset_name ?? '',
        undefined,
        { numeric: true },
      ),
    );
}
