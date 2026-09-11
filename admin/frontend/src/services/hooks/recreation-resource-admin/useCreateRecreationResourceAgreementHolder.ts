import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { createRetryHandler } from './helpers';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import type { CreateAgreementHolderDto } from '@/services/recreation-resource-admin';
import { usePartnersApiClient } from './usePartnersApiClient';

export interface CreatePartnerRequest {
  recResourceId: string;
  partner: CreateAgreementHolderDto;
}

export function useCreateRecreationResourceAgreementHolder() {
  const partnersApiClient = usePartnersApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recResourceId, partner }: CreatePartnerRequest) =>
      partnersApiClient.createRecreationResourceAgreementHolder({
        recResourceId: recResourceId,
        createAgreementHolderDto: partner,
      }),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to create partner after multiple attempts. Please try again later.',
          'createPartner-error',
        ),
    }),
    onSuccess: (_, variables) => {
      addSuccessNotification(
        `Partner created successfully`,
        'createPartner-success',
      );
      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.partners(
          variables.recResourceId,
        ),
      });
    },
    onError: () => {
      addErrorNotification(
        'Failed to create partner. Please try again.',
        'createPartner-error',
      );
    },
  });
}
