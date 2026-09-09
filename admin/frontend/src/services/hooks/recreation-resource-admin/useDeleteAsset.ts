import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAssetsApiClient } from './useAssetsApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { createRetryHandler } from './helpers';
import type { Asset } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';

export interface DeleteAssetRequest {
  recResourceId: string;
  assetId: number;
}

export function useDeleteAsset() {
  const apiClient = useAssetsApiClient();
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteAssetRequest>({
    mutationFn: ({ assetId }) =>
      apiClient.deleteRecreationAsset({ id: assetId }),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to delete asset after multiple attempts. Please try again later.',
          'deleteAsset-error',
        ),
    }),
    onSuccess: (_, variables) => {
      addSuccessNotification(
        'Asset deleted successfully.',
        'deleteAsset-success',
      );
      queryClient.setQueryData<Asset[]>(
        RECREATION_RESOURCE_QUERY_KEYS.assets(variables.recResourceId),
        (old) =>
          old?.filter((asset) => asset.asset_id !== variables.assetId) ?? [],
      );
      void queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets(
          variables.recResourceId,
        ),
      });
    },
    onError: () => {
      addErrorNotification('Failed to delete asset.', 'deleteAsset-error');
    },
  });
}
