import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronUp,
  faChevronDown,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import FilterGroupMobile from '@/components/search/filters/FilterGroupMobile';
import { FilterMenuContent } from '@/components/search/types';
import '@/components/search/filters/Filters.scss';

interface FilterMenuMobileProps {
  totalResults: number;
  menuContent: FilterMenuContent[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onClearFilters: () => void;
}

const FilterMenuMobile = ({
  totalResults,
  menuContent,
  isOpen,
  setIsOpen,
  onClearFilters,
}: FilterMenuMobileProps) => {
  const filterMenu =
    menuContent &&
    Object.fromEntries(menuContent.map(({ param }) => [param, false]));

  const [expandAll, setExpandAll] = useState(false);
  const [showFilters, setShowFilter] = useState(filterMenu);

  const handleClearFilter = () => {
    onClearFilters();
  };

  const handleCloseFilter = () => {
    setIsOpen(false);
  };

  const handleOpenFilterGroup = (param: string) => {
    setShowFilter((prev) => ({
      ...prev,
      [param]: !prev?.[param],
    }));
  };

  const handleExpandAll = () => {
    setExpandAll((prev) => !prev);
    setShowFilter((prev) =>
      Object.fromEntries(
        Object.keys(filterMenu).map((key) => [key, !prev?.[key]]),
      ),
    );
  };

  return (
    <Modal
      show={isOpen}
      onHide={handleCloseFilter}
      aria-labelledby="mobile-filter-modal"
      className="mobile-filter-modal d-block d-lg-none"
      scrollable
    >
      <Modal.Body className="mobile-filter-modal-content">
        <div className="mobile-filter-modal-content--header">
          <h2>Filter</h2>
          <button
            aria-label="close"
            className="btn closer-filter-btn"
            onClick={handleCloseFilter}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <button className="btn btn-link expand-link" onClick={handleExpandAll}>
          {expandAll ? 'Collapse' : 'Expand'} all
          {expandAll ? (
            <FontAwesomeIcon icon={faChevronUp} />
          ) : (
            <FontAwesomeIcon icon={faChevronDown} />
          )}
        </button>
        {menuContent?.map((content, index) => {
          const { options, label, param } = content;
          const isSectionOpen = showFilters?.[param];
          return (
            <FilterGroupMobile
              key={param}
              label={label}
              options={options}
              param={param}
              isOpen={isSectionOpen}
              onOpen={handleOpenFilterGroup}
              tabIndex={index}
            />
          );
        })}
      </Modal.Body>
      <Modal.Footer className="d-block">
        <button
          aria-label="Show results"
          onClick={handleCloseFilter}
          className="btn btn-primary w-100 mx-0 mb-2"
        >
          Show {totalResults} {totalResults > 1 ? 'results' : 'result'}
        </button>
        <button
          className="btn btn-link clear-filter-link w-100"
          onClick={handleClearFilter}
        >
          Clear filters
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterMenuMobile;
