import FilterGroup, {
  MAX_VISIBLE_OPTIONS,
} from '@/components/search/filters/FilterGroup';
import searchResultsStore from '@/store/searchResults';
import '@/components/search/filters/Filters.scss';

const FilterMenu = () => {
  const menuContent = searchResultsStore.state.filters;

  return (
    <nav className="filter-menu-container">
      <div className="filter-menu-title">Filter</div>
      <div className="filter-menu">
        {menuContent?.map((group) => {
          const { label, options, param } = group;
          return (
            <FilterGroup
              key={label}
              label={label}
              options={options}
              param={param}
              showMoreBtn={options.length > MAX_VISIBLE_OPTIONS}
            />
          );
        })}
      </div>
    </nav>
  );
};

export default FilterMenu;
