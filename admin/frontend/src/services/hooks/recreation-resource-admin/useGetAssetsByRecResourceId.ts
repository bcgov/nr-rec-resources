import { ResponseError } from '@/services/recreation-resource-admin';
import { useAssetsApiClient } from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import type { Asset } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryOptions, useQuery } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

const ASSETS_PAGE_LIMIT = 50;

export const useGetAssetsByRecResourceId = (
  recResourceId?: string,
  queryOptions: QueryOptions<Asset[], ResponseError> = {},
) => {
  const assetsApiClient = useAssetsApiClient();

  return useQuery<Asset[], ResponseError>({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets(recResourceId!),
    initialData: [],
    queryFn: async () => {
      const assets: Asset[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const paginated = await assetsApiClient.getPaginatedRecreationAssets({
          recResourceId: recResourceId!,
          page,
          limit: ASSETS_PAGE_LIMIT,
          includeRepair: true,
        });
        assets.push(...(paginated.data as Asset[]));
        totalPages = paginated.totalPages;
        page++;
      } while (page <= totalPages);

      return assets;
    },
    enabled: Boolean(recResourceId),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to load assets after multiple attempts. Please try again later.',
          'getAssetsByRecResourceId-error',
        ),
    }),
    ...queryOptions,
  });
};
