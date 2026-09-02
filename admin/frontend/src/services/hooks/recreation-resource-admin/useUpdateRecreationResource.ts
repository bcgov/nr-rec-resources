import {
  RecreationResourceDetailUIModel,
  RecreationResourcesApi,
  UpdateRecreationResourceDto,
} from '@/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mapRecreationResourceDetail } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
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
      // Keep the detail query in sync so "Last inspected" labels and summary cards refresh immediately.
      queryClient.setQueryData(
        RECREATION_RESOURCE_QUERY_KEYS.detail(variables.recResourceId),
        data,
      );
      // Also refetch to guarantee consistency with server-side transforms/normalization.
      void queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.detail(
          variables.recResourceId,
        ),
      });
    },
  });
}
