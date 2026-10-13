import {
  PartnersApi,
  ResponseError,
  usePartnersApiClient,
  ClientLocationDto,
} from '@/services';
import { addErrorNotification } from '@/store/notificationStore';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';

export const useGetPartnerByClientId = (
  mutationOptions: UseMutationOptions<
    ClientLocationDto,
    ResponseError,
    { clientId: string; locationNumber: string }
  > = {},
) => {
  const api = usePartnersApiClient() as PartnersApi;

  return useMutation<
    ClientLocationDto,
    ResponseError,
    { clientId: string; locationNumber: string }
  >({
    mutationFn: async ({ clientId, locationNumber }) => {
      return await (api as any).searchPartnerByClientId({
        clientId,
        locationNumber,
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
  });
};
