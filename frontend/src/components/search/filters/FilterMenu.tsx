import FilterGroup from '@/components/search/filters/FilterGroup';
import { FilterMenuContent } from '@/components/search/types';
import '@/components/search/filters/Filters.scss';

interface FilterMenuProps {
  menuContent: FilterMenuContent[];
}

const FilterMenu = ({ menuContent }: FilterMenuProps) => {
  return (
    <nav className="filter-menu-container">
      <span className="filter-menu-title">Filter</span>
      <div className="filter-menu">
        {menuContent?.map((group) => {
          const { label, options, param } = group;
          return (
            <FilterGroup
              key={label}
              label={label}
              options={options}
              param={param}
            />
          );
        })}
      </div>
    </nav>
  );
};

export default FilterMenu;
