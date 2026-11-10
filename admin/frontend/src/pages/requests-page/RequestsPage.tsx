import { type ReactNode, useMemo, useState } from 'react';
import { PageLayout, Table as DataTable } from '@/components';
import { ROUTE_PATHS } from '@/constants/routes';
import { useGetPendingMapFeatureRequests } from '@/services/hooks/recreation-resource-admin/useGetPendingMapFeatureRequests';
import { PendingMapFeatureRequestRowDto } from '@/services/recreation-resource-admin';
import { Breadcrumbs } from '@shared/index';
import { Alert, Form, Pagination, Spinner, Stack } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';
import './RequestsPage.scss';

type RowDto = PendingMapFeatureRequestRowDto;

type SortKey =
  | 'rec_resource_id'
  | 'name'
  | 'recreation_district'
  | 'natural_resource_district'
  | 'recreation_type'
  | 'geometry_type'
  | 'feature_count'
  | 'requested_at';

type PageItem = number | 'ellipsis';

type SortValue = string | number;

type ColumnConfig = {
  label: string;
  key: SortKey;
  getSortValue: (row: RowDto) => SortValue;
  render: (row: RowDto) => ReactNode;
};

const DASH_PLACEHOLDER = '-';
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const PAGE_SIZE_SELECT_ID = 'requests-pagination-page-size';
const PAGE_SELECT_ID = 'requests-pagination-page';

const getDisplayValue = (value?: string | number | null) =>
  value === undefined || value === null || value === ''
    ? DASH_PLACEHOLDER
    : value;

const getRecreationDistrict = (row: RowDto) =>
  row.recreation_district || row.district_description;

const getGeometryTypeText = (row: RowDto) => row.geometry_types.join(', ');

const formatRequestedAt = (row: RowDto) =>
  row.requested_at
    ? new Date(row.requested_at).toLocaleString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : DASH_PLACEHOLDER;

const textColumn = (
  label: string,
  key: SortKey,
  getValue: (row: RowDto) => string | null | undefined,
): ColumnConfig => ({
  label,
  key,
  getSortValue: (row) => getValue(row) ?? '',
  render: (row) => getDisplayValue(getValue(row)),
});

const COLUMNS: ColumnConfig[] = [
  {
    label: 'Rec #',
    key: 'rec_resource_id',
    getSortValue: (row) => row.rec_resource_id ?? '',
    render: (row) => (
      <Link
        to={ROUTE_PATHS.REC_RESOURCE_GEOSPATIAL}
        params={{ id: row.rec_resource_id }}
      >
        {row.rec_resource_id}
      </Link>
    ),
  },
  textColumn('Name', 'name', (row) => row.name),
  textColumn(
    'Recreation district',
    'recreation_district',
    getRecreationDistrict,
  ),
  textColumn(
    'Natural resource district',
    'natural_resource_district',
    (row) => row.natural_resource_district,
  ),
  textColumn(
    'Recreation type',
    'recreation_type',
    (row) => row.recreation_type,
  ),
  textColumn('Geometry type', 'geometry_type', getGeometryTypeText),
  {
    label: 'Features',
    key: 'feature_count',
    getSortValue: (row) => row.feature_count ?? 0,
    render: (row) => row.feature_count,
  },
  {
    label: 'Requested at',
    key: 'requested_at',
    getSortValue: (row) =>
      row.requested_at ? Date.parse(row.requested_at) : 0,
    render: formatRequestedAt,
  },
];

const buildPageRange = (start: number, end: number) =>
  Array.from(
    { length: Math.max(end - start + 1, 0) },
    (_, index) => start + index,
  );

const buildPageItems = (pageIndex: number, pageCount: number): PageItem[] => {
  if (pageCount <= 7) {
    return buildPageRange(0, pageCount - 1);
  }

  let middlePages = buildPageRange(pageIndex - 1, pageIndex + 1);

  if (pageIndex <= 2) {
    middlePages = buildPageRange(1, 3);
  } else if (pageIndex >= pageCount - 3) {
    middlePages = buildPageRange(pageCount - 4, pageCount - 2);
  }

  return [0, ...middlePages, pageCount - 1].reduce<PageItem[]>(
    (items, currentIndex) => {
      const previousIndex = items.at(-1);

      if (
        typeof previousIndex === 'number' &&
        currentIndex - previousIndex > 1
      ) {
        items.push('ellipsis');
      }

      items.push(currentIndex);
      return items;
    },
    [],
  );
};

function getSortPresentation(direction?: 'asc' | 'desc') {
  switch (direction) {
    case 'asc':
      return { label: 'ascending', indicator: '↑' };
    case 'desc':
      return { label: 'descending', indicator: '↓' };
    default:
      return { label: 'not sorted', indicator: '↕' };
  }
}

type PaginationSelectProps = {
  label: string;
  id: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
};

const PaginationSelect = ({
  label,
  id,
  value,
  options,
  onChange,
}: PaginationSelectProps) => (
  <>
    <Form.Label htmlFor={id} className="pagination-bar__label mb-0">
      {label}
    </Form.Label>
    <Form.Select
      id={id}
      size="sm"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </Form.Select>
  </>
);

type PaginationStepProps = {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
};

