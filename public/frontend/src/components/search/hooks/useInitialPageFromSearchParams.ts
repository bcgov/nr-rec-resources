import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { getFilterState, haveFiltersChanged } from './helpers';

/**
 * Custom hook to manage pagination state with URL search parameters.
 * Automatically resets page to 1 when any search parameters change.
 *
 * @returns {number} The current page number from URL params or default of 1
 */
export const useInitialPageFromSearchParams = (): number => {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/search/' });
  const [initialPage, setInitialPage] = useState(() =>
    Number(searchParams.page ?? 1),
  );

  const [prevState, setPrevState] = useState(getFilterState(searchParams));

  // Track previous filter states to detect changes
  useEffect(() => {
    const currentState = getFilterState(searchParams);

    if (haveFiltersChanged(currentState, prevState)) {
      navigate({
        search: (prev: any) => ({
          ...prev,
          page: 1,
        }),
      } as any);
      setInitialPage(1);
      setPrevState(currentState);
    }
    // eslint-disable-next-line
  }, [searchParams, navigate]);

  return initialPage;
};
