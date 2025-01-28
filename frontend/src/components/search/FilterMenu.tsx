import FilterGroup from '@/components/search/FilterGroup';
import { Filter } from '@/components/search/types';
import '@/components/search/Filters.scss';

interface FilterMenuProps {
  menuContent: {
    category: string;
    filters: Filter[];
    param: string; // Name of the query parameter
  }[];
}

const FilterMenu = ({ menuContent }: FilterMenuProps) => {
  return (
    <div className="filter-menu-container">
      <span className="filter-menu-title">Filter</span>
      <div className="filter-menu">
        {menuContent?.map((group) => {
          const { category, filters, param } = group;
          return (
            <FilterGroup
              key={category}
              category={category}
              filters={filters}
              param={param}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FilterMenu;
