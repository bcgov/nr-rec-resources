import { useQuery } from '@tanstack/react-query';
import {
  AdminSearchResponseDto,
  ResponseError,
  SearchRecreationResourcesDefinedCampsitesEnum,
  SearchRecreationResourcesRequest,
  SearchRecreationResourcesSortEnum,
} from '@/services/recreation-resource-admin';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { AdminSearchRouteState } from '@/pages/search/types';

function buildSearchRequest(
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

export default function useGetRecreationResourceSearch(
  search: AdminSearchRouteState,
) {
  const recreationResourceAdminApiClient =
    useRecreationResourceAdminApiClient();
  const request = buildSearchRequest(search);

  return useQuery<AdminSearchResponseDto, ResponseError>({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.search(request),
    queryFn: async () => {
      return await recreationResourceAdminApiClient.searchRecreationResources(
        request as SearchRecreationResourcesRequest,
      );
    },
    enabled: true,
    retry: createRetryHandler(),
    placeholderData: (previousData) => previousData,
  });
}
