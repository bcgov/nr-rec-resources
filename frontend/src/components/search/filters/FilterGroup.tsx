import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import removeFilter from '@/utils/removeFilter';
import { Filter } from '@/components/search/types';
import '@/components/search/filters/Filters.scss';

interface FilterGroupProps {
  label?: string;
  options: Filter[];
  param: string;
  showMoreBtn?: boolean;
}

export const MAX_VISIBLE_OPTIONS = 5;

const FilterGroup = ({
  options,
  param,
  label,
  showMoreBtn = true,
}: FilterGroupProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAllOptions, setShowAllOptions] = useState(false);

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
        newSearchParams.set(param, updateFilters);
      }
      setSearchParams(newSearchParams);
    }
  };

  const filtersCount = options?.length;
  const isShowAllFilters =
    filtersCount > MAX_VISIBLE_OPTIONS && !showAllOptions && showMoreBtn;
  const optionList = isShowAllFilters
    ? options.slice(0, MAX_VISIBLE_OPTIONS)
    : options;
  const filterParamsArray = searchParams.get(param)?.split('_');
  const isShowMoreBtn = showMoreBtn && filtersCount > MAX_VISIBLE_OPTIONS;

  return (
    <div className="filter-group-container">
      <span className="filter-group-title">{label}</span>
      <Form.Group className="filter-options-container">
        {optionList?.map((option) => {
          const { count, description, id } = option;
          const isDefaultChecked = filterParamsArray?.includes(String(id));
          const isDisabled = count === 0;

          return (
            <Form.Check
              key={crypto.randomUUID()} // Using uuid as checkboxes weren't clearing on clear filters re-render
              type="checkbox"
              id={String(id)}
              disabled={isDisabled}
              defaultChecked={isDefaultChecked}
              label={`${description} (${count})`}
              onChange={handleChange}
            />
          );
        })}
      </Form.Group>
      {isShowMoreBtn && (
        <button
          className="show-all-link"
          onClick={() => setShowAllOptions(!showAllOptions)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowAllOptions(!showAllOptions);
            }
          }}
        >
          {showAllOptions ? (
            <>
              Show less
              <FontAwesomeIcon icon={faChevronUp} />
            </>
          ) : (
            <>
              Show all {filtersCount}
              <FontAwesomeIcon icon={faChevronDown} />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default FilterGroup;
