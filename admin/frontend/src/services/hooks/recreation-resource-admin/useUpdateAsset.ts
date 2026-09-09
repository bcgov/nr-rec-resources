import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAssetsApiClient } from './useAssetsApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import type { UpdateRecreationAssetDto } from '@/services/recreation-resource-admin';

interface UpdateAssetVariables {
  assetId: number;
  recResourceId: string;
  dto: UpdateRecreationAssetDto;
}

export function useUpdateAsset() {
  const apiClient = useAssetsApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assetId, dto }: UpdateAssetVariables) =>
      apiClient.updateRecreationAsset({
        id: assetId,
        updateRecreationAssetDto: dto,
      }),
    onSuccess: (_data, variables) => {
      addSuccessNotification(
        'Asset updated successfully.',
        'updateAsset-success',
      );
      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets(
          variables.recResourceId,
        ),
      });
    },
    onError: () => {
      addErrorNotification('Failed to update asset.', 'updateAsset-error');
    },
  });
}
