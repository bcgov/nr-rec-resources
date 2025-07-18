import { Modal } from 'react-bootstrap';
import { useStore } from '@tanstack/react-store';
import { useClearFilters } from '@/components/search/hooks/useClearFilters';
import searchResultsStore from '@/store/searchResults';
import FilterGroupAccordion from '@/components/search/filters/FilterGroupAccordion';
import FilterGroup from '@/components/search/filters/FilterGroup';
import FilterModal from '@/components/search/filters/FilterModal';
import '@/components/search/filters/Filters.scss';
import '@/components/search/filters/FilterMenuSearchMap.scss';

interface FilterMenuSearchMapProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const FilterMenuSearchMap = ({
  isOpen,
  setIsOpen,
}: FilterMenuSearchMapProps) => {
  const clearFilters = useClearFilters();
  const { filters: menuContent, totalCount } = useStore(searchResultsStore);
  const params = menuContent?.map(({ param }) => param) ?? [];

  const handleClose = () => setIsOpen(false);

  return (
    <FilterModal isOpen={isOpen} onClose={handleClose} params={params}>
      {({ isGroupOpen, toggleGroup }) => (
        <>
          {menuContent?.map(({ label, options, param }, index) => (
            <FilterGroupAccordion
              key={param}
              label={label}
              param={param}
              isOpen={isGroupOpen(param)}
              onOpen={toggleGroup}
              tabIndex={index}
            >
              <FilterGroup
                options={options}
                param={param}
                showMoreBtn={false}
              />
            </FilterGroupAccordion>
          ))}

          <Modal.Footer className="d-block">
            <button
              onClick={handleClose}
              className="btn btn-primary w-100 mx-0 mb-2"
            >
              Show {totalCount} {totalCount === 1 ? 'result' : 'results'}
            </button>
            <button
              className="btn-link clear-filter-link w-100 fw-normal"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </Modal.Footer>
        </>
      )}
    </FilterModal>
  );
};

export default FilterMenuSearchMap;
