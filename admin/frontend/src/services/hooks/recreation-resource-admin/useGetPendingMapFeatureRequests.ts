import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  PendingMapFeatureRequestsResponseDto,
  ResponseError,
} from '@/services/recreation-resource-admin';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export function useGetPendingMapFeatureRequests(
  queryOptions?: Partial<
    UseQueryOptions<PendingMapFeatureRequestsResponseDto, ResponseError>
  >,
) {
  const api = useRecreationResourceAdminApiClient();

  return useQuery<PendingMapFeatureRequestsResponseDto, ResponseError>({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.pendingRequests(),
    queryFn: () => api.getPendingMapFeatureRequests(),
    ...queryOptions,
  });
}
