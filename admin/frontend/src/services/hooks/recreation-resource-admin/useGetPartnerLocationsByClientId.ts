import {
  PartnersApi,
  ResponseError,
  usePartnersApiClient,
  ClientLocationDto,
} from '@/services';
import { addErrorNotification } from '@/store/notificationStore';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';

export const useGetPartnerLocations = (
  mutationOptions: UseMutationOptions<
    ClientLocationDto[],
    ResponseError,
    string
  > = {},
) => {
  const api = usePartnersApiClient() as PartnersApi;

  return useMutation<ClientLocationDto[], ResponseError, string>({
    mutationFn: async (clientId: string) => {
      return await (api as any).getPartnerLocationsByClientId({
        clientId,
      });
    },
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to load partner locations after multiple attempts. Please try again later.',
          'getPartnerLocations-error',
        ),
    }),
    ...mutationOptions,
  });
};
