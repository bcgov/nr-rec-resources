import { useState, useEffect, useMemo } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '@tanstack/react-store';
import { useClearFilters } from '@/components/search/hooks/useClearFilters';
import { useSearchRecreationResourcesPaginated } from '@/service/queries/recreation-resource';
import searchResultsStore from '@/store/searchResults';
import FilterGroupAccordion from '@/components/search/filters/FilterGroupAccordion';
import FilterModal from '@/components/search/filters/FilterModal';
import '@/components/search/filters/Filters.scss';
import '@/components/search/filters/FilterMenuSearchMap.scss';

interface FilterMenuSearchMapProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const COLUMN_BREAK_THRESHOLD = 4;

const FilterMenuSearchMap = ({
  isOpen,
  setIsOpen,
}: FilterMenuSearchMapProps) => {
  const clearFilters = useClearFilters();
  const { filters: searchStoreFilters, totalCount: searchStoreTotalCount } =
    useStore(searchResultsStore);
  const [menuContent, setMenuContent] = useState(searchStoreFilters);
  const [searchParams, setSearchParams] = useSearchParams();
  const params = menuContent?.map(({ param }) => param) ?? [];
  const [localFilters, setLocalFilters] = useState<Record<string, string[]>>(
    {},
  );

  const previewQueryParams = useMemo(() => {
    return {
      limit: 10,
      page: 1,
      filter: searchParams.get('filter') || undefined,
      district: localFilters.district?.join('_') || undefined,
      activities: localFilters.activities?.join('_') || undefined,
      access: localFilters.access?.join('_') || undefined,
      facilities: localFilters.facilities?.join('_') || undefined,
      type: localFilters.type?.join('_') || undefined,
      community: searchParams.get('community') || undefined,
      lat: searchParams.get('lat')
        ? Number(searchParams.get('lat'))
        : undefined,
      lon: searchParams.get('lon')
        ? Number(searchParams.get('lon'))
        : undefined,
    };
  }, [localFilters, searchParams]);

  const { data } = useSearchRecreationResourcesPaginated(previewQueryParams);
  const totalCount = (data?.totalCount || searchStoreTotalCount) ?? 0;

  useEffect(() => {
    // Initialize menu content and local filters or update when search store filters change
    if (searchStoreFilters) {
      setMenuContent(searchStoreFilters);
      const initialFilters: Record<string, string[]> = {};
      searchStoreFilters.forEach(({ param }) => {
        const value = searchParams.get(param);
        initialFilters[param] = value ? value.split('_') : [];
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

  const handleToggleFilter = (param: string, id: string) => {
    const current = localFilters[param] ?? [];
    const updated = current.includes(id)
      ? current.filter((v) => v !== id)
      : [...current, id];
    setLocalFilters({ ...localFilters, [param]: updated });
  };

  const handleApplyFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    params.forEach((param) => {
      if (localFilters[param]?.length) {
        newParams.set(param, localFilters[param].join('_'));
      } else {
        newParams.delete(param);
      }
    });
    setSearchParams(newParams);
    setIsOpen(false);
  };

  const handleClear = () => {
    clearFilters();
    setLocalFilters({});
  };

  return (
    <FilterModal isOpen={isOpen} onClose={handleClose} params={params}>
      {({ isGroupOpen, toggleGroup }) => (
        <>
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
                  <legend className="filter-group-title">{label}</legend>
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
                          onChange={() => handleToggleFilter(param, String(id))}
                        />
                      );
                    })}
                  </Form.Group>
                </fieldset>
              </FilterGroupAccordion>
            );
          })}

          <Modal.Footer>
            <button
              onClick={handleApplyFilters}
              className="btn btn-primary mx-0 mb-2 mb-lg-0"
            >
              Apply {totalCount} {totalCount === 1 ? 'result' : 'results'}
            </button>
            <button
              className="btn-link clear-filter-link fw-normal"
              onClick={handleClear}
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
