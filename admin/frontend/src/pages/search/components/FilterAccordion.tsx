import { useMemo, useState } from 'react';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { CheckboxDropdownField } from '@/components/form';
import {
  ADMIN_SEARCH_MULTISELECT_FILTER_FIELDS,
  EMPTY_ADMIN_SEARCH_FILTERS,
  type EditableAdminSearchFilters,
} from '@/pages/search/constants';
import { useAdminSearchController } from '@/pages/search/hooks/useAdminSearchController';
import { AdminSearchRouteState } from '@/pages/search/types';
import './FilterAccordion.scss';
import { capitalizeWords } from '@shared/utils/capitalizeWords';

type FilterAccordionControllerProps = Pick<
  ReturnType<typeof useAdminSearchController>,
  | 'isFilterPanelOpen'
  | 'closeFilterPanel'
  | 'toggleFilterPanel'
  | 'typeOptions'
  | 'districtOptions'
  | 'activityOptions'
  | 'statusOptions'
  | 'accessOptions'
  | 'closestCommunityOptions'
  | 'applyFilters'
  | 'resetFilters'
>;

interface FilterAccordionProps {
  search: AdminSearchRouteState;
  controller: FilterAccordionControllerProps;
  showTrigger?: boolean;
}

type FilterDraftState = EditableAdminSearchFilters;

const getEditableFilters = (
  state: EditableAdminSearchFilters | FilterDraftState,
): FilterDraftState => ({
  type: state.type,
  district: state.district,
  activities: state.activities,
  status: state.status,
  access: state.access,
  closestCommunity: state.closestCommunity,
  establishment_date_from: state.establishment_date_from,
  establishment_date_to: state.establishment_date_to,
});

const toggleFilterValue = (currentValues: string[], value: string): string[] =>
  currentValues.includes(value)
    ? currentValues.filter((entry) => entry !== value)
    : [...currentValues, value];

export function FilterAccordion({
  search,
  controller,
  showTrigger = true,
}: Readonly<FilterAccordionProps>) {
  const {
    isFilterPanelOpen: isOpen,
    closeFilterPanel: onClose,
    toggleFilterPanel: onToggle,
    typeOptions,
    districtOptions,
    activityOptions,
    statusOptions,
    accessOptions,
    closestCommunityOptions,
    applyFilters: onApply,
    resetFilters: onReset,
  } = controller;
  const filterOptionsByKey = {
    typeOptions,
    districtOptions,
    activityOptions,
    statusOptions,
    accessOptions,
    closestCommunityOptions: closestCommunityOptions.map((item) => ({
      ...item,
      label: capitalizeWords(item.label),
    })),
  };
  const searchFilters = getEditableFilters(search);
  const searchKey = JSON.stringify(searchFilters);
  const [draft, setDraft] = useState<FilterDraftState>(searchFilters);

  const updateDraft = (
    updater: (current: FilterDraftState) => FilterDraftState,
  ) => {
    setDraft((current) => updater(current));
  };
  const hasDraftChanges = useMemo(() => {
    return JSON.stringify(draft) !== searchKey;
  }, [draft, searchKey]);
  const resetDraft = () => {
    setDraft(EMPTY_ADMIN_SEARCH_FILTERS);
  };

  const renderedPanel = (
    <div
      className={`filters__collapse${isOpen ? ' is-open' : ''}`}
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
    >
      <div className="filters__content">
        <div className="filters__panel mb-3">
          <Row className="g-3">
            {ADMIN_SEARCH_MULTISELECT_FILTER_FIELDS.map((field) => {
              const options = filterOptionsByKey[field.optionsKey] ?? [];
              return (
                <Col key={field.key} md={6} xl={3}>
                  <Form.Group controlId={field.controlId}>
                    <Form.Label>{field.label}</Form.Label>
                    <CheckboxDropdownField
                      label={field.label}
                      items={options.flatMap((option) =>
                        option.id
                          ? [{ value: option.id, label: option.label }]
                          : [],
                      )}
                      selectedValues={draft[field.key]}
                      toggleStyle="field"
                      showSelectedCount
                      onToggle={(value) =>
                        updateDraft((current) => ({
                          ...current,
                          [field.key]: toggleFilterValue(
                            current[field.key],
                            value,
                          ),
                        }))
                      }
                    />
                  </Form.Group>
                </Col>
              );
            })}
            <Col md={6} xl={3}>
              <Form.Group controlId="admin-search-filter-establishment-date-from">
                <Form.Label>Established from</Form.Label>
                <Form.Control
                  type="date"
                  value={draft.establishment_date_from ?? ''}
                  max={draft.establishment_date_to}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      establishment_date_from: event.target.value || undefined,
                    }))
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6} xl={3}>
              <Form.Group controlId="admin-search-filter-establishment-date-to">
                <Form.Label>Established to</Form.Label>
                <Form.Control
                  type="date"
                  value={draft.establishment_date_to ?? ''}
                  min={draft.establishment_date_from}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      establishment_date_to: event.target.value || undefined,
                    }))
                  }
                />
              </Form.Group>
            </Col>
          </Row>
          <Stack
            direction="horizontal"
            gap={3}
            className="justify-content-between flex-wrap mt-4 border-top pt-3"
          >
            <Button
              variant="outline-primary"
              className="control-button"
              onClick={() => {
                resetDraft();
                onReset();
              }}
            >
              Reset filters
            </Button>
            <Stack direction="horizontal" gap={3}>
              <Button
                variant="primary"
                disabled={!hasDraftChanges}
                onClick={() => {
                  onApply({
                    type: draft.type,
                    district: draft.district,
                    activities: draft.activities,
                    status: draft.status,
                    access: draft.access,
                    closestCommunity: draft.closestCommunity,
                    establishment_date_from: draft.establishment_date_from,
                    establishment_date_to: draft.establishment_date_to,
                  });
                }}
              >
                Apply
              </Button>
              <Button
                variant="outline-primary"
                className="control-button"
                onClick={() => {
                  setDraft(searchFilters);
                  onClose();
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </div>
      </div>
    </div>
  );

  if (showTrigger) {
    return (
      <div className="filters">
        <div className="d-flex justify-content-end mb-3">
          <Button
            variant={isOpen ? 'primary' : 'outline-primary'}
            onClick={onToggle}
            className="d-flex align-items-center gap-2"
          >
            <FontAwesomeIcon icon={faFilter} className="d-none d-sm-inline" />
            Filters
          </Button>
        </div>
        {renderedPanel}
      </div>
    );
  }

  return renderedPanel;
}
