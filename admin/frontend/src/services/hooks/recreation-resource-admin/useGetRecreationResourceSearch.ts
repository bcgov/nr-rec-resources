import { useQuery } from '@tanstack/react-query';
import {
  AdminSearchResponseDto,
  ResponseError,
} from '@/services/recreation-resource-admin';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { getAdminSearchQueryOptions } from '@/services/hooks/recreation-resource-admin/searchQueryOptions';
import { AdminSearchRouteState } from '@/pages/search/types';

export default function useGetRecreationResourceSearch(
  search: AdminSearchRouteState,
) {
  const recreationResourceAdminApiClient =
    useRecreationResourceAdminApiClient();

  return useQuery<AdminSearchResponseDto, ResponseError>({
    ...getAdminSearchQueryOptions(recreationResourceAdminApiClient, search),
    placeholderData: (previousData) => previousData,
  });
}
