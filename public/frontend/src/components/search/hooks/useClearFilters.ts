import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { filterChipStore } from '@/store';

const PRESERVED_SEARCH_PARAMS = ['page', 'filter', 'view', 'base_layer'];

export const useClearFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const clearFilters = useCallback(() => {
    const newSearchParams = new URLSearchParams();

    PRESERVED_SEARCH_PARAMS.forEach((key) => {
      if (searchParams.has(key)) {
        newSearchParams.set(key, searchParams.get(key)!);
      }
    });

    setSearchParams(newSearchParams);
    filterChipStore.setState(() => []);
  }, [searchParams, setSearchParams]);

  return clearFilters;
};
