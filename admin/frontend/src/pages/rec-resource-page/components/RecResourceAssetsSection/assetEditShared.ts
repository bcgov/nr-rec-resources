import type { UpdateRecreationAssetRepairDto } from '@/services/recreation-resource-admin';
import {
  validateLatitude,
  validateLongitude,
} from '@/utils/coordinateValidation';
import type { AssetEditFormValues, AssetDeleteMode } from './AssetCardEdit';
import type { Asset } from './types';

export function getCoordinateValidationError(values: AssetEditFormValues): {
  message: string;
  id: string;
} | null {
  const latitude = values.latitude.trim();
  const longitude = values.longitude.trim();
  const hasLatitude = latitude !== '';
  const hasLongitude = longitude !== '';

  if (hasLatitude !== hasLongitude) {
    return {
      message: 'Both latitude and longitude must be set together.',
      id: 'saveCampsite-latlng-error',
    };
  }

  if (!hasLatitude) {
    return null;
  }

  if (validateLatitude(latitude)) {
    return {
      message: 'Latitude must be between -90 and 90.',
      id: 'saveCampsite-lat-error',
    };
  }

  if (validateLongitude(longitude)) {
    return {
      message: 'Longitude must be between -180 and 180.',
      id: 'saveCampsite-lng-error',
    };
  }

  return null;
}

export function buildPendingAssetRepairChanges(
  prev: Map<number, Partial<UpdateRecreationAssetRepairDto>>,
  assets: Asset[] | undefined,
  assetId: number,
) {
  const deletedAsset = assets?.find((a) => a.asset_id === assetId);
  if (!deletedAsset) return prev;

  const updated = new Map(prev);
  deletedAsset.recreation_asset_repair?.forEach((repair) => {
    updated.delete(repair.repair_id);
  });
  return updated;
}

export function buildPendingAssetChanges(
  prev: Map<number, AssetEditFormValues>,
  assetId: number,
) {
  const updated = new Map(prev);
  updated.delete(assetId);
  return updated;
}

export async function deleteAssetWithLinkedChildren({
  assets,
  assetId,
  mode,
  recResourceId,
  updateAsset,
  deleteAssetMutation,
}: {
  assets: Asset[] | undefined;
  assetId: number;
  mode?: AssetDeleteMode;
  recResourceId: string;
  updateAsset: (args: {
    assetId: number;
    recResourceId: string;
    dto: { parent_id: null };
  }) => Promise<any>;
  deleteAssetMutation: (args: {
    recResourceId: string;
    assetId: number;
  }) => Promise<any>;
}) {
  const linkedChildren = (assets ?? []).filter(
    (asset) => asset.parent_id === assetId,
  );

  if (mode === 'unassign-children' && linkedChildren.length > 0) {
    await Promise.all(
      linkedChildren.map((child) =>
        updateAsset({
          assetId: child.asset_id,
          recResourceId,
          dto: { parent_id: null },
        }),
      ),
    );
  }

  if (mode === 'delete-with-campsite' && linkedChildren.length > 0) {
    await Promise.all(
      linkedChildren.map((child) =>
        deleteAssetMutation({ recResourceId, assetId: child.asset_id }),
      ),
    );
  }

  await deleteAssetMutation({ recResourceId, assetId });
}
