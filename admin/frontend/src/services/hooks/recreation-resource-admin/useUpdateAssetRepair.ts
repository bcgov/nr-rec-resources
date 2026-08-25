import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAssetsApiClient } from './useAssetsApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import type { UpdateRecreationAssetRepairDto } from '@/services/recreation-resource-admin';

interface UpdateAssetRepairVariables {
  repairId: number;
  recResourceId: string;
  dto: UpdateRecreationAssetRepairDto;
}

export function useUpdateAssetRepair() {
  const apiClient = useAssetsApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ repairId, dto }: UpdateAssetRepairVariables) =>
      apiClient.updateAssetRepair({
        repairId,
        updateRecreationAssetRepairDto: dto,
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

