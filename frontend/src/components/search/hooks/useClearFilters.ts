import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { filterChipStore } from '@/store';

const useClearFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const clearFilters = useCallback(() => {
    const newSearchParams = new URLSearchParams();

    ['page', 'filter'].forEach((key) => {
      if (searchParams.has(key)) {
        newSearchParams.set(key, searchParams.get(key)!);
      }
    });

    setSearchParams(newSearchParams);
    filterChipStore.setState(() => []);
  }, [searchParams, setSearchParams]);

  return clearFilters;
};

export default useClearFilters;
