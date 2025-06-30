import { useRecreationResourceAdminApiClient } from "@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient";
import { QueryOptions, useQuery } from "@tanstack/react-query";
import {
  RecreationResourceDocDto,
  ResponseError,
} from "@/services/recreation-resource-admin";
import { addErrorNotification } from "@/store/notificationStore";
import { transformRecreationResourceDocs, createRetryHandler } from "./helpers";

export const useGetDocumentsByRecResourceId = (
  recResourceId: string,
  queryOptions: QueryOptions<RecreationResourceDocDto[], ResponseError> = {},
) => {
  const recreationResourceAdminApiClient =
    useRecreationResourceAdminApiClient();

  return useQuery<RecreationResourceDocDto[], ResponseError>({
    queryKey: ["getDocumentsByRecResourceId", recResourceId],
    initialData: [],
    queryFn: async () => {
      const docs =
        await recreationResourceAdminApiClient.getDocumentsByRecResourceId({
          recResourceId,
        });
      return transformRecreationResourceDocs(docs);
    },
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          "Failed to load documents after multiple attempts. Please try again later.",
          "getDocumentsByRecResourceId-error",
        ),
    }),
    ...queryOptions,
  });
};
