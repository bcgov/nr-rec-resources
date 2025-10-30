import {
  RecreationResourceDetailUIModel,
  RecreationResourcesApi,
  UpdateRecreationResourceDto,
} from '@/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mapRecreationResourceDetail } from './helpers';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

export interface UpdateRecreationResourceRequest {
  recResourceId: string;
  updateRecreationResourceDto: UpdateRecreationResourceDto;
}

export function useUpdateRecreationResource() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;
  const queryClient = useQueryClient();

  return useMutation<
    RecreationResourceDetailUIModel,
    Error,
    UpdateRecreationResourceRequest
  >({
    mutationFn: async ({ recResourceId, updateRecreationResourceDto }) => {
      const response = await api.updateRecreationResourceById({
        recResourceId,
        updateRecreationResourceDto,
      });
      return mapRecreationResourceDetail(response);
    },
    onSuccess: (data, variables) => {
      // Update the query cache
      queryClient.setQueryData(
        ['recreation-resource', variables.recResourceId],
        data,
      );
    },
  });
}
