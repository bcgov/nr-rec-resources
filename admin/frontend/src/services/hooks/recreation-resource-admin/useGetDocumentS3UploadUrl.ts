import { RecreationResourceApi } from "@/services/recreation-resource-admin";
import { useMutation } from "@tanstack/react-query";
import { createRetryHandler } from "./helpers";
import { useRecreationResourceAdminApiClient } from "./useRecreationResourceAdminApiClient";

export interface GetDocumentS3UploadUrlParams {
  recResourceId: string;
  fileName: string;
  fileSize: number;
  contentType?: string;
}

export function useGetDocumentS3UploadUrl() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourceApi;

  return useMutation({
    mutationFn: async (params: GetDocumentS3UploadUrlParams) => {
      return api.getDocumentS3UploadUrl({
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
