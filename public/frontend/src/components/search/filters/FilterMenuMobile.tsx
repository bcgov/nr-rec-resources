import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useStore } from '@tanstack/react-store';
import { useClearFilters } from '@/components/search/hooks/useClearFilters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronUp,
  faChevronDown,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import searchResultsStore from '@/store/searchResults';
import FilterGroupMobile from '@/components/search/filters/FilterGroupMobile';
import '@/components/search/filters/Filters.scss';

interface FilterMenuMobileProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const FilterMenuMobile = ({ isOpen, setIsOpen }: FilterMenuMobileProps) => {
  const clearFilters = useClearFilters();
  const { filters: menuContent, totalCount } = useStore(searchResultsStore);

  const filterMenu =
    menuContent &&
    Object.fromEntries(menuContent.map(({ param }) => [param, false]));

  const [expandAll, setExpandAll] = useState(false);
  const [showFilterGroup, setShowFilterGroup] = useState(filterMenu);

  const handleCloseFilter = () => {
    setIsOpen(false);
  };

  const handleOpenFilterGroup = (param: string) => {
    setShowFilterGroup((prev) => ({
      ...prev,
      [param]: !prev?.[param],
    }));
  };

  const handleExpandAll = () => {
    setExpandAll((prev) => !prev);
    setShowFilterGroup((prev) =>
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
          <h2 className="fs-4 mb-4">Filter</h2>
          <button
            aria-label="close"
            className="btn close-filter-btn"
            onClick={handleCloseFilter}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <button className="show-all-link p-0" onClick={handleExpandAll}>
          {expandAll ? 'Collapse' : 'Expand'} all
          {expandAll ? (
            <FontAwesomeIcon icon={faChevronUp} />
          ) : (
            <FontAwesomeIcon icon={faChevronDown} />
          )}
        </button>
        {menuContent?.map((content, index) => {
          const { options, label, param } = content;
          const isFilterGroupOpen = showFilterGroup?.[param];
          return (
            <FilterGroupMobile
              key={param}
              label={label}
              options={options}
              param={param}
              isOpen={isFilterGroupOpen}
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
          Show {totalCount} {totalCount > 1 ? 'results' : 'result'}
        </button>
        <button
          className="btn-link clear-filter-link w-100 fw-normal"
          onClick={clearFilters}
        >
          Clear filters
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterMenuMobile;
