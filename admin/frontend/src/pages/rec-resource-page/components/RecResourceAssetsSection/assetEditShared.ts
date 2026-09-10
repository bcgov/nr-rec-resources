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

function getChildrenByParentId(assets?: Asset[]): Map<number, number[]> {
  const childrenByParentId = new Map<number, number[]>();

  for (const asset of assets ?? []) {
    if (asset.parent_id == null) continue;
    const current = childrenByParentId.get(asset.parent_id) ?? [];
    current.push(asset.asset_id);
    childrenByParentId.set(asset.parent_id, current);
  }

  return childrenByParentId;
}

function getDescendantAssetIdsPostOrder(
  assets: Asset[] | undefined,
  rootAssetId: number,
): number[] {
  const childrenByParentId = getChildrenByParentId(assets);
  const descendants: number[] = [];
  const stack: Array<{ assetId: number; visited: boolean }> = [
    { assetId: rootAssetId, visited: false },
  ];

  // Post-order traversal ensures children are deleted before their parents.
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (current.visited) {
      if (current.assetId !== rootAssetId) {
        descendants.push(current.assetId);
      }
      continue;
    }

    stack.push({ assetId: current.assetId, visited: true });

    const childIds = childrenByParentId.get(current.assetId) ?? [];
    for (let i = childIds.length - 1; i >= 0; i -= 1) {
      stack.push({ assetId: childIds[i], visited: false });
    }
  }

  return descendants;
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
  const childrenByParentId = getChildrenByParentId(assets);
  const linkedChildren = childrenByParentId.get(assetId) ?? [];
  const shouldUnassignChildren =
    linkedChildren.length > 0 && (!mode || mode === 'unassign-children');

  if (shouldUnassignChildren) {
    await Promise.all(
      linkedChildren.map((childAssetId) =>
        updateAsset({
          assetId: childAssetId,
          recResourceId,
          dto: { parent_id: null },
        }),
      ),
    );
  }

  if (mode === 'delete-with-campsite' && linkedChildren.length > 0) {
    const descendantAssetIds = getDescendantAssetIdsPostOrder(assets, assetId);
    for (const descendantAssetId of descendantAssetIds) {
      await deleteAssetMutation({ recResourceId, assetId: descendantAssetId });
    }
  }

  await deleteAssetMutation({ recResourceId, assetId });
}
