import {
  RecreationFeeDto,
  RecreationFeeUIModel,
  RecreationResourcesApi,
  ResponseError,
  createRetryHandler,
  useRecreationResourceAdminApiClient,
} from '@/services';
import { addErrorNotification } from '@/store/notificationStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export interface DeleteFeeRequest {
  recResourceId: string;
  feeId: number;
}

export function useDeleteFee() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;
  const queryClient = useQueryClient();

  return useMutation<RecreationFeeDto, ResponseError, DeleteFeeRequest>({
    mutationFn: async ({ recResourceId, feeId }) => {
      return await (api as any).deleteRecreationResourceFee({
        recResourceId,
        feeId,
      });
    },
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to delete fee after multiple attempts. Please try again later.',
          'deleteFee-error',
        ),
    }),
    onSuccess: (_, variables) => {
      const queryKey = RECREATION_RESOURCE_QUERY_KEYS.fees(
        variables.recResourceId,
      );

      queryClient.setQueryData<RecreationFeeUIModel[] | undefined>(
        queryKey,
        (old) => old?.filter((fee) => fee.fee_id !== variables.feeId) ?? [],
      );
    },
    onError: (error) => {
      if (error.response?.status === 404) {
        addErrorNotification('Fee not found', 'deleteFee-notfound');
      }
    },
  });
}
