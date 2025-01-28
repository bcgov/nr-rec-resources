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
    const updateFilters = removeFilter(id, param, searchParams);
    if (checked) {
      setSearchParams({
        ...searchParams,
        [param]: updateFilters ? `${updateFilters}_${id}` : id,
      });
    } else {
      setSearchParams({
        ...searchParams,
        [param]: updateFilters,
      });
    }
    console.log(id, checked);
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
