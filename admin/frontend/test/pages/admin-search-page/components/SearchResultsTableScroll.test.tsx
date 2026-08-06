import { act, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchResultsTable } from '@/pages/search/components/SearchResultsTable';
import { useSearchResultsTableScroll } from '@/pages/search/hooks/useSearchResultsTableScroll';
import { AdminSearchResultRow } from '@/pages/search/types';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/hooks/useAuthorizations', () => ({
  useAuthorizations: () => ({ canViewFeatureFlag: false }),
}));

function createPagination() {
  return {
    state: { pageIndex: 0, pageSize: 25 },
    pageCount: 1,
    rowCount: 1,
    canPreviousPage: false,
    canNextPage: false,
    pageSizeOptions: [25, 50, 100],
    setPageIndex: vi.fn(),
    setPageSize: vi.fn(),
    previousPage: vi.fn(),
    nextPage: vi.fn(),
  };
}

const ROWS: AdminSearchResultRow[] = [
  {
    recResourceId: 'REC001',
    projectName: 'Blue Lake',
    recreationResourceType: 'Recreation site',
    district: 'Chilliwack',
    establishmentDate: '2024-06-10',
    accessType: 'Walk in',
    feeType: 'Reservable',
    definedCampsites: '3',
    closestCommunity: 'Hope',
    status: 'Open',
    statusCode: 1,
    visible: true,
    publicAccessStatus: null,
  },
];

// jsdom performs no layout, so scroll/size metrics must be faked. These helpers
// install controllable getters (and a real read/write scrollLeft) per element.
function mockMetric(el: Element, prop: string, value: number) {
  Object.defineProperty(el, prop, { configurable: true, get: () => value });
}

function mockScrollLeft(el: Element, initial = 0) {
  let current = initial;
  Object.defineProperty(el, 'scrollLeft', {
    configurable: true,
    get: () => current,
    set: (next: number) => {
      current = next;
    },
  });
}

function renderTable() {
  const view = render(
    <SearchResultsTable
      rows={ROWS}
      visibleColumns={[
        'rec_resource_id',
        'name',
        'recreation_resource_type',
        'district',
      ]}
      sort="name:asc"
      pagination={createPagination()}
      isLoading={false}
      onSortChange={vi.fn()}
    />,
  );
  const container = view.container;
  return {
    ...view,
    wrapper: container.querySelector('.search-results-table') as HTMLElement,
    topScroll: container.querySelector(
      '.search-results-table__top-scroll',
    ) as HTMLElement,
    spacer: container.querySelector(
      '.search-results-table__top-scroll-spacer',
    ) as HTMLElement,
    viewport: container.querySelector(
      '.search-results-table__viewport',
    ) as HTMLElement,
    table: container.querySelector('table.results-table') as HTMLElement,
  };
}

const STICKY_WIDTHS: Record<string, number> = {
  rec_resource_id: 100,
  name: 200,
};

