import {
  RecreationResourceApi,
  RecreationResourceDetailDto,
  RecreationResourceDetailUIModel,
} from '@/services';
import { useQuery } from '@tanstack/react-query';
import { createRetryHandler, mapRecreationResourceDetail } from './helpers';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

export function useGetRecreationResourceById(rec_resource_id?: string) {
  const api = useRecreationResourceAdminApiClient() as RecreationResourceApi;

  return useQuery<
    RecreationResourceDetailDto,
    unknown,
    RecreationResourceDetailUIModel
  >({
    queryKey: ['recreation-resource', rec_resource_id],
    queryFn: () =>
      api.getRecreationResourceById({ recResourceId: rec_resource_id! }),
    enabled: !!rec_resource_id,
    retry: createRetryHandler(),
    select: mapRecreationResourceDetail,
  });
}
