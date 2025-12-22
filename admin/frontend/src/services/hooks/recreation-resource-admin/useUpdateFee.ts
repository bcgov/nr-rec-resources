import {
  RecreationFeeDto,
  RecreationFeeUIModel,
  RecreationResourcesApi,
  ResponseError,
  createRetryHandler,
  useRecreationResourceAdminApiClient,
} from '@/services';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { mapRecreationFee } from './helpers';

export interface UpdateFeeRequest {
  recResourceId: string;
  feeId: number;
  recreation_fee_code?: string;
  fee_amount?: number | null;
  fee_start_date?: string | null;
  fee_end_date?: string | null;
  monday_ind?: string;
  tuesday_ind?: string;
  wednesday_ind?: string;
  thursday_ind?: string;
  friday_ind?: string;
  saturday_ind?: string;
  sunday_ind?: string;
}

export function useUpdateFee() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;
  const queryClient = useQueryClient();

  return useMutation<RecreationFeeDto, ResponseError, UpdateFeeRequest>({
    mutationFn: async (request) => {
      const { recResourceId, feeId, ...feeData } = request;

      // After regenerating the admin SDK, this call will map to:
      // PUT /api/v1/recreation-resources/{rec_resource_id}/fees/{fee_id}
      return await (api as any).updateRecreationResourceFee({
        recResourceId,
        feeId,
        updateRecreationFeeDto: feeData,
      });
    },
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to update fee after multiple attempts. Please try again later.',
          'updateFee-error',
        ),
    }),
    onSuccess: (data, variables) => {
      addSuccessNotification('Fee updated successfully', 'updateFee-success');

      const queryKey = RECREATION_RESOURCE_QUERY_KEYS.fees(
        variables.recResourceId,
      );
      const uiFee = mapRecreationFee(data);

      queryClient.setQueryData<RecreationFeeUIModel[] | undefined>(
        queryKey,
        (old) => {
          if (!old) return [uiFee];
          const idx = old.findIndex((f) => f.fee_id === uiFee.fee_id);
          if (idx === -1) return [...old, uiFee];
          const next = [...old];
          next[idx] = uiFee;
          return next;
        },
      );
    },
    onError: (error) => {
      const statusCode = error.response?.status;
      if (statusCode === 409) {
        addErrorNotification(
          'This fee type already exists for this resource',
          'updateFee-conflict',
        );
      } else if (statusCode === 404) {
        addErrorNotification('Fee not found', 'updateFee-notfound');
      }
    },
  });
}
