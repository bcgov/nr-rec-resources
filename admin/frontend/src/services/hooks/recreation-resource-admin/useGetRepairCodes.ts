import { ResponseError } from '@/services/recreation-resource-admin';
import { useAssetsApiClient } from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import type { RepairCode } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryOptions, useQuery } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export const useGetRepairCodes = (
  queryOptions: QueryOptions<RepairCode[], ResponseError> = {},
) => {
  const assetsApiClient = useAssetsApiClient();

  return useQuery<RepairCode[], ResponseError>({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.repairCodes(),
    initialData: [],
    queryFn: () =>
      assetsApiClient.recreationAssetControllerFindAllRepairCodes(),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to load repair codes after multiple attempts. Please try again later.',
          'getRepairCodes-error',
        ),
    }),
    ...queryOptions,
  });
};
