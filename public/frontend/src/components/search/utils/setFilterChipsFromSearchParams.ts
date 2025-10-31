import { SearchResultsStore } from '@/store/searchResults';
import { FilterChip } from '@/components/search/types';
import filterChipStore from '@/store/filterChips';

// Util to set filter chips from search params on initial page load
const setFilterChipsFromSearchParams = (
  filterChips: FilterChip[],
  searchResults: SearchResultsStore,
  searchParams: Record<string, any>,
) => {
  const isFilterChips = filterChips.length > 0;
  if (isFilterChips) return;

  const { filters } = searchResults;
  const filterChipList: FilterChip[] = [];

  const filterParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([key]) => !['filter', 'page'].includes(key),
    ),
  );

  if (Object.keys(filterParams).length === 0) return;

  filters.forEach((filterGroup) => {
    const groupParam = filterGroup.param;
    const groupValues = filterParams[groupParam]
      ? String(filterParams[groupParam]).split('_')
      : [];

    filterGroup.options.forEach((option) => {
      if (groupValues?.includes(String(option.id))) {
        filterChipList.push({
          param: groupParam,
          id: String(option.id),
          label: option.description,
        });
      }
    });
  });

  filterChipStore.setState(() => [...filterChipList]);
};

export default setFilterChipsFromSearchParams;
