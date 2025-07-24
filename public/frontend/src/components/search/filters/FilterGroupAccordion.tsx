import { Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import '@/components/search/filters/Filters.scss';

interface FilterGroupAccordionProps {
  label: string;
  param: string;
  isOpen: boolean;
  onOpen: (param: string) => void;
  tabIndex?: number;
  children: React.ReactNode;
}

const FilterGroupAccordion = ({
  label,
  param,
  isOpen,
  onOpen,
  tabIndex = 0,
  children,
}: FilterGroupAccordionProps) => {
  const handleOpen = () => onOpen(param);

  return (
    <div key={label} className="filter-options">
      <button
        className="filter-option-label pointer p-3"
        onClick={handleOpen}
        tabIndex={tabIndex}
        onKeyDown={handleOpen}
      >
        <div>{label}</div>
        <FontAwesomeIcon
          aria-label={isOpen ? 'Close filter group' : 'Open filter group'}
          data-testid={isOpen ? 'close-filter-group' : 'open-filter-group'}
          icon={isOpen ? faChevronUp : faChevronDown}
        />
      </button>

      <Collapse in={isOpen} className="p-3">
        <div>{children}</div>
      </Collapse>
    </div>
  );
};

export default FilterGroupAccordion;
