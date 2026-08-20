import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAssetsApiClient } from './useAssetsApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import type { UpdateRecreationAssetRepairDto } from '@/services/recreation-resource-admin';

interface UpdateRepairVariables {
  repairId: number;
  recResourceId: string;
  dto: UpdateRecreationAssetRepairDto;
}

export function useUpdateRepair() {
  const api = useAssetsApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ repairId, dto }: UpdateRepairVariables) =>
      api.updateAssetRepair({
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
