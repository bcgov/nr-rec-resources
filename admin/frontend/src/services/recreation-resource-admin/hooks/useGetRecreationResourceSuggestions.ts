import {
  ResponseError,
  SuggestionsResponseDto,
} from "@/services/recreation-resource-admin";
import { useRecreationResourceAdminApiClient } from "./useRecreationResourceAdminApiClient";
import { useQuery } from "@tanstack/react-query";
import { createRetryHandler } from "./helpers";

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
    retry: createRetryHandler(),
  });
};
