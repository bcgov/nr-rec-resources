import { useMutation } from "@tanstack/react-query";
import { useRecreationResourceAdminApiClient } from "./useRecreationResourceAdminApiClient";
import { RecreationResourceApi } from "../../recreation-resource-admin/apis/RecreationResourceApi";

export interface UploadResourceDocumentParams {
  recResourceId: string;
  file: File;
  title: string;
}

export function useUploadResourceDocument() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourceApi;

  return useMutation({
    mutationFn: async (params: UploadResourceDocumentParams) => {
      // todo: remove the error simulation after testing
      await new Promise((resolve) => setTimeout(resolve, 3000));
      if (params.title) {
        throw new Error("File is required for upload");
      }

      return api.createRecreationresourceDocument({
        recResourceId: params.recResourceId,
        title: params.title,
        file: params.file,
      });
    },
  });
}
