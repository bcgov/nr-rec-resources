import {
  RecreationFeeDto,
  RecreationFeeUIModel,
  RecreationResourcesApi,
} from '@/services';
import { useQuery } from '@tanstack/react-query';
import { createRetryHandler, mapRecreationFee } from './helpers';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export function useGetFees(recResourceId?: string) {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;

  return useQuery<RecreationFeeDto[], unknown, RecreationFeeUIModel[]>({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.fees(recResourceId!),
    queryFn: () =>
      api.getRecreationResourceFees({ recResourceId: recResourceId! }),
    enabled: !!recResourceId,
    retry: createRetryHandler(),
    select: (data) => data.map(mapRecreationFee),
  });
}
