import { useMutation } from "@tanstack/react-query";
import { useRecreationResourceAdminApiClient } from "./useRecreationResourceAdminApiClient";
import { RecreationResourceApi } from "../../recreation-resource-admin/apis/RecreationResourceApi";
import { createRetryHandler } from "./helpers";

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
