import { useRecreationResourceAdminApiClient } from '@/services';
import { useQuery } from '@tanstack/react-query';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export function useGetTrails(recResourceId: string) {
  const api = useRecreationResourceAdminApiClient();

  return useQuery({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.trails(recResourceId),
    queryFn: () => api.getTrailsByRecResourceId({ recResourceId }),
    enabled: !!recResourceId,
    staleTime: 30_000,
  });
}
