import { Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import FilterGroup from '@/components/search/filters/FilterGroup';
import { Filter } from '@/components/search/types';
import '@/components/search/filters/Filters.scss';

interface FilterGroupMobileProps {
  label: string;
  param: string;
  options: Filter[];
  isOpen: boolean;
  onOpen: (param: string) => void;
  tabIndex: number;
}
const FilterGroupMobile = ({
  label,
  param,
  options,
  isOpen,
  onOpen,
  tabIndex,
}: FilterGroupMobileProps) => {
  return (
    <div key={label} className="mobile-filter-options">
      <div
        className="mobile-filter-option-label pointer p-3"
        onClick={() => {
          console.log('onOpen', param);
          onOpen(param);
        }}
        tabIndex={tabIndex}
        role="button"
        onKeyDown={() => {
          onOpen(param);
        }}
      >
        <div>{label}</div>
        {isOpen ? (
          <FontAwesomeIcon
            aria-label="Close filter group"
            data-testid="close-filter-group"
            icon={faChevronUp}
          />
        ) : (
          <FontAwesomeIcon
            aria-label="Open filter group"
            data-testid="open-filter-group"
            icon={faChevronDown}
          />
        )}
      </div>

      <Collapse in={isOpen} className="p-3">
        <div>
          <FilterGroup options={options} param={param} showMoreBtn={false} />
        </div>
      </Collapse>
    </div>
  );
};

export default FilterGroupMobile;
