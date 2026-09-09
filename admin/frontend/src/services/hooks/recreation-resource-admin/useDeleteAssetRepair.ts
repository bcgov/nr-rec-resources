import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAssetsApiClient } from './useAssetsApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

interface DeleteAssetRepairVariables {
  repairId: number;
  recResourceId: string;
}

export function useDeleteAssetRepair() {
  const apiClient = useAssetsApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ repairId }: DeleteAssetRepairVariables) =>
      apiClient.deleteAssetRepair({ repairId }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets(
          variables.recResourceId,
        ),
      });
    },
  });
}
