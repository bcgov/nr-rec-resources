import { ResponseError } from '@/services/recreation-resource-admin';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export interface NextRecResourceIdDto {
  rec_resource_id: string;
}

export function useGetNextRecResourceId(
  queryOptions?: Partial<UseQueryOptions<NextRecResourceIdDto, ResponseError>>,
) {
  const api = useRecreationResourceAdminApiClient();

  return useQuery({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.nextRecResourceId(),
    queryFn: () => api.getNextRecResourceId(),
    staleTime: 60 * 1000,
    ...queryOptions,
  });
}
