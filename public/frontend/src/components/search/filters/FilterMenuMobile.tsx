import { useMemo } from 'react';
import { useStore } from '@tanstack/react-store';
import { useClearFilters } from '@/components/search/hooks/useClearFilters';
import searchResultsStore from '@/store/searchResults';
import filterChipStore from '@/store/filterChips';
import FilterGroupAccordion from '@/components/search/filters/FilterGroupAccordion';
import FilterGroup from '@/components/search/filters/FilterGroup';
import FilterModal from '@/components/search/filters/FilterModal';
import { Container, Modal, Row } from 'react-bootstrap';
import { trackEvent } from '@shared/utils';
import {
  MATOMO_ACTION_FILTERS_LIST_MOBILE,
  MATOMO_CATEGORY_FILTERS,
} from '@/constants/analytics';

interface FilterMenuMobileProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const FilterMenuMobile = ({ isOpen, setIsOpen }: FilterMenuMobileProps) => {
  const clearFilters = useClearFilters();
  const { filters: menuContent, totalCount } = useStore(searchResultsStore);
  const selectedFilters = useStore(filterChipStore);
  const params = menuContent?.map(({ param }) => param) ?? [];

  const activeGroups = useMemo(() => {
    return Array.from(new Set(selectedFilters?.map((f) => f.param) ?? []));
  }, [selectedFilters]);

  const handleClose = () => setIsOpen(false);
  const handleShowResults = () => {
    const filterNames = selectedFilters?.map((f) => f.label) ?? [];
    const listOfFilterNames = filterNames
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ');

    trackEvent({
      category: MATOMO_CATEGORY_FILTERS,
      action: MATOMO_ACTION_FILTERS_LIST_MOBILE,
      name: `${MATOMO_ACTION_FILTERS_LIST_MOBILE}_${listOfFilterNames}`,
    });
    handleClose();
  };

  return (
    <>
      <FilterModal
        isOpen={isOpen}
        onClose={handleClose}
        params={params}
        activeGroups={activeGroups}
        className="d-block d-lg-none"
      >
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

            <Modal.Footer className="d-block filter-footer">
              <button
                onClick={handleShowResults}
                className="btn btn-primary w-100 mx-0 mb-2"
              >
                Show {totalCount} {totalCount === 1 ? 'result' : 'results'}
              </button>
              <Container className="filter-tools">
                <Row className="d-flex align-items-center g-0">
                  <button
                    className="btn-link clear-filter-link w-100 fw-normal"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                </Row>
              </Container>
            </Modal.Footer>
          </>
        )}
      </FilterModal>
    </>
  );
};

export default FilterMenuMobile;
