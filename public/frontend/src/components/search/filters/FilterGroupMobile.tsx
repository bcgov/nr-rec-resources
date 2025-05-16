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
  const handleOpen = () => onOpen(param);
  return (
    <div key={label} className="mobile-filter-options">
      <button
        className="mobile-filter-option-label pointer p-3"
        onClick={handleOpen}
        tabIndex={tabIndex}
        onKeyDown={handleOpen}
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
      </button>

      <Collapse in={isOpen} className="p-3">
        <div>
          <FilterGroup options={options} param={param} showMoreBtn={false} />
        </div>
      </Collapse>
    </div>
  );
};

export default FilterGroupMobile;
