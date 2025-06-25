import { useRecreationResourceAdminApiClient } from "@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient";
import { useQuery } from "@tanstack/react-query";
import {
  ResponseError,
  SuggestionsResponseDto,
} from "@/services/recreation-resource-admin";

export function isValidRecreationResourceSearchTerm(
  searchTerm: unknown,
): boolean {
  return (
    typeof searchTerm === "string" &&
    Boolean(searchTerm) &&
    searchTerm.trim().length >= 3
  );
}

export const useGetRecreationResourceSuggestions = (searchTerm: string) => {
  const recreationResourceAdminApiClient =
    useRecreationResourceAdminApiClient();

  return useQuery<SuggestionsResponseDto, ResponseError>({
    queryKey: ["recreationResourceSuggestions", searchTerm],
    initialData: { total: 0, suggestions: [] },
    queryFn: () =>
      recreationResourceAdminApiClient.getRecreationResourceSuggestions({
        searchTerm,
      }),
    enabled: isValidRecreationResourceSearchTerm(searchTerm),
    retry: (_, error) => {
      const { status } = error.response;
      return status >= 500 && status < 600;
    },
  });
};
