import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
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
  const filterMenu = menuContent.reduce<Record<string, boolean>>(
    (acc, curr) => {
      const { param } = curr;
      acc[param] = false;
      return acc;
    },
    {},
  );

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
      [param]: !prev[param],
    }));
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
            className="btn"
            onClick={handleCloseFilter}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {menuContent.map((content, index) => {
          const { filters, param, title } = content;
          const isSectionOpen = showFilters[param];
          return (
            <FilterGroupMobile
              key={param}
              title={title}
              filters={filters}
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
