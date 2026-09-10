import { describe, expect, it, vi } from 'vitest';
import { deleteAssetWithLinkedChildren } from './assetEditShared';
import type { Asset } from './types';

function makeAsset(assetId: number, parentId: number | null): Asset {
  return {
    asset_id: assetId,
    parent_id: parentId,
    rec_resource_id: 'REC-1',
    asset_code: 1,
    asset_name: `Asset ${assetId}`,
    asset_tag: null,
    asset_comment: null,
    legacy_structure_id: null,
    asset_length: null,
    asset_width: null,
    asset_area: null,
    actual_value: null,
    installation_date: null,
    updated_by: null,
    updated_at: null,
    geometry_type_code: null,
    latitude: null,
    longitude: null,
    recreation_asset_repair: null,
  };
}

describe('deleteAssetWithLinkedChildren', () => {
  it('deletes descendants before deleting the selected parent in cascade mode', async () => {
    const assets: Asset[] = [
      makeAsset(1, null),
      makeAsset(2, 1),
      makeAsset(3, 2),
      makeAsset(4, 1),
    ];

    const updateAsset = vi.fn().mockResolvedValue(undefined);
    const deleteAssetMutation = vi.fn().mockResolvedValue(undefined);

    await deleteAssetWithLinkedChildren({
      assets,
      assetId: 1,
      mode: 'delete-with-campsite',
      recResourceId: 'REC-1',
      updateAsset,
      deleteAssetMutation,
    });

    expect(updateAsset).not.toHaveBeenCalled();

    const deletedIds = deleteAssetMutation.mock.calls.map(
      (call) => call[0].assetId,
    );

    expect(deletedIds[deletedIds.length - 1]).toBe(1);
    expect(deletedIds.slice(0, -1)).toEqual(expect.arrayContaining([2, 3, 4]));
    expect(deletedIds.indexOf(3)).toBeLessThan(deletedIds.indexOf(2));
  });

  it('defaults to unassigning direct children when mode is not provided', async () => {
    const assets: Asset[] = [
      makeAsset(10, null),
      makeAsset(11, 10),
      makeAsset(12, 11),
    ];

    const updateAsset = vi.fn().mockResolvedValue(undefined);
    const deleteAssetMutation = vi.fn().mockResolvedValue(undefined);

    await deleteAssetWithLinkedChildren({
      assets,
      assetId: 10,
      recResourceId: 'REC-1',
      updateAsset,
      deleteAssetMutation,
    });

    expect(updateAsset).toHaveBeenCalledTimes(1);
    expect(updateAsset).toHaveBeenCalledWith({
      assetId: 11,
      recResourceId: 'REC-1',
      dto: { parent_id: null },
    });

    expect(deleteAssetMutation).toHaveBeenCalledTimes(1);
    expect(deleteAssetMutation).toHaveBeenCalledWith({
      recResourceId: 'REC-1',
      assetId: 10,
    });
  });
});
