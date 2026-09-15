import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PartnersApi,
  UpdateAgreementHolderDto,
  AgreementHolderClientPublicViewDto,
} from '@/services/recreation-resource-admin';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { usePartnersApiClient } from './usePartnersApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { createRetryHandler } from './helpers';

export interface UpdateAgreementHolderRequest {
  recResourceId: string;
  agreementHolderId: number;
  dto: UpdateAgreementHolderDto;
  /** Suppresses the success toast when several cards are saved together. */
  silent?: boolean;
}

export function useUpdateAgreementHolder() {
  const api: PartnersApi = usePartnersApiClient();
  const queryClient = useQueryClient();

  return useMutation<
    AgreementHolderClientPublicViewDto,
    Error,
    UpdateAgreementHolderRequest
  >({
    mutationFn: ({ recResourceId, agreementHolderId, dto }) =>
      api.updateRecreationResourceAgreementHolder({
        recResourceId,
        agreementHolderId,
        updateAgreementHolderDto: dto,
      }),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to update partner after multiple attempts. Please try again later.',
          'updateAgreementHolder-error',
        ),
    }),
    onSuccess: (_, variables) => {
      if (!variables.silent) {
        addSuccessNotification(
          'Partner updated successfully.',
          'updateAgreementHolder-success',
        );
      }
      void queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.partners(
          variables.recResourceId,
        ),
      });
    },
    onError: () => {
      addErrorNotification(
        'Failed to update partner.',
        'updateAgreementHolder-error',
      );
    },
  });
}
