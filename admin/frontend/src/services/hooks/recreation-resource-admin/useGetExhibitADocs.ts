import { ExhibitADocDto, ResponseError } from '@/services';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryOptions, useQuery } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { RecreationResourcesApi } from '@/services/recreation-resource-admin';

export const useGetExhibitADocs = (
  recResourceId?: string,
  queryOptions: QueryOptions<ExhibitADocDto[], ResponseError> = {},
) => {
  const api =
    useRecreationResourceAdminApiClient() as unknown as RecreationResourcesApi;

  return useQuery<ExhibitADocDto[], ResponseError>({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.exhibitADocs(recResourceId!),
    initialData: [],
    queryFn: async () => {
      const docs = await api.getAllExhibitADocs({
        recResourceId: recResourceId!,
      });
      return docs;
    },
    enabled: Boolean(recResourceId),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to load Exhibit A documents after multiple attempts. Please try again later.',
          'getExhibitADocs-error',
        ),
    }),
    ...queryOptions,
  });
};
