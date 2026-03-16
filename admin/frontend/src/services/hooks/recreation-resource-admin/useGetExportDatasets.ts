import {
  ListExportDatasetsResponseDto,
  ResponseError,
  useRecreationResourceAdminApiClient,
} from '@/services';
import { addErrorNotification } from '@/store/notificationStore';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export function useGetExportDatasets(
  queryOptions?: Partial<
    UseQueryOptions<ListExportDatasetsResponseDto, ResponseError>
  >,
) {
  const api = useRecreationResourceAdminApiClient();

  return useQuery({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.exportDatasets(),
    queryFn: () => api.getExportDatasets(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to load export datasets after multiple attempts. Please try again later.',
          'getExportDatasets-error',
        ),
    }),
    ...queryOptions,
  });
}
