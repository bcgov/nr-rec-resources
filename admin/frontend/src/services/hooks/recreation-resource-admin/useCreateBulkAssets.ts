import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAssetsApiClient } from './useAssetsApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { createRetryHandler } from './helpers';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import type { CreateRecreationAssetDto } from '@/services/recreation-resource-admin';

export interface BulkCreateAssetsRequest {
  recResourceId: string;
  assets: CreateRecreationAssetDto[];
}

export function useCreateBulkAssets() {
  const assetsApiClient = useAssetsApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assets }: BulkCreateAssetsRequest) =>
      assetsApiClient.bulkCreateRecreationAssets(assets),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to create assets after multiple attempts. Please try again later.',
          'bulkCreateAssets-error',
        ),
    }),
    onSuccess: (_, variables) => {
      addSuccessNotification(
        `${variables.assets.length} asset(s) created successfully`,
        'bulkCreateAssets-success',
      );
      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets(
          variables.recResourceId,
        ),
      });
    },
    onError: () => {
      addErrorNotification(
        'Failed to create assets. Please try again.',
        'bulkCreateAssets-error',
      );
    },
  });
}
