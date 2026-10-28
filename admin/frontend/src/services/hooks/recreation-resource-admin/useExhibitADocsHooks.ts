import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import {
  Configuration,
  RecreationResourcesApi,
  SncscApi,
} from '@/services/recreation-resource-admin';
import { useAuthContext } from '@/contexts/AuthContext';

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
      submission_id?: string;
      document_id: string;
      file_name: string;
      extension: string;
      file_size: number;
    }) => {
      const { recResourceId, ...dto } = params;
      return api.finalizeExhibitAUpload({
        recResourceId,
        finalizeExhibitAUploadRequestDto: dto,
      });
    },
    retry: createRetryHandler(),
  });
}

export function useCreateOrGetExhibitAByApplicationGuid() {
  const { authService } = useAuthContext();
  const basePath = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  const api = new SncscApi(
    new Configuration({
      basePath,
      accessToken: async () => {
        const token = await authService.getToken();
        return token ? `Bearer ${token}` : '';
      },
    }),
  );

  return useMutation({
    mutationFn: (params: {
      applicationGuid: string;
      userId: string;
      generate: boolean;
    }) =>
      api.createOrGetExhibitAByApplicationGuid({
        applicationGuid: params.applicationGuid,
        createExhibitAByApplicationGuidRequestDto: {
          generate: params.generate,
          userId: params.userId,
        },
      }),
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
