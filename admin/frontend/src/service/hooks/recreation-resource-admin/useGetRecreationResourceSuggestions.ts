import { useRecreationResourceAdminApiClient } from "@/service/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient";
import { useQuery } from "@tanstack/react-query";
import { ResponseError } from "@/service/recreation-resource-admin";

export const useGetRecreationResourceSuggestions = (searchTerm: string) => {
  const recreationResourceAdminApiClient =
    useRecreationResourceAdminApiClient();

  return useQuery({
    queryKey: ["recreationResourceSuggestions"],
    initialData: { total: 0, suggestions: [] },
    queryFn: async () => {
      return recreationResourceAdminApiClient.getRecreationResourceSuggestions({
        searchTerm,
      });
    },
    enabled: !!searchTerm,
    retry: (_, error) => {
      if (error instanceof ResponseError) {
        const { status } = error.response;
        return status >= 500 && status < 600;
      }
      return true;
    },
  });
};
