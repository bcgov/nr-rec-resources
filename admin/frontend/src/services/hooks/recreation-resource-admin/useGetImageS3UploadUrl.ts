import { RecreationResourceApi } from "@/services/recreation-resource-admin";
import { useMutation } from "@tanstack/react-query";
import { createRetryHandler } from "./helpers";
import { useRecreationResourceAdminApiClient } from "./useRecreationResourceAdminApiClient";

export interface GetImageS3UploadUrlParams {
  recResourceId: string;
  fileName: string;
  fileSize: number;
  contentType?: string;
}

export function useGetImageS3UploadUrl() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourceApi;

  return useMutation({
    mutationFn: async (params: GetImageS3UploadUrlParams) => {
      return api.getImageS3UploadUrl({
        recResourceId: params.recResourceId,
        presignedUploadRequestDto: {
          recResourceId: params.recResourceId,
          fileName: params.fileName,
          fileSize: params.fileSize,
          contentType: params.contentType,
        },
      });
    },
    retry: createRetryHandler(),
  });
}
