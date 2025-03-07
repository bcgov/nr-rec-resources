import { SearchResultsStore } from '@/store/searchResults';
import { FilterChip } from '@/components/search/types';
import filterChipStore from '@/store/filterChips';

const setFilterChipsFromSearchParams = (
  filterChips: FilterChip[],
  searchResults: SearchResultsStore,
  searchParams: URLSearchParams,
) => {
  const isFilterChips = filterChips.length > 0;
  if (isFilterChips) return;

  const { filters } = searchResults;
  const filterChipList: FilterChip[] = [];

  const filterParams = Object.fromEntries(
    [...searchParams].filter(([key]) => !['filter', 'page'].includes(key)),
  );

  if (Object.keys(filterParams).length === 0) return;

  console.log(filterParams);

  filters.forEach((filterGroup) => {
    const groupParam = filterGroup.param;
    const groupValues = filterParams[groupParam]?.split('_');

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
