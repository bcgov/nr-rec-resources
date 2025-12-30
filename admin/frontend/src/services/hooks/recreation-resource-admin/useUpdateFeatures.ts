import {
  RecreationFeatureDto,
  RecreationResourcesApi,
  ResponseError,
  createRetryHandler,
  useRecreationResourceAdminApiClient,
} from '@/services';
import { addErrorNotification } from '@/store/notificationStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export interface UpdateFeaturesRequest {
  recResourceId: string;
  feature_codes: string[];
}

export function useUpdateFeatures() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;
  const queryClient = useQueryClient();

  return useMutation<
    RecreationFeatureDto[],
    ResponseError,
    UpdateFeaturesRequest
  >({
    mutationFn: async ({ recResourceId, feature_codes }) => {
      const response = await api.updateFeatures({
        recResourceId,
        updateFeaturesDto: { feature_codes },
      });

      return response;
    },
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to update features after multiple attempts. Please try again later.',
          'updateFeatures-error',
        ),
    }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        RECREATION_RESOURCE_QUERY_KEYS.features(variables.recResourceId),
        data,
      );
      queryClient.invalidateQueries({
        queryKey: ['recreation-resource', variables.recResourceId],
      });
    },
  });
}
