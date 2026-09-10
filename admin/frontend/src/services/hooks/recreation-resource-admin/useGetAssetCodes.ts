import { ResponseError } from '@/services/recreation-resource-admin';
import { useAssetsApiClient } from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import type { AssetCode } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryOptions, useQuery } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export const useGetAssetCodes = (
  queryOptions: QueryOptions<AssetCode[], ResponseError> = {},
) => {
  const assetsApiClient = useAssetsApiClient();

  return useQuery<AssetCode[], ResponseError>({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.assetCodes(),
    initialData: [],
    queryFn: async () => {
      const codes =
        await assetsApiClient.recreationAssetControllerFindAllAssetCodes();

      return codes.map((code) => ({
        asset_code: code.asset_code,
        description: code.description,
        has_length: code.has_length,
        has_width: code.has_width,
        has_area: code.has_area,
        default_value:
          code.default_value == null ? null : Number(code.default_value),
      }));
    },
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to load asset codes after multiple attempts. Please try again later.',
          'getAssetCodes-error',
        ),
    }),
    ...queryOptions,
  });
};
