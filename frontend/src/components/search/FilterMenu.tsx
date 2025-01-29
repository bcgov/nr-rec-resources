import FilterGroup from '@/components/search/FilterGroup';
import { Filter } from '@/components/search/types';
import '@/components/search/Filters.scss';

interface FilterMenuProps {
  menuContent: {
    title: string;
    filters: Filter[];
    param: string; // Name of the query parameter
  }[];
}

const FilterMenu = ({ menuContent }: FilterMenuProps) => {
  return (
    <nav className="filter-menu-container">
      <span className="filter-menu-title">Filter</span>
      <div className="filter-menu">
        {menuContent?.map((group) => {
          const { title, filters, param } = group;
          return (
            <FilterGroup
              key={title}
              title={title}
              filters={filters}
              param={param}
            />
          );
        })}
      </div>
    </nav>
  );
};

export default FilterMenu;
