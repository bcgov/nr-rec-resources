import { useEffect, useState } from 'react';
import {
  isValidRecreationResourceSearchTerm,
  useGetRecreationResourceSuggestions,
} from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceSuggestions';
import {
  readAdminSearchDraftQuery,
  writeAdminSearchDraftQuery,
} from '@/pages/search/utils/storage';

export function useAdminSearchTypeahead(committedQuery: string) {
  const [inputValue, setInputValueState] = useState(
    () => committedQuery || readAdminSearchDraftQuery(),
  );

  useEffect(() => {
    const nextValue = committedQuery || readAdminSearchDraftQuery();
    setInputValueState(nextValue);
    writeAdminSearchDraftQuery(nextValue);
  }, [committedQuery]);

  const setInputValue = (value: string) => {
    setInputValueState(value);
    writeAdminSearchDraftQuery(value);
  };

  const suggestionsQuery = useGetRecreationResourceSuggestions(inputValue);

  return {
    inputValue,
    setInputValue,
    suggestions: suggestionsQuery.data.suggestions,
    isLoading: suggestionsQuery.isFetching,
    error: suggestionsQuery.error,
    isValidSearchTerm: isValidRecreationResourceSearchTerm(inputValue),
  };
}
