import {
  RecreationResourceDetailDto,
  RecreationResourceDetailUIModel,
} from '@/services';
import { AuthService } from '@/services/auth';
import { useQuery } from '@tanstack/react-query';
import { createRetryHandler, mapRecreationResourceDetail } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

interface UseGetRecreationResourceSummaryByIdOptions {
  enabled?: boolean;
}

export function useGetRecreationResourceSummaryById(
  rec_resource_id?: string,
  options?: UseGetRecreationResourceSummaryByIdOptions,
) {
  const authService = AuthService.getInstance();

  return useQuery<
    RecreationResourceDetailDto,
    unknown,
    RecreationResourceDetailUIModel
  >({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.summary(rec_resource_id!),
    queryFn: async () => {
      const token = (await authService.getToken()) as string;
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(
        `${apiBaseUrl.replace(/\/+$/, '')}/recreation-resources/${rec_resource_id}/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to load summary (${response.status})`);
      }

      return (await response.json()) as RecreationResourceDetailDto;
    },
    enabled: (options?.enabled ?? true) && !!rec_resource_id,
    retry: createRetryHandler(),
    select: mapRecreationResourceDetail,
  });
}
