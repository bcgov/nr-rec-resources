import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAssetsApiClient } from './useAssetsApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import type { UpdateRecreationAssetDto } from '@/services/recreation-resource-admin';

interface UpdateAssetVariables {
  assetId: number;
  recResourceId: string;
  dto: UpdateRecreationAssetDto;
}

export function useUpdateAsset() {
  const api = useAssetsApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assetId, dto }: UpdateAssetVariables) =>
      api.updateRecreationAsset({ id: assetId, updateRecreationAssetDto: dto }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets(
          variables.recResourceId,
        ),
      });
    },
  });
}
