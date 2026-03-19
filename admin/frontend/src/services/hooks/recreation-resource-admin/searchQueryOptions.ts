import type { AdminSearchRouteState } from '@/pages/search/types';
import type {
  AdminSearchResponseDto,
  RecreationResourcesApi,
  ResponseError,
  SearchRecreationResourcesDefinedCampsitesEnum,
  SearchRecreationResourcesRequest,
  SearchRecreationResourcesSortEnum,
} from '@/services/recreation-resource-admin';
import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';

const ADMIN_SEARCH_QUERY_STALE_TIME_MS = 30 * 1000;

export function buildAdminSearchRequest(
  search: AdminSearchRouteState,
): SearchRecreationResourcesRequest & { pageSize?: number } {
  return {
    q: search.q || undefined,
    sort: search.sort as SearchRecreationResourcesSortEnum,
    page: search.page,
    pageSize: search.page_size,
    type: search.type.length ? search.type : undefined,
    district: search.district.length ? search.district : undefined,
    activities: search.activities.length ? search.activities : undefined,
    status: search.status.length ? search.status : undefined,
    access: search.access.length ? search.access : undefined,
    definedCampsites: search.defined_campsites as
      | SearchRecreationResourcesDefinedCampsitesEnum
      | undefined,
    closestCommunity: search.closest_community || undefined,
    establishmentDateFrom: search.establishment_date_from,
    establishmentDateTo: search.establishment_date_to,
  };
}

export function getAdminSearchQueryOptions(
  apiClient: RecreationResourcesApi,
  search: AdminSearchRouteState,
) {
  const request = buildAdminSearchRequest(search);

  return {
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.search(request),
    queryFn: async (): Promise<AdminSearchResponseDto> =>
      await apiClient.searchRecreationResources(
        request as SearchRecreationResourcesRequest,
      ),
    retry: createRetryHandler(),
    staleTime: ADMIN_SEARCH_QUERY_STALE_TIME_MS,
  } satisfies {
    queryKey: ReturnType<typeof RECREATION_RESOURCE_QUERY_KEYS.search>;
    queryFn: () => Promise<AdminSearchResponseDto>;
    retry: (failureCount: number, error: ResponseError) => boolean;
    staleTime: number;
  };
}
