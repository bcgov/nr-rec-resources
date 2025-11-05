import {
  RecreationResourceApi,
  Configuration,
  SearchRecreationResourcesRequest,
} from '@/service/recreation-resource';
import { getBasePath } from '@/service/hooks/helpers';
import { transformRecreationResourceBase } from '@/service/queries/recreation-resource/helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/service/queries/recreation-resource/queryKeys';
import { trackSiteSearch } from '@shared/utils';
import buildQueryString from '@/utils/buildQueryString';

interface SearchParams extends SearchRecreationResourcesRequest {
  // Extend generated request with additional params not used in the api
  community?: string;
}

/**
 * Non-hook function to fetch search results for use in loaders.
 * This allows data to be prefetched during route navigation.
 */
export const getSearchResults = async (params: SearchParams) => {
  const api = new RecreationResourceApi(
    new Configuration({
      basePath: getBasePath(),
    }),
  );

  const DEFAULT_PAGE = 1;

  const response = await api.searchRecreationResources({
    ...params,
    page: params.page || DEFAULT_PAGE,
  });

  sessionStorage.setItem(
    'lastSearch',
    buildQueryString(params as { [key: string]: string | number }),
  );

  trackSiteSearch({
    keyword: JSON.stringify(params),
    category: 'Search and filter query',
    resultsCount: response.total,
  });

  return {
    ...response,
    data: response.data.map((item) => transformRecreationResourceBase(item)),
  };
};

/**
 * Loader function for the search route.
 * Prefetches search results using TanStack Router's loader pattern.
 * Uses ensureInfiniteQueryData to match the infinite query structure.
 */
export async function searchLoader({ context, location }: any) {
  const searchParams = location.search;

  const params: SearchParams = {
    limit: 10,
    filter: searchParams.filter ?? undefined,
    district: searchParams.district ?? undefined,
    activities: searchParams.activities ?? undefined,
    access: searchParams.access ?? undefined,
    facilities: searchParams.facilities ?? undefined,
    status: searchParams.status ?? undefined,
    fees: searchParams.fees ?? undefined,
    lat: searchParams.lat ? Number(searchParams.lat) : undefined,
    lon: searchParams.lon ? Number(searchParams.lon) : undefined,
    community: searchParams.community ?? undefined,
    type: searchParams.type ?? undefined,
    page: searchParams.page ?? 1,
  };

  await context.queryClient.ensureInfiniteQueryData({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.search(params),
    initialPageParam: params,
    queryFn: async ({ pageParam }: { pageParam: SearchParams }) => {
      return await getSearchResults(pageParam);
    },
    pages: 1,
  });

  return { searchParams: params };
}
