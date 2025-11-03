import {
  OptionsByTypeDto,
  ResponseError,
  useRecreationResourceAdminApiClient,
} from '@/services';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import { addErrorNotification } from '@/store/notificationStore';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';

export function useGetRecreationResourceOptions(
  types: Array<GetOptionsByTypesTypesEnum>,
  queryOptions?: Partial<
    UseQueryOptions<Array<OptionsByTypeDto>, ResponseError>
  >,
) {
  const api = useRecreationResourceAdminApiClient();

  const queryKey = ['recreation-resource-options', ...types];

  return useQuery({
    queryKey,
    queryFn: () => api.getOptionsByTypes({ types }),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          `Failed to load options for types ${types.join(', ')} after multiple attempts. Please try again later.`,
          'getOptionsByTypes-error',
        ),
    }),
    staleTime: 5 * 60 * 1000, // Options data is relatively static, cache for 5 minutes
    ...queryOptions,
  });
}
