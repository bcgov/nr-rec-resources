import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { RecreationResourceApi } from '@/services/recreation-resource-admin';
import { useQuery } from '@tanstack/react-query';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

export function useGetRecreationResourceById(rec_resource_id?: string) {
  const api = useRecreationResourceAdminApiClient() as RecreationResourceApi;

  return useQuery({
    queryKey: ['recreation-resource', rec_resource_id],
    queryFn: () =>
      api.getRecreationResourceById({ recResourceId: rec_resource_id! }),
    enabled: !!rec_resource_id,
    retry: createRetryHandler(),
  });
}
