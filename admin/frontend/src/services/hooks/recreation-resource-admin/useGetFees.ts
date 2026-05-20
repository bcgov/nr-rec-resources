import {
  RecreationFeeUIModel,
  RecreationResourcesApi,
  ResponseError,
  useRecreationResourceAdminApiClient,
} from '@/services';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryOptions, useQuery } from '@tanstack/react-query';
import { createRetryHandler, mapRecreationFee } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export const useGetFees = (
  recResourceId?: string,
  queryOptions: QueryOptions<RecreationFeeUIModel[], ResponseError> = {},
) => {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;

  return useQuery<RecreationFeeUIModel[], ResponseError>({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.fees(recResourceId!),
    initialData: [],
    queryFn: async () => {
      const fees = await (api as any).getRecreationResourceFees({
        recResourceId: recResourceId!,
      });
      return fees.map(mapRecreationFee);
    },
    enabled: Boolean(recResourceId),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to load fees after multiple attempts. Please try again later.',
          'getFees-error',
        ),
    }),
    ...queryOptions,
  });
};
