import {
  RecreationAssetBulkRepairDto,
  ResponseError,
} from '@/services/recreation-resource-admin';
import { useAssetsApiClient } from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export interface BulkInsertAssetRepairsRequest {
  recResourceId: string;
  dto: RecreationAssetBulkRepairDto;
}

export function useBulkInsertAssetRepairs() {
  const assetsApiClient = useAssetsApiClient();
  const queryClient = useQueryClient();

  return useMutation<void, ResponseError, BulkInsertAssetRepairsRequest>({
    mutationFn: async ({ dto }) => {
      await assetsApiClient.bulkInsertAssetRepairs({
        recreationAssetBulkRepairDto: dto,
      });
    },
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to add repairs after multiple attempts. Please try again later.',
          'bulkInsertAssetRepairs-error',
        ),
    }),
    onSuccess: (_data, variables) => {
      addSuccessNotification(
        'Repairs added successfully',
        'bulkInsertAssetRepairs-success',
      );
      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets(
          variables.recResourceId,
        ),
      });
    },
    onError: (error) => {
      const statusCode = error.response?.status;
      if (statusCode === 404) {
        addErrorNotification(
          'One or more selected assets could not be found',
          'bulkInsertAssetRepairs-notfound',
        );
      } else if (statusCode === 400) {
        addErrorNotification(
          'Invalid repair details. Please check the form and try again',
          'bulkInsertAssetRepairs-badrequest',
        );
      }
    },
  });
}
