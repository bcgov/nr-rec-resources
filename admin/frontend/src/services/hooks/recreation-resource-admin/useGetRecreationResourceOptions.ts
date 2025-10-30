import {
  RecreationResourceOptionUIModel,
  ResponseError,
  useRecreationResourceAdminApiClient,
} from '@/services';
import { GetOptionsByTypeTypeEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import { addErrorNotification } from '@/store/notificationStore';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';

export function useGetRecreationResourceOptions(
  type: GetOptionsByTypeTypeEnum,
  queryOptions?: Partial<
    UseQueryOptions<RecreationResourceOptionUIModel[], ResponseError>
  >,
) {
  const api = useRecreationResourceAdminApiClient();

  return useQuery<RecreationResourceOptionUIModel[], ResponseError>({
    queryKey: ['recreation-resource-options', type],
    queryFn: () =>
      api.getOptionsByType({
        type,
      }),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          `Failed to load options for type ${type} after multiple attempts. Please try again later.`,
          'getOptionsByType-error',
        ),
    }),
    staleTime: 5 * 60 * 1000, // Options data is relatively static, cache for 5 minutes
    ...queryOptions,
  });
}
