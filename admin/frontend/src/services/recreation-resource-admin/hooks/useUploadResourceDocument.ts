import { RecreationResourceApi } from "@/services/recreation-resource-admin";
import { useMutation } from "@tanstack/react-query";
import { createRetryHandler } from "./helpers";
import { useRecreationResourceAdminApiClient } from "./useRecreationResourceAdminApiClient";

export interface UploadResourceDocumentParams {
  recResourceId: string;
  file: File;
  title: string;
}

export function useUploadResourceDocument() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourceApi;

  return useMutation({
    mutationFn: async (params: UploadResourceDocumentParams) => {
      return api.createRecreationresourceDocument(params);
    },
    retry: createRetryHandler(),
  });
}
