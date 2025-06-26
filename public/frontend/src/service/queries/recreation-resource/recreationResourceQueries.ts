import {
  GetRecreationResourceByIdRequest,
  GetSiteOperatorByIdRequest,
  PaginatedRecreationResourceDto,
  ResponseError,
  SearchRecreationResourcesRequest,
  SiteOperatorDto,
} from '@/service/recreation-resource';
import { useRecreationResourceApi } from '@/service/hooks/useRecreationResourceApi';
import { useInfiniteQuery, useQuery } from '~/@tanstack/react-query';
import { trackSiteSearch } from '@/utils/matomo';
import buildQueryString from '@/utils/buildQueryString';
import {
  transformRecreationResourceBase,
  transformRecreationResourceDetail,
} from '@/service/queries/recreation-resource/helpers';
import { InfiniteData } from '@tanstack/react-query';
import { RecreationResourceDetailModel } from '@/service/custom-models';

interface SearchParams extends SearchRecreationResourcesRequest {
  // Extend generated request with additional params not used in the api
  community?: string;
}

/**
 * Custom hook to fetch a recreation resource by ID.
 *
 * @param {Partial<GetRecreationResourceByIdRequest>} params - The parameters for the query
 * @param {string} params.id - The unique identifier of the recreation resource
 * @param {Array<GetRecreationResourceByIdImageSizeCodesEnum>} params.imageSizeCodes - Array of image size codes to request
 */
export const useGetRecreationResourceById = ({
  id,
  imageSizeCodes,
}: Partial<GetRecreationResourceByIdRequest>) => {
  const api = useRecreationResourceApi();
  return useQuery<RecreationResourceDetailModel | undefined, ResponseError>({
    queryKey: ['recreationResource', id],

    // Fetch function that calls the API and transforms the response
    queryFn: async () => {
      if (id) {
        const response = await api.getRecreationResourceById({
          id,
          imageSizeCodes,
        });

        // normalize image urls
        return transformRecreationResourceDetail(
          response,
        ) as RecreationResourceDetailModel;
      }
    },

    // Only execute query when ID is provided
    enabled: !!id,

    // only retry on server errors (5xx)
    retry: (_failureCount, error) => {
      const status = error?.response?.status;
      return status >= 500 && status < 600;
    },
  });
};

/**
 * Custom hook to fetch a site operator by ID.
 *
 * @param {Partial<GetSiteOperatorByIdRequest>} params - The parameters for the query
 * @param {string} params.id - The unique identifier of the recreation resource
 */
export const useGetSiteOperatorById = ({
  id,
}: Partial<GetSiteOperatorByIdRequest>) => {
  const api = useRecreationResourceApi();
  return useQuery<SiteOperatorDto | undefined, ResponseError>({
    queryKey: ['siteOperator', id],

    // Fetch function that calls the API and returns the response
    queryFn: async () => {
      if (id) {
        return await api.getSiteOperatorById({
          id,
        });
      }
    },

    // Only execute query when ID is provided
    enabled: !!id,

    // only retry on server errors (5xx)
    retry: (_failureCount, error) => {
      const status = error?.response?.status;
      if (status >= 500 && status < 600 && _failureCount < 3) {
        return true; // Retry up to 3 times for other errors
      } else {
        return false;
      }
    },
  });
};

/**
 * Custom hook for fetching and managing paginated recreation resources
 * using React Query's infinite query capabilities.
 *
 * @param {Object} params - Hook parameters
 * @param {Object} params.searchRecreationResourcesParams - Search parameters excluding page number
 */
export const useSearchRecreationResourcesPaginated = (params: SearchParams) => {
  const api = useRecreationResourceApi();
  // Default page number for initial load and fallback
  const DEFAULT_PAGE = 1;

  /**
   * Determines the previous page parameters for pagination
   * Returns undefined when on the first page to prevent backward pagination
   */
  const getPreviousPageParam = (
    firstPage: PaginatedRecreationResourceDto,
    _allPages: PaginatedRecreationResourceDto[],
    firstPageParam: SearchRecreationResourcesRequest,
  ) => {
    const currentPage = Number(firstPage.page);
    if (currentPage <= 1) return undefined;

    return {
      ...firstPageParam,
      page: currentPage - 1,
    };
  };

  /**
   * Determines the next page parameters for pagination
   * Returns undefined when reaching the last page to stop forward pagination
   */
  const getNextPageParam = (
    lastPage: PaginatedRecreationResourceDto,
    _allPages: PaginatedRecreationResourceDto[],
    lastPageParam: SearchRecreationResourcesRequest,
  ) => {
    const { limit, total } = lastPage;
    const currentPage = Number(lastPageParam.page || DEFAULT_PAGE);
    // Calculate total pages based on items per page and total items
    const totalPages = Math.ceil(total / limit);

    if (currentPage >= totalPages) return undefined;

    return {
      ...lastPageParam,
      page: currentPage + 1,
    };
  };

  /**
   * Fetches recreation resources for the specified page
   * Transforms the response data using transformRecreationResource
   */
  const queryFn = async ({ pageParam }: { pageParam: SearchParams }) => {
    try {
      const response = await api.searchRecreationResources({
        ...pageParam,
        page: pageParam.page || DEFAULT_PAGE,
      });

      sessionStorage.setItem(
        'lastSearch',
        buildQueryString(pageParam as { [key: string]: string | number }),
      );

      trackSiteSearch({
        keyword: JSON.stringify(pageParam),
        category: 'Search and filter query',
        resultsCount: response.total,
      });

      // Transform each resource in the response to normalize image urls
      return {
        ...response,
        data: response.data.map(transformRecreationResourceBase),
      };
    } catch (error) {
      console.error('Failed to fetch recreation resources:', error);
      throw error;
    }
  };

  /**
   * Transforms the infinite query data to include additional metadata
   * Provides total count and current page as additional information
   */
  const select = (
    data: InfiniteData<
      PaginatedRecreationResourceDto,
      SearchRecreationResourcesRequest
    >,
  ) => {
    return {
      pages: data.pages,
      pageParams: data.pageParams,
      totalCount: data.pages?.[0]?.total ?? 0,
      currentPage:
        data.pageParams[data.pageParams.length - 1]?.page ?? DEFAULT_PAGE,
      filters: data.pages?.[0]?.filters ?? [],
      recResourceIds: data.pages?.[0]?.recResourceIds ?? [],
      extent: data.pages?.[0]?.extent ?? null,
    };
  };

  return useInfiniteQuery({
    queryKey: ['recreationResources', params],
    initialPageParam: params,
    getPreviousPageParam,
    getNextPageParam,
    queryFn,
    select,
    placeholderData: (previousData) => previousData,
  });
};
