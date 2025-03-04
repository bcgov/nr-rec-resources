import { filterChipStore } from '@/store';
import FilterChip from '@/components/search/filters/FilterChip';

const FilterChips = () => {
  const filterChips = filterChipStore.state;
  return (
    <div>
      {filterChips.map((filterChip) => (
        <FilterChip
          key={filterChip.id}
          param={filterChip.param}
          id={filterChip.id}
          description={filterChip.label}
        />
      ))}
    </div>
  );
};

export default FilterChips;
