import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import removeFilter from '@/utils/removeFilter';
import { Filter } from '@/components/search/types';

import '@/components/search/Filters.scss';

interface FilterGroupProps {
  category: string;
  filters: Filter[];
  param: string;
}

const FilterGroup = ({ category, filters, param }: FilterGroupProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAllFilters, setShowAllFilters] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target;
    const newSearchParams = new URLSearchParams(searchParams.toString());
    // Remove the filter from the search params if it exists
    const updateFilters = removeFilter(id, param, newSearchParams);

    if (checked) {
      // Append the new filter to the existing filters if they exist
      newSearchParams.set(param, updateFilters ? `${updateFilters}_${id}` : id);
      setSearchParams(newSearchParams);
    } else {
      if (!updateFilters) {
        // Remove the param if there are no filters
        newSearchParams.delete(param);
      } else {
        // Update the param with the new filters
        newSearchParams.set(param, updateFilters);
      }
      setSearchParams(newSearchParams);
    }
  };

  const filtersCount = filters?.length + 1;
  const isShowAllFilters = filtersCount > 5 && !showAllFilters;
  const filterList = isShowAllFilters ? filters.slice(0, 5) : filters;
  const filterParamsArray = searchParams.get(param)?.split('_');

  return (
    <div className="filter-group-container">
      <span className="filter-group-title">{category}</span>
      <Form.Group className="filter-options-container">
        {filterList?.map((filter) => {
          const { count, description, id } = filter;
          const isDefaultChecked = filterParamsArray?.includes(String(id));

          return (
            <Form.Check
              key={id}
              type="checkbox"
              id={id}
              defaultChecked={isDefaultChecked}
              label={`${description} (${count})`}
              onChange={handleChange}
            />
          );
        })}
      </Form.Group>
      <button
        className="show-all-link"
        onClick={() => {
          setShowAllFilters(!showAllFilters);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowAllFilters(!showAllFilters);
          }
        }}
      >
        {showAllFilters ? (
          <>
            Show all {filtersCount}
            <FontAwesomeIcon icon={faChevronDown} />
          </>
        ) : (
          <>
            Show less
            <FontAwesomeIcon icon={faChevronUp} />
          </>
        )}
      </button>
    </div>
  );
};

export default FilterGroup;
