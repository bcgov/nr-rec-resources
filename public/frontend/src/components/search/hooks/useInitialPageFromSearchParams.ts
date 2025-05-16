import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFilterState, haveFiltersChanged } from './helpers';

/**
 * Custom hook to manage pagination state with URL search parameters.
 * Automatically resets page to 1 when any search parameters change.
 *
 * @returns {number} The current page number from URL params or default of 1
 */
export const useInitialPageFromSearchParams = (): number => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialPage, setInitialPage] = useState(() =>
    Number(searchParams.get('page') ?? 1),
  );

  const [prevState, setPrevState] = useState(getFilterState(searchParams));

  // Track previous filter states to detect changes
  useEffect(() => {
    const currentState = getFilterState(searchParams);

    if (haveFiltersChanged(currentState, prevState)) {
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev),
        page: '1',
      }));
      setInitialPage(1);
      setPrevState(currentState);
    }
  }, [searchParams, setSearchParams]);

  return initialPage;
};
