import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAssetsApiClient } from './useAssetsApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';

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
      addSuccessNotification(
        'Repair deleted successfully.',
        'deleteRepair-success',
      );
      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets(
          variables.recResourceId,
        ),
      });
    },
    onError: () => {
      addErrorNotification('Failed to delete repair.', 'deleteRepair-error');
    },
  });
}
