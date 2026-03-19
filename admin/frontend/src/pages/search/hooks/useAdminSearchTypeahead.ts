import { useState } from 'react';
import {
  isValidRecreationResourceSearchTerm,
  useGetRecreationResourceSuggestions,
} from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceSuggestions';
import {
  readAdminSearchDraftQuery,
  writeAdminSearchDraftQuery,
} from '@/pages/search/utils/storage';

export function useAdminSearchTypeahead(committedQuery: string) {
  const [inputValue, setInputValue] = useState(
    () => committedQuery || readAdminSearchDraftQuery(),
  );

  const updateInputValue = (value: string) => {
    setInputValue(value);
    writeAdminSearchDraftQuery(value);
  };

  const suggestionsQuery = useGetRecreationResourceSuggestions(inputValue);

  return {
    inputValue,
    setInputValue: updateInputValue,
    suggestions: suggestionsQuery.data.suggestions,
    isLoading: suggestionsQuery.isFetching,
    error: suggestionsQuery.error,
    isValidSearchTerm: isValidRecreationResourceSearchTerm(inputValue),
  };
}
