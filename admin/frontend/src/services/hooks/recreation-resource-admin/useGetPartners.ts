import {
  PartnersApi,
  ResponseError,
  usePartnersApiClient,
  AgreementHolderClientPublicViewDto,
} from '@/services';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryOptions, useQuery } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export const useGetPartners = (
  recResourceId?: string,
  queryOptions: QueryOptions<
    AgreementHolderClientPublicViewDto[],
    ResponseError
  > = {},
) => {
  const api = usePartnersApiClient() as PartnersApi;

  return useQuery<AgreementHolderClientPublicViewDto[], ResponseError>({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.partners(recResourceId!),
    initialData: [],
    queryFn: async () => {
      return await (api as any).getRecreationPartnersByResourceId({
        recResourceId: recResourceId!,
      });
    },
    enabled: Boolean(recResourceId),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to load partners after multiple attempts. Please try again later.',
          'getPartners-error',
        ),
    }),
    ...queryOptions,
  });
};
