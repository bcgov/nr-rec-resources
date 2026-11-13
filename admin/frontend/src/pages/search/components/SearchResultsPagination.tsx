import { Form, Pagination, Stack } from 'react-bootstrap';
import type { SearchResultsPaginationModel } from '@/pages/search/hooks/useAdminSearchController';
import { buildPageItems, buildPageRange } from '@/utils/pagination';
import './SearchResultsPagination.scss';

interface SearchResultsPaginationProps {
  pagination: SearchResultsPaginationModel;
}

export function SearchResultsPagination({
  pagination,
}: Readonly<SearchResultsPaginationProps>) {
  const {
    rowCount,
    pageCount,
    canPreviousPage,
    canNextPage,
    pageSizeOptions,
    previousPage,
    nextPage,
    setPageIndex,
    setPageSize,
    state: { pageIndex, pageSize },
  } = pagination;

  if (rowCount === 0) {
    return null;
  }

  const pageItems = buildPageItems(pageIndex, pageCount);
  const currentPage = pageIndex + 1;
  const pageNumbers = buildPageRange(1, pageCount);
  const pageSelectId = 'search-results-pagination-page-select';
  const pageSizeSelectId = 'search-results-pagination-page-size-select';

  return (
    <div className="pagination-bar">
      <Stack
        direction="horizontal"
        className="justify-content-between align-items-center flex-wrap gap-3"
      >
        <Pagination className="pagination-bar__pages mb-0">
          <Pagination.Prev disabled={!canPreviousPage} onClick={previousPage}>
            <span aria-hidden="true">‹</span>
            <span className="visually-hidden">Previous page</span>
          </Pagination.Prev>
          {pageItems.map((item, index) =>
            item === 'ellipsis' ? (
              <Pagination.Ellipsis
                key={`ellipsis-${pageItems[index - 1]}-${pageItems[index + 1]}`}
                disabled
              />
            ) : (
              <Pagination.Item
                key={item}
                active={item === pageIndex}
                onClick={() => setPageIndex(item)}
              >
                {item + 1}
              </Pagination.Item>
            ),
          )}
          <Pagination.Next disabled={!canNextPage} onClick={nextPage}>
            <span aria-hidden="true">›</span>
            <span className="visually-hidden">Next page</span>
          </Pagination.Next>
        </Pagination>

        <Stack
          direction="horizontal"
          gap={2}
          className="pagination-bar__jump align-items-center"
        >
          <Form.Label
            htmlFor={pageSizeSelectId}
            className="pagination-bar__label mb-0"
          >
            Page size
          </Form.Label>
          <Form.Select
            id={pageSizeSelectId}
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            size="sm"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Form.Select>

          <Form.Label
            htmlFor={pageSelectId}
            className="pagination-bar__label mb-0"
          >
            Jump to
          </Form.Label>
          <Form.Select
            id={pageSelectId}
            value={currentPage}
            onChange={(event) => setPageIndex(Number(event.target.value) - 1)}
            size="sm"
          >
            {pageNumbers.map((pageNumber) => (
              <option key={pageNumber} value={pageNumber}>
                {pageNumber}
              </option>
            ))}
          </Form.Select>
        </Stack>
      </Stack>
    </div>
  );
}
