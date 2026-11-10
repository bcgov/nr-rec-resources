import { useQuery } from '@tanstack/react-query';
import {
  PendingMapFeatureRequestsResponseDto,
  RecreationResourcesApi,
  ResponseError,
} from '@/services/recreation-resource-admin';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export function useGetMapFeatureRequestsByRecResourceId(
  recResourceId?: string,
) {
  const api =
    useRecreationResourceAdminApiClient() as unknown as RecreationResourcesApi;

  const id = recResourceId ?? '';

  return useQuery<PendingMapFeatureRequestsResponseDto, ResponseError>({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.spatialSubmissions(id),
    enabled: !!recResourceId,
    queryFn: () =>
      api.getMapFeatureRequestsByRecResourceId({
        recResourceId: recResourceId!,
      }),
  });
}
