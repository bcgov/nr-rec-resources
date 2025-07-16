import { useMutation } from "@tanstack/react-query";
import { useRecreationResourceAdminApiClient } from "./useRecreationResourceAdminApiClient";
import { RecreationResourceApi } from "../../recreation-resource-admin/apis/RecreationResourceApi";
import { createRetryHandler } from "./helpers";

export interface DeleteResourceDocumentParams {
  recResourceId: string;
  refId: string;
}

export function useDeleteResourceDocument() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourceApi;

  return useMutation({
    mutationFn: async (params: DeleteResourceDocumentParams) => {
      return api.deleteDocumentResource(params);
    },
    retry: createRetryHandler(),
  });
}
