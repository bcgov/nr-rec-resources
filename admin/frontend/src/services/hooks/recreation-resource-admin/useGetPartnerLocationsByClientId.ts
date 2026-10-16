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
    ClientLocationDto[] | ClientLocationDto,
    ResponseError,
    { clientId: string; locationId?: string }
  > = {},
) => {
  const api: PartnersApi = usePartnersApiClient();

  return useMutation<
    ClientLocationDto[] | ClientLocationDto,
    ResponseError,
    { clientId: string; locationId?: string }
  >({
    mutationFn: async ({ clientId, locationId }) => {
      // If locationId is provided, search for specific location
      if (locationId) {
        return await api.searchPartnerByClientId({
          clientId,
          locationNumber: locationId,
        });
      }
      // Otherwise, get all locations for the client
      return await api.getPartnerLocationsByClientId({
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
