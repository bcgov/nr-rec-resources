import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { RecreationResourcesApi } from '@/services/recreation-resource-admin';

export function usePresignExhibitAUpload() {
  const api =
    useRecreationResourceAdminApiClient() as unknown as RecreationResourcesApi;

  return useMutation({
    mutationFn: (params: { recResourceId: string; fileName: string }) =>
      api.presignExhibitAUpload(params),
    retry: createRetryHandler(),
  });
}

export function useFinalizeExhibitAUpload() {
  const api =
    useRecreationResourceAdminApiClient() as unknown as RecreationResourcesApi;

  return useMutation({
    mutationFn: (params: {
      recResourceId: string;
      document_id: string;
      file_name: string;
      extension: string;
      file_size: number;
    }) => api.finalizeExhibitAUpload(params),
    retry: createRetryHandler(),
  });
}

export function useDeleteExhibitADoc() {
  const api =
    useRecreationResourceAdminApiClient() as unknown as RecreationResourcesApi;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { recResourceId: string; documentId: string }) =>
      api.deleteExhibitADoc(params),
    retry: createRetryHandler(),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.exhibitADocs(
          variables.recResourceId,
        ),
      });
    },
  });
}
