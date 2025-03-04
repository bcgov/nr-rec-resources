import { filterChipStore } from '@/store';
import FilterChip from '@/components/search/filters/FilterChip';

const FilterChips = () => {
  const filterChips = filterChipStore.state;
  return (
    <div>
      {filterChips.map((filterChip) => {
        const { id, label, param } = filterChip;
        return <FilterChip key={id} param={param} id={id} label={label} />;
      })}
    </div>
  );
};

export default FilterChips;