// Give the frozen header cells fixed widths so the cumulative left offsets are
// deterministic, then (re)run the hook's measurement via a resize event.
function primeLayout(
  elements: ReturnType<typeof renderTable>,
  {
    scrollWidth = 1000,
    clientWidth = 400,
    scrollLeft = 0,
  }: { scrollWidth?: number; clientWidth?: number; scrollLeft?: number } = {},
) {
  const { table, viewport, topScroll } = elements;

  Object.entries(STICKY_WIDTHS).forEach(([id, width]) => {
    const headerCell = table.querySelector(
      `thead th.results-table__column--${id}`,
    ) as HTMLElement;
    vi.spyOn(headerCell, 'getBoundingClientRect').mockReturnValue({
      width,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
  });

  mockMetric(table, 'scrollWidth', scrollWidth);
  mockMetric(viewport, 'scrollWidth', scrollWidth);
  mockMetric(viewport, 'clientWidth', clientWidth);
  mockScrollLeft(viewport, scrollLeft);
  mockScrollLeft(topScroll, 0);

  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
}

describe('SearchResultsTable horizontal scroll affordances', () => {
  beforeEach(() => {
    // Run the sync guard's rAF reset synchronously so consecutive scroll events
    // in a test are not swallowed by the reentrancy guard.
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders both scrollbars, the spacer and all edge fades', () => {
    const { container, wrapper, topScroll, spacer, viewport } = renderTable();

    expect(wrapper).toBeInTheDocument();
    expect(topScroll).toBeInTheDocument();
    expect(spacer).toBeInTheDocument();
    expect(viewport).toBeInTheDocument();
    expect(
      container.querySelector('.search-results-table__fade--left'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.search-results-table__freeze-divider'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.search-results-table__fade--right'),
    ).toBeInTheDocument();
  });

  it('measures frozen columns and sizes the top spacer to the table width', () => {
    const elements = renderTable();
    primeLayout(elements);
    const { table, wrapper, spacer } = elements;

    expect(spacer.style.width).toBe('1000px');
    expect(table.style.getPropertyValue('--sticky-left-rec_resource_id')).toBe(
      '0px',
    );
    expect(table.style.getPropertyValue('--sticky-left-name')).toBe('100px');
    // recreation_resource_type is no longer frozen, so it gets no offset var.
    expect(
      table.style.getPropertyValue('--sticky-left-recreation_resource_type'),
    ).toBe('');
    expect(wrapper.style.getPropertyValue('--sticky-total-width')).toBe(
      '300px',
    );
  });

  it('flags "more to the right" at the start of the scroll range', () => {
    const elements = renderTable();
    primeLayout(elements, { scrollLeft: 0 });

    expect(
      elements.wrapper.classList.contains('search-results-table--scroll-right'),
    ).toBe(true);
    expect(
      elements.wrapper.classList.contains('search-results-table--scroll-left'),
    ).toBe(false);
  });

  it('flags both edges in the middle and syncs the top scrollbar', () => {
    const elements = renderTable();
    primeLayout(elements, { scrollLeft: 0 });
    const { wrapper, viewport, topScroll } = elements;

    viewport.scrollLeft = 300;
    act(() => {
      viewport.dispatchEvent(new Event('scroll'));
    });

    expect(
      wrapper.classList.contains('search-results-table--scroll-left'),
    ).toBe(true);
    expect(
      wrapper.classList.contains('search-results-table--scroll-right'),
    ).toBe(true);
    // Top bar mirrors the viewport's scroll position.
    expect(topScroll.scrollLeft).toBe(300);
  });

  it('flags "more to the left" only at the far right edge', () => {
    const elements = renderTable();
    primeLayout(elements, { scrollLeft: 0 });
    const { wrapper, viewport } = elements;

    viewport.scrollLeft = 600;
    act(() => {
      viewport.dispatchEvent(new Event('scroll'));
    });

    expect(
      wrapper.classList.contains('search-results-table--scroll-left'),
    ).toBe(true);
    expect(
      wrapper.classList.contains('search-results-table--scroll-right'),
    ).toBe(false);
  });

  it('scrolls the viewport when the top scrollbar is moved', () => {
    const elements = renderTable();
    primeLayout(elements, { scrollLeft: 0 });
    const { viewport, topScroll } = elements;

    topScroll.scrollLeft = 250;
    act(() => {
      topScroll.dispatchEvent(new Event('scroll'));
    });

    expect(viewport.scrollLeft).toBe(250);
  });

  it('shows no scroll indicators when the table fits the viewport', () => {
    const elements = renderTable();
    primeLayout(elements, { scrollWidth: 300, clientWidth: 400 });

    expect(
      elements.wrapper.classList.contains('search-results-table--scroll-left'),
    ).toBe(false);
    expect(
      elements.wrapper.classList.contains('search-results-table--scroll-right'),
    ).toBe(false);
  });

  it('ignores a second scroll while a sync is already in flight', () => {
    // Do not release the reentrancy guard, so the second scroll is dropped.
    vi.mocked(window.requestAnimationFrame).mockImplementation(() => 0);

    const elements = renderTable();
    primeLayout(elements, { scrollLeft: 0 });
    const { viewport, topScroll } = elements;

    viewport.scrollLeft = 100;
    act(() => viewport.dispatchEvent(new Event('scroll')));
    expect(topScroll.scrollLeft).toBe(100);

    // Guard is still held (rAF never ran), so this update is not mirrored.
    viewport.scrollLeft = 200;
    act(() => viewport.dispatchEvent(new Event('scroll')));
    expect(topScroll.scrollLeft).toBe(100);
  });

  it('no-ops safely when its refs are never attached to the DOM', () => {
    // Exercises the early-return guards when the viewport/table refs are null.
    const { result } = renderHook(() => useSearchResultsTableScroll('key'));

    expect(result.current.canScrollLeft).toBe(false);
    expect(result.current.canScrollRight).toBe(false);
  });
});
