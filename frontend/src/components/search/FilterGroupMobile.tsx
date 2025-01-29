import { Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import FilterGroup from '@/components/search/FilterGroup';
import { Filter } from '@/components/search/types';
import '@/components/search/Filters.scss';

interface FilterGroupMobileProps {
  title: string;
  param: string;
  filters: Filter[];
  isOpen: boolean;
  onOpen: (param: string) => void;
  tabIndex: number;
}
const FilterGroupMobile = ({
  title,
  param,
  filters,
  isOpen,
  onOpen,
  tabIndex,
}: FilterGroupMobileProps) => {
  return (
    <div key={title} className="park-filter-options">
      <div
        className="park-filter-option-label pointer p-3"
        onClick={() => {
          onOpen(param);
        }}
        tabIndex={tabIndex}
        role="button"
        onKeyDown={() => {
          onOpen(param);
        }}
      >
        <div className="park-select-label">{title}</div>
        {isOpen ? (
          <FontAwesomeIcon icon={faChevronUp} />
        ) : (
          <FontAwesomeIcon icon={faChevronDown} />
        )}
      </div>

      <Collapse in={isOpen} className="p-3">
        <div>
          <FilterGroup filters={filters} param={param} showMoreBtn={false} />
        </div>
      </Collapse>
    </div>
  );
};

export default FilterGroupMobile;
