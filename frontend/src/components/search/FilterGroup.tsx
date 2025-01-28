import { useSearchParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';
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
  return (
    <div className="filter-group-container">
      <span className="filter-group-title">{category}</span>
      <Form.Group className="filter-options-container">
        {filters?.map((filter) => {
          const { count, description, id } = filter;
          return (
            <Form.Check
              key={id}
              type="checkbox"
              id={id}
              label={`${description} (${count})`}
              onChange={handleChange}
            />
          );
        })}
      </Form.Group>
    </div>
  );
};

export default FilterGroup;
