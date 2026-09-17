import {
  PartnersApi,
  ResponseError,
  usePartnersApiClient,
  AgreementHolderClientPublicViewDto,
} from '@/services';
import { addErrorNotification } from '@/store/notificationStore';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';

export const useGetPartnerByClientId = (
  mutationOptions: UseMutationOptions<
    AgreementHolderClientPublicViewDto,
    ResponseError,
    string
  > = {},
) => {
  const api = usePartnersApiClient() as PartnersApi;

  return useMutation<AgreementHolderClientPublicViewDto, ResponseError, string>(
    {
      mutationFn: async (clientId: string) => {
        return await (api as any).searchPartnerByClientId({
          clientId,
        });
      },
      retry: createRetryHandler({
        onFail: () =>
          addErrorNotification(
            'Failed to load partner information after multiple attempts. Please try again later.',
            'getPartnerByClientId-error',
          ),
      }),
      ...mutationOptions,
    },
  );
};
