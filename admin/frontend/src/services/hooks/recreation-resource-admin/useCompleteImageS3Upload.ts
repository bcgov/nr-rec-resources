import { RecreationResourceApi } from "@/services/recreation-resource-admin";
import { useMutation } from "@tanstack/react-query";
import { createRetryHandler } from "./helpers";
import { useRecreationResourceAdminApiClient } from "./useRecreationResourceAdminApiClient";

export interface CompleteImageS3UploadParams {
  recResourceId: string;
  uploadId: string;
  title: string;
  originalFileName: string;
  fileSize: number;
}

export function useCompleteImageS3Upload() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourceApi;

  return useMutation({
    mutationFn: async (params: CompleteImageS3UploadParams) => {
      return api.completeImageS3Upload({
        recResourceId: params.recResourceId,
        completeUploadRequestDto: {
          uploadId: params.uploadId,
          title: params.title,
          originalFileName: params.originalFileName,
          fileSize: params.fileSize,
        },
      });
    },
    retry: createRetryHandler(),
  });
}
