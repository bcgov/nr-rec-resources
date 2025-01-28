import { Form } from 'react-bootstrap';
import { Filter } from '@/components/search/types';

import '@/components/search/Filters.scss';

interface FilterGroupProps {
  category: string;
  filters: Filter[];
  param: string;
}

const FilterGroup = ({ category, filters }: FilterGroupProps) => {
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
            />
          );
        })}
      </Form.Group>
    </div>
  );
};

export default FilterGroup;
