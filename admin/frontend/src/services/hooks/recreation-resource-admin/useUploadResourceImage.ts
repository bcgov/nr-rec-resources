import { createRetryHandler } from "@/services/hooks/recreation-resource-admin/helpers";
import { useMutation } from "@tanstack/react-query";
import { useRecreationResourceAdminApiClient } from "./useRecreationResourceAdminApiClient";

export interface UploadResourceImageParams {
  recResourceId: string;
  file: File;
  caption: string;
}

/**
 * Hook to upload an image to a recreation resource.
 */
export function useUploadResourceImage() {
  const apiClient = useRecreationResourceAdminApiClient();

  return useMutation({
    mutationFn: async ({
      recResourceId,
      file,
      caption,
    }: UploadResourceImageParams) => {
      return await apiClient.createRecreationresourceImage({
        recResourceId,
        caption,
        file,
      });
    },
    retry: createRetryHandler(),
  });
}
