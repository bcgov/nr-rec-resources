import {
  BulkUpdateRecreationAssetsRequest,
  RecreationAssetBulkUpdateDto,
  ResponseError,
  createRetryHandler,
} from '@/services';
import { useAssetsApiClient } from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export function useBulkUpdateAssets() {
  const assetsApiClient = useAssetsApiClient();
  const queryClient = useQueryClient();

  return useMutation<
    RecreationAssetBulkUpdateDto,
    ResponseError,
    BulkUpdateRecreationAssetsRequest
  >({
    mutationFn: async (request) => {
      return await (assetsApiClient as any).bulkUpdateRecreationAssets({
        recreationAssetBulkUpdateDto: request.recreationAssetBulkUpdateDto,
      });
    },
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to update assets after multiple attempts. Please try again later.',
          'bulkUpdateAssets-retry-failed',
        ),
    }),
    onSuccess: (data) => {
      const assetList = data.asset_ids?.join(', ') || 'selected';
      addSuccessNotification(
        `Assets ${assetList} updated successfully`,
        'bulkUpdateAssets-success',
      );

      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets(data.rec_resource_id),
      });
    },
    onError: (error) => {
      addErrorNotification(
        error.message ||
          'This operation resulted in an error. The update was not successful.',
        'bulkUpdateAssets-error',
      );
    },
  });
}
