import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PartnersApi } from '@/services/recreation-resource-admin';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { usePartnersApiClient } from './usePartnersApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { createRetryHandler } from './helpers';

export interface DeleteAgreementHolderRequest {
  recResourceId: string;
  agreementHolderId: number;
}

export function useDeleteAgreementHolder() {
  const api: PartnersApi = usePartnersApiClient();
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteAgreementHolderRequest>({
    mutationFn: ({ recResourceId, agreementHolderId }) =>
      api.deleteRecreationResourceAgreementHolder({
        recResourceId,
        agreementHolderId,
      }),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to delete partner after multiple attempts. Please try again later.',
          'deleteAgreementHolder-error',
        ),
    }),
    onSuccess: (_, variables) => {
      addSuccessNotification(
        'Partner deleted successfully.',
        'deleteAgreementHolder-success',
      );
      void queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.partners(
          variables.recResourceId,
        ),
      });
    },
    onError: () => {
      addErrorNotification(
        'Failed to delete partner.',
        'deleteAgreementHolder-error',
      );
    },
  });
}
