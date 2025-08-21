import { useMutation } from "@tanstack/react-query";
import { createRetryHandler } from "./helpers";
import { useRecreationResourceAdminApiClient } from "./useRecreationResourceAdminApiClient";

export interface DeleteResourceDocumentParams {
  recResourceId: string;
  refId: string;
}

export function useDeleteResourceDocument() {
  const api = useRecreationResourceAdminApiClient();

  return useMutation({
    mutationFn: (params: DeleteResourceDocumentParams) => {
      return api.deleteDocumentResource(params);
    },
    retry: createRetryHandler(),
  });
}
