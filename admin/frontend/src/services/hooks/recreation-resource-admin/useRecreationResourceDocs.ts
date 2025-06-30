import { useRecreationResourceAdminApiClient } from "@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient";
import { useQuery } from "@tanstack/react-query";
import {
  RecreationResourceDocDto,
  ResponseError,
} from "@/services/recreation-resource-admin";

export const useGetRecreationResourceDocs = (recResourceId: string) => {
  const recreationResourceAdminApiClient =
    useRecreationResourceAdminApiClient();

  return useQuery<RecreationResourceDocDto[], ResponseError>({
    queryKey: ["getAllDocumentResources", recResourceId],
    initialData: [],
    queryFn: () =>
      recreationResourceAdminApiClient.getAllDocumentResources({ recResourceId }),
    retry: (_, error) => {
      const { status } = error.response;
      return status >= 500 && status < 600;
    },
  });
};
