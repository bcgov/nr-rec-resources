import {
  RecreationResourceDetailDto,
  RecreationResourceDetailUIModel,
  RecreationResourcesApi,
} from '@/services';
import { useQuery } from '@tanstack/react-query';
import { createRetryHandler, mapRecreationResourceDetail } from './helpers';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export function useGetRecreationResourceById(rec_resource_id?: string) {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;

  return useQuery<
    RecreationResourceDetailDto,
    unknown,
    RecreationResourceDetailUIModel
  >({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.detail(rec_resource_id!),
    queryFn: () =>
      api.getRecreationResourceById({ recResourceId: rec_resource_id! }),
    enabled: !!rec_resource_id,
    retry: createRetryHandler(),
    select: mapRecreationResourceDetail,
  });
}
