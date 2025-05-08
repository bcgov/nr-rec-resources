import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useFilterHandler } from '@/components/search/hooks/useFilterHandler';
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
  const [searchParams] = useSearchParams();
  const [showAllOptions, setShowAllOptions] = useState(false);
  const { toggleFilter } = useFilterHandler();

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    label: string,
  ) => {
    const { id, checked } = event.target;
    toggleFilter({ param, id, label }, checked);
  };

  const focusCheckbox = (index: number) => {
    let foundFocus = false;
    while (!foundFocus) {
      if (options[index].count > 0) {
        options[index].hasFocus = true;
        foundFocus = true;
      } else {
        index++;
        if (index >= options.length) {
          foundFocus = true;
        }
      }
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
    <fieldset className="filter-group-container">
      <legend className="filter-group-title">{label}</legend>
      <Form.Group className="filter-options-container">
        {optionList?.map((option) => {
          const { count, description, id, hasFocus } = option;
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
              onChange={(e) => handleChange(e, description)}
              autoFocus={hasFocus}
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
              focusCheckbox(MAX_VISIBLE_OPTIONS);
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
    </fieldset>
  );
};

export default FilterGroup;
