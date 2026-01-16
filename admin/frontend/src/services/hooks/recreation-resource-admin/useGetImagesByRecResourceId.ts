import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import {
  RecreationResourceImageDto,
  ResponseError,
} from '@/services/recreation-resource-admin';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryOptions, useQuery } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export const useGetImagesByRecResourceId = (
  recResourceId?: string,
  queryOptions: QueryOptions<RecreationResourceImageDto[], ResponseError> = {},
) => {
  const recreationResourceAdminApiClient =
    useRecreationResourceAdminApiClient();

  return useQuery<RecreationResourceImageDto[], ResponseError>({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.images(recResourceId!),
    initialData: [],
    queryFn: async () => {
      const images =
        await recreationResourceAdminApiClient.getImagesByRecResourceId({
          recResourceId: recResourceId!,
        });
      return images;
    },
    enabled: Boolean(recResourceId),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to load images after multiple attempts. Please try again later.',
          'getImagesByRecResourceId-error',
        ),
    }),
    ...queryOptions,
  });
};