const PaginationStep = ({
  direction,
  disabled,
  onClick,
}: PaginationStepProps) => {
  const isPrev = direction === 'prev';
  const Component = isPrev ? Pagination.Prev : Pagination.Next;
  const label = isPrev ? 'Previous page' : 'Next page';

  return (
    <Component aria-label={label} disabled={disabled} onClick={onClick}>
      <span aria-hidden="true">{isPrev ? '‹' : '›'}</span>
      <span className="visually-hidden">{label}</span>
    </Component>
  );
};

export const RequestsPage = () => {
  const { data, isLoading, isError } = useGetPendingMapFeatureRequests();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const rows = useMemo(() => data?.data ?? [], [data]);

  const sortedRows = useMemo(() => {
    const column = COLUMNS.find((c) => c.key === sortKey);

    if (!column) {
      return [...rows];
    }

    return [...rows].sort((a, b) => {
      const aValue = column.getSortValue(a);
      const bValue = column.getSortValue(b);

      const result =
        typeof aValue === 'number' && typeof bValue === 'number'
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue), 'en-CA', {
              numeric: true,
              sensitivity: 'base',
            });

      return sortDirection === 'asc' ? result : -result;
    });
  }, [rows, sortDirection, sortKey]);

  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPageIndex = Math.min(pageIndex, totalPages - 1);
  const pageItems = buildPageItems(currentPageIndex, totalPages);
  const pageNumbers = buildPageRange(1, totalPages);

  const pagedRows = useMemo(
    () =>
      sortedRows.slice(
        currentPageIndex * pageSize,
        currentPageIndex * pageSize + pageSize,
      ),
    [currentPageIndex, pageSize, sortedRows],
  );

  const handleSort = (nextSortKey: SortKey) => {
    if (sortKey === nextSortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(nextSortKey);
      setSortDirection(nextSortKey === 'requested_at' ? 'desc' : 'asc');
    }
    setPageIndex(0);
  };

  const renderSortableHeader = (label: string, key: SortKey) => {
    const activeDirection = sortKey === key ? sortDirection : undefined;
    const nextDirection = activeDirection === 'asc' ? 'desc' : 'asc';
    const { label: sortLabel, indicator } =
      getSortPresentation(activeDirection);

    return (
      <button
        type="button"
        className="requests-page__sort"
        onClick={() => handleSort(key)}
        aria-label={`Sort by ${label} (${sortLabel}, next ${nextDirection})`}
      >
        <span>{label}</span>
        <span aria-hidden="true">{indicator}</span>
      </button>
    );
  };

  return (
    <PageLayout>
      <div className="d-flex flex-column gap-4">
        <Breadcrumbs />

        <div>
          <h1 className="mb-1">Requests</h1>
          <p className="text-muted mb-0">
            Pending spatial submission requests awaiting processing.
          </p>
        </div>

        {isLoading ? (
          <Alert
            variant="light"
            className="mb-0 d-flex align-items-center gap-2"
          >
            <Spinner animation="border" size="sm" aria-hidden="true" />
            <span>Loading pending requests...</span>
          </Alert>
        ) : null}

        {isError ? (
          <Alert variant="danger" className="mb-0">
            Unable to load pending requests. Please refresh and try again.
          </Alert>
        ) : null}

        <DataTable<RowDto>
          className="mb-0"
          columns={COLUMNS.map(({ label, key, render }) => ({
            header: renderSortableHeader(label, key),
            render,
          }))}
          rows={pagedRows}
          emptyMessage="No pending requests found."
          getRowKey={(row, index) =>
            `${row.rec_resource_id}-${row.submission_id ?? 'na'}-${index}`
          }
        />

        {totalRows > 0 ? (
          <div className="pagination-bar">
            <Stack
              direction="horizontal"
              className="justify-content-between align-items-center flex-wrap gap-3"
            >
              <Pagination className="pagination-bar__pages mb-0">
                <PaginationStep
                  direction="prev"
                  disabled={currentPageIndex === 0}
                  onClick={() =>
                    setPageIndex((current) => Math.max(0, current - 1))
                  }
                />

                {pageItems.map((item, index) =>
                  item === 'ellipsis' ? (
                    <Pagination.Ellipsis
                      aria-label="More"
                      key={`ellipsis-${pageItems[index - 1]}-${pageItems[index + 1]}`}
                      disabled
                    />
                  ) : (
                    <Pagination.Item
                      key={item}
                      active={item === currentPageIndex}
                      onClick={() => setPageIndex(item)}
                    >
                      {item + 1}
                    </Pagination.Item>
                  ),
                )}

                <PaginationStep
                  direction="next"
                  disabled={currentPageIndex >= totalPages - 1}
                  onClick={() =>
                    setPageIndex((current) =>
                      Math.min(totalPages - 1, current + 1),
                    )
                  }
                />
              </Pagination>

              <Stack
                direction="horizontal"
                gap={2}
                className="pagination-bar__jump align-items-center"
              >
                <PaginationSelect
                  label="Page size"
                  id={PAGE_SIZE_SELECT_ID}
                  value={pageSize}
                  options={PAGE_SIZE_OPTIONS}
                  onChange={(value) => {
                    setPageSize(value);
                    setPageIndex(0);
                  }}
                />

                <PaginationSelect
                  label="Jump to"
                  id={PAGE_SELECT_ID}
                  value={currentPageIndex + 1}
                  options={pageNumbers}
                  onChange={(value) => setPageIndex(value - 1)}
                />
              </Stack>
            </Stack>
          </div>
        ) : null}
      </div>
    </PageLayout>
  );
};
