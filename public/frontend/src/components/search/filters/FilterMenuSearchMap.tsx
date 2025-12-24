import { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, Form, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import { useClearFilters } from '@/components/search/hooks/useClearFilters';
import { useSearchRecreationResourcesPaginated } from '@/service/queries/recreation-resource';
import searchResultsStore from '@/store/searchResults';
import FilterGroupAccordion from '@/components/search/filters/FilterGroupAccordion';
import FilterModal from '@/components/search/filters/FilterModal';
import { trackEvent } from '@shared/utils';
import {
  MATOMO_ACTION_FILTERS_MAP,
  MATOMO_CATEGORY_FILTERS,
} from '@/constants/analytics';

import '@/components/search/filters/Filters.scss';
import '@/components/search/filters/FilterMenuSearchMap.scss';
import DownloadKmlResultsModal from '../DownloadKmlResultsModal';

interface FilterMenuSearchMapProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const COLUMN_BREAK_THRESHOLD = 4;

const FilterMenuSearchMap = ({
  isOpen,
  setIsOpen,
}: FilterMenuSearchMapProps) => {
  const navigate = useNavigate();
  const clearFilters = useClearFilters();
  const { filters: searchStoreFilters, totalCount: searchStoreTotalCount } =
    useStore(searchResultsStore);
  const [menuContent, setMenuContent] = useState(searchStoreFilters);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const searchParams = useSearch({ from: '/search/' });
  const params = menuContent?.map(({ param }) => param) ?? [];
  const [localFilters, setLocalFilters] = useState<Record<string, string[]>>(
    {},
  );

  const previewQueryParams = useMemo(() => {
    return {
      limit: 10,
      page: 1,
      filter: searchParams.filter || undefined,
      district: localFilters.district?.join('_') || undefined,
      activities: localFilters.activities?.join('_') || undefined,
      access: localFilters.access?.join('_') || undefined,
      facilities: localFilters.facilities?.join('_') || undefined,
      type: localFilters.type?.join('_') || undefined,
      status: localFilters.status?.join('_') || undefined,
      fees: localFilters.fees?.join('_') || undefined,
      community: searchParams.community || undefined,
      lat: searchParams.lat ? Number(searchParams.lat) : undefined,
      lon: searchParams.lon ? Number(searchParams.lon) : undefined,
    };
  }, [localFilters, searchParams]);

  const { data } = useSearchRecreationResourcesPaginated(previewQueryParams);
  const totalCount = (data?.totalCount || searchStoreTotalCount) ?? 0;
  const recResourceIds = data?.recResourceIds ? data.recResourceIds : [];

  useEffect(() => {
    // Initialize menu content and local filters or update when search store filters change
    if (searchStoreFilters) {
      setMenuContent(searchStoreFilters);
      const initialFilters: Record<string, string[]> = {};
      searchStoreFilters.forEach(({ param }) => {
        const value = (searchParams as Record<string, unknown>)[param];
        initialFilters[param] = value ? String(value).split('_') : [];
      });
      setLocalFilters(initialFilters);
    }
  }, [searchStoreFilters, searchParams]);

  useEffect(() => {
    // Update menu content when preview data changes
    if (data?.filters) {
      setMenuContent(data.filters);
    }
  }, [data?.filters]);

  const handleClose = () => setIsOpen(false);

  const handleToggleFilter = (param: string, id: string | number) => {
    const current = localFilters[param] ?? [];
    const idStr = String(id);
    const updated = current.includes(idStr)
      ? current.filter((v) => v !== idStr)
      : [...current, idStr];
    setLocalFilters({ ...localFilters, [param]: updated });
  };

  const handleApplyFilters = () => {
    const newSearchParams: Record<string, any> = { ...searchParams };
    params.forEach((param) => {
      if (localFilters[param]?.length) {
        const joinedValue = localFilters[param].join('_');
        // Convert to number if it's a single numeric value to prevent quote serialization
        newSearchParams[param] =
          localFilters[param].length === 1 && !isNaN(Number(joinedValue))
            ? Number(joinedValue)
            : joinedValue;
      } else {
        delete newSearchParams[param];
      }
    });
    navigate({ search: newSearchParams as any });
    setIsOpen(false);

    const selectedFilterNames =
      menuContent?.flatMap(({ options, param }) => {
        const selectedIds = localFilters[param] ?? [];
        return options
          .filter(({ id }) => selectedIds.includes(String(id)))
          .map(({ description }) => description);
      }) ?? [];
    const listOfFilterNames = selectedFilterNames
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ');

    trackEvent({
      category: MATOMO_CATEGORY_FILTERS,
      action: MATOMO_ACTION_FILTERS_MAP,
      name: `${MATOMO_ACTION_FILTERS_MAP}_${listOfFilterNames}`,
    });
  };

  const handleClear = () => {
    clearFilters();
    setLocalFilters({});
  };

  const handleDownloadClick = useCallback(() => {
    setIsDownloadModalOpen(true);
  }, []);

  const downloadKMLButton = (
    <button
      className="btn-link clear-filter-link footer-buttons"
      onClick={handleDownloadClick}
    >
      Download KML
    </button>
  );

  const clearFiltersButton = (
    <button
      className="btn-link clear-filter-link fw-normal footer-buttons"
      onClick={handleClear}
    >
      Clear filters
    </button>
  );

  const applyButton = (
    <button
      onClick={handleApplyFilters}
      className="btn btn-primary mx-0 mb-2 mb-lg-0 apply-button footer-buttons"
    >
      Apply {totalCount} {totalCount === 1 ? 'result' : 'results'}
    </button>
  );

  return (
    <FilterModal
      className="filter-menu-search-map"
      isOpen={isOpen}
      onClose={handleClose}
      params={params}
    >
      {({ isGroupOpen, toggleGroup }) => (
        <>
          <div className="filter-menu-content">
            {menuContent?.map(({ label, options, param }, index) => {
              const selected = localFilters[param] ?? [];
              const isColumns = options.length > COLUMN_BREAK_THRESHOLD;

              return (
                <FilterGroupAccordion
                  key={param}
                  label={label}
                  param={param}
                  isOpen={isGroupOpen(param)}
                  onOpen={toggleGroup}
                  tabIndex={index}
                >
                  <fieldset className="filter-group-container">
                    <Form.Group
                      className={`filter-options-container ${isColumns ? 'filter-option-columns' : ''}`}
                    >
                      {options.map(({ id, description, count }) => {
                        const isChecked = selected.includes(String(id));
                        const isDisabled = !isChecked && count === 0;
                        return (
                          <Form.Check
                            key={id}
                            type="checkbox"
                            id={String(id)}
                            label={`${description} (${count})`}
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={() => handleToggleFilter(param, id)}
                          />
                        );
                      })}
                    </Form.Group>
                  </fieldset>
                </FilterGroupAccordion>
              );
            })}
          </div>

          <Modal.Footer>
            <Container className="d-none d-md-block">
              <Row className="flex-nowrap ">
                <Col className="text-center" md={4}>
                  {downloadKMLButton}
                </Col>
                <Col className="text-center" md={4}>
                  {clearFiltersButton}
                </Col>
                <Col className="text-center" md={4}>
                  {applyButton}
                </Col>
              </Row>
            </Container>
            <Container className="d-block d-md-none">
              <Row className="flex-nowrap">
                <Col className="text-center" md={12}>
                  {applyButton}
                </Col>
              </Row>
              <Row className="d-flex align-items-center g-0">
                <Col className="text-center p-0" xs={6}>
                  {downloadKMLButton}
                </Col>
                <Col className="text-center p-0" xs={6}>
                  {clearFiltersButton}
                </Col>
              </Row>
            </Container>
          </Modal.Footer>
          <DownloadKmlResultsModal
            isOpen={isDownloadModalOpen}
            setIsOpen={setIsDownloadModalOpen}
            searchResultsNumber={totalCount}
            ids={recResourceIds}
            trackingView={'list'}
          />
        </>
      )}
    </FilterModal>
  );
};

export default FilterMenuSearchMap;
