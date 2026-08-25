import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAssetsApiClient } from './useAssetsApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import type { CreateRecreationAssetRepairDto } from '@/services/recreation-resource-admin';

interface CreateAssetRepairVariables {
  assetId: number;
  recResourceId: string;
  dto: CreateRecreationAssetRepairDto;
}

export function useCreateAssetRepair() {
  const apiClient = useAssetsApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assetId, dto }: CreateAssetRepairVariables) =>
      apiClient.createAssetRepair({
        id: assetId,
        createRecreationAssetRepairDto: dto,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets(
          variables.recResourceId,
        ),
      });
    },
  });
}

