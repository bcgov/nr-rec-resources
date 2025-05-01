import { useSearchParams } from 'react-router-dom';
import removeFilter from '@/utils/removeFilter';
import { FilterChip } from '@/components/search/types';
import { filterChipStore } from '@/store';
import { trackSiteSearch } from '@/utils/matomo';

export const useFilterHandler = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const toggleFilter = (filterChip: FilterChip, isChecked?: boolean) => {
    const { id, label, param } = filterChip;
    const newSearchParams = new URLSearchParams(searchParams.toString());
    const updateFilters = removeFilter(id, param, newSearchParams);

    if (isChecked) {
      newSearchParams.set(param, updateFilters ? `${updateFilters}_${id}` : id);
      setSearchParams(newSearchParams);
      if (!filterChipStore.state?.some((filter) => filter.id === id)) {
        filterChipStore.setState((prevState) => [
          ...prevState,
          { param, id, label },
        ]);
      }
      trackSiteSearch({
        category: 'Filter toggle on',
        keyword: label,
      });
    } else {
      filterChipStore.setState((prevState) =>
        prevState.filter((filter) => filter.id !== id),
      );
      if (!updateFilters) {
        newSearchParams.delete(param);
      } else {
        newSearchParams.set(param, updateFilters);
      }
      setSearchParams(newSearchParams);
      trackSiteSearch({
        category: 'Filter toggle off',
        keyword: label,
      });
    }
  };

  return { toggleFilter };
};
