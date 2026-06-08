import { useQuery } from '@tanstack/react-query';
import {
  RecreationResourceAdvisoryDto,
  RecreationResourcesApi,
} from '@/services/recreation-resource-admin';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { createRetryHandler } from './helpers';

export function useGetRecreationResourceAdvisories(recResourceId?: string) {
  const api =
    useRecreationResourceAdminApiClient() as unknown as RecreationResourcesApi;

  const id = recResourceId ?? '';

  return useQuery<RecreationResourceAdvisoryDto[]>({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.advisories(id),
    enabled: !!recResourceId,
    retry: createRetryHandler(),
    queryFn: async () => {
      return api.getRecreationResourceAdvisories({
        recResourceId: recResourceId!,
      });
    },
  });
}

export default useGetRecreationResourceAdvisories;
