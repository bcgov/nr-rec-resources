import { filterChipStore } from '@/store';
import { useStore } from '@tanstack/react-store';
import { useClearFilters } from '@/components/search/hooks/useClearFilters';
import FilterChip from '@/components/search/filters/FilterChip';
import '@/components/search/filters/Filters.scss';

const FilterChips = () => {
  const clearFilters = useClearFilters();

  const filterChips = useStore(filterChipStore);
  const isFilters = filterChips.length > 0;

  return (
    <div className="filter-chips-container">
      {filterChips.map((filterChip) => {
        const { id, label, param } = filterChip;
        return <FilterChip key={id} param={param} id={id} label={label} />;
      })}
      {isFilters && (
        <button
          type="button"
          className="btn-link clear-filters-btn-desktop"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default FilterChips;
