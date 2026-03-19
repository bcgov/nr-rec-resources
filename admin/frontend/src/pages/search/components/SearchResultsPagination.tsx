import { Form, Pagination, Stack } from 'react-bootstrap';
import type { SearchResultsPaginationModel } from '@/pages/search/hooks/useAdminSearchController';
import './SearchResultsPagination.scss';

interface SearchResultsPaginationProps {
  pagination: SearchResultsPaginationModel;
}

type PageItem = number | 'ellipsis';

const buildPageRange = (start: number, end: number) =>
  Array.from(
    { length: Math.max(end - start + 1, 0) },
    (_, index) => start + index,
  );

function buildPageItems(pageIndex: number, pageCount: number): PageItem[] {
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
            Page Size
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
            Jump To
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
