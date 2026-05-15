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

export interface CreateFeeRequest {
  recResourceId: string;
  recreation_fee_code: string;
  fee_amount?: number;
  fee_start_date?: string;
  fee_end_date?: string;
  monday_ind?: string;
  tuesday_ind?: string;
  wednesday_ind?: string;
  thursday_ind?: string;
  friday_ind?: string;
  saturday_ind?: string;
  sunday_ind?: string;
  recurring_ind?: boolean;
  recurring_start_mmdd?: string;
  recurring_end_mmdd?: string;
}

export function useCreateFee() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;
  const queryClient = useQueryClient();

  return useMutation<RecreationFeeDto, ResponseError, CreateFeeRequest>({
    mutationFn: async (request) => {
      const { recResourceId, ...feeData } = request;

      return await (api as any).createRecreationResourceFee({
        recResourceId,
        createRecreationFeeDto: feeData,
      });
    },
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to create fee after multiple attempts. Please try again later.',
          'createFee-error',
        ),
    }),
    onSuccess: (data, variables) => {
      addSuccessNotification('Fee created successfully', 'createFee-success');

      // Update the fees query in-place by appending the newly created fee
      const queryKey = RECREATION_RESOURCE_QUERY_KEYS.fees(
        variables.recResourceId,
      );
      const uiFee = mapRecreationFee(data);
      queryClient.setQueryData<RecreationFeeUIModel[] | undefined>(
        queryKey,
        (old) => (old ? [...old, uiFee] : [uiFee]),
      );
    },
    onError: (error) => {
      const statusCode = error.response?.status;
      if (statusCode === 409) {
        addErrorNotification(
          'This fee type already exists for this resource',
          'createFee-conflict',
        );
      } else if (statusCode === 404) {
        addErrorNotification(
          'Resource or fee type not found',
          'createFee-notfound',
        );
      }
    },
  });
}
