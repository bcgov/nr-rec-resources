import { useQuery } from '@tanstack/react-query';
import {
  RecreationResourceReservationInfoDto,
  RecreationResourcesApi,
} from '@/services/recreation-resource-admin';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { createRetryHandler } from './helpers';

export function useGetRecreationResourceReservation(recResourceId?: string) {
  const api =
    useRecreationResourceAdminApiClient() as unknown as RecreationResourcesApi;

  const id = recResourceId ?? '';

  return useQuery<RecreationResourceReservationInfoDto | null>({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.reservation(id),
    enabled: !!recResourceId,
    retry: createRetryHandler(),
    queryFn: async () => {
      try {
        return await api.getRecreationResourceReservation({
          recResourceId: recResourceId!,
        });
      } catch (error: any) {
        if (error?.status === 404 || error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });
}

export default useGetRecreationResourceReservation;
