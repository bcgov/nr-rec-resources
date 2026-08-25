import type {
  RecreationAssetBulkRepairDto,
  RepairChange,
} from '@/services/recreation-resource-admin';
import { getRepairGroupContext } from './RepairAssetEntry';
import type { RepairGroupFormState } from './RepairAssetEntry';
import type { Asset, AssetCode } from './types';

/**
 * Builds the bulk-repair API payload from the modal's form state. Assumes
 * every group has already passed isRepairGroupValid. Non-trail groups
 * collapse into one RepairChange covering every selected asset; trail groups
 * split into one RepairChange per selected asset so each can carry its own
 * start/end station.
 */
export function buildBulkRepairPayload(
  recreationRemedRepairCode: string,
  completionDate: string,
  repairGroups: RepairGroupFormState[],
  assets: Asset[],
  assetCodes: AssetCode[],
): RecreationAssetBulkRepairDto {
  const changes: RepairChange[] = repairGroups
    .filter((group) => group.assetTypeCode)
    .flatMap((group) => {
      const { selectedAssets, isTrailAssetType } = getRepairGroupContext(
        group,
        assets,
        assetCodes,
      );

      if (isTrailAssetType) {
        return selectedAssets.map((asset) => ({
          estimated_repair_cost: group.estimatedCost ?? 0,
          actual_repair_cost: group.actualCost,
          station_start:
            group.trailStations[asset.asset_id]?.startStation || undefined,
          station_end:
            group.trailStations[asset.asset_id]?.endStation || undefined,
          asset_ids: [asset.asset_id],
        }));
      }

      return [
        {
          estimated_repair_cost: group.estimatedCost ?? 0,
          actual_repair_cost: group.actualCost,
          asset_ids: selectedAssets.map((asset) => asset.asset_id),
        },
      ];
    });

  return {
    recreation_remed_repair_code: recreationRemedRepairCode,
    completed_date: completionDate || undefined,
    changes,
  };
}
