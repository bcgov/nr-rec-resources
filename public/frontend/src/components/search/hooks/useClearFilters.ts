import { useCallback } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { filterChipStore } from '@/store';

const PRESERVED_SEARCH_PARAMS = ['page', 'filter', 'view', 'base_layer'];

export const useClearFilters = () => {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/search/' });

  const clearFilters = useCallback(() => {
    const newSearchParams: Record<string, string> = {};

    PRESERVED_SEARCH_PARAMS.forEach((key) => {
      const value = searchParams[key as keyof typeof searchParams];
      if (value) {
        newSearchParams[key] = String(value);
      }
    });

    navigate({
      search: () => newSearchParams,
    });
    filterChipStore.setState(() => []);
  }, [searchParams, navigate]);

  return clearFilters;
};
