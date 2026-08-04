import { useCallback, useEffect, useRef, useState } from 'react';
import { STICKY_COLUMN_IDS } from '@/pages/search/searchDefinitions';

interface ScrollIndicatorState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

// Treat sub-pixel scroll offsets as "at the edge" so the fade indicators don't
// flicker on fractional scroll positions or high-DPI rounding.
const EDGE_THRESHOLD_PX = 1;

/**
 * Wires up the horizontal-scroll properties for the search results table:
 *
 * - keeps a top scrollbar in sync with the real bottom scroller, so
 *   users can discover and drive horizontal scrolling from the top of the table,
 * - measures the frozen columns and exposes their cumulative left offsets as
 *   `--sticky-left-<columnId>` CSS variables so the SCSS can pin them, and
 * - reports whether more content exists to the left/right so the caller can
 *   toggle the edge indicators.
 *
 * `resetKey` should change whenever the rendered columns or rows change, so the
 * measurements are recomputed after the layout settles.
 */
export function useSearchResultsTableScroll(resetKey: string) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const topSpacerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const isSyncingRef = useRef(false);

  const [indicators, setIndicators] = useState<ScrollIndicatorState>({
    canScrollLeft: false,
    canScrollRight: false,
  });

  const updateIndicators = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = viewport;
    const maxScrollLeft = scrollWidth - clientWidth;

    setIndicators((current) => {
      const next = {
        canScrollLeft: scrollLeft > EDGE_THRESHOLD_PX,
        canScrollRight: scrollLeft < maxScrollLeft - EDGE_THRESHOLD_PX,
      };

      return current.canScrollLeft === next.canScrollLeft &&
        current.canScrollRight === next.canScrollRight
        ? current
        : next;
    });
  }, []);

  const measure = useCallback(() => {
    const table = tableRef.current;
    if (!table) {
      return;
    }

    // Compute cumulative left offsets for the frozen columns from their actual
    // rendered widths, skipping any that are currently hidden. rec_resource_id
    // always resolves to 0; the rest stack up after the visible ones.
    let offset = 0;
    STICKY_COLUMN_IDS.forEach((columnId) => {
      table.style.setProperty(`--sticky-left-${columnId}`, `${offset}px`);
      const headerCell = table.querySelector<HTMLElement>(
        `thead th.results-table__column--${columnId}`,
      );
      if (headerCell) {
        offset += headerCell.getBoundingClientRect().width;
      }
    });

    // Total width of the frozen region, used to position the freeze-boundary
    // fade overlay at the right edge of the sticky columns.
    wrapperRef.current?.style.setProperty(
      '--sticky-total-width',
      `${offset}px`,
    );

    // Size the (otherwise empty) top scrollbar to match the table's full width
    // so its thumb tracks the same range as the bottom scroller.
    if (topSpacerRef.current) {
      topSpacerRef.current.style.width = `${table.scrollWidth}px`;
    }

    updateIndicators();
  }, [updateIndicators]);

  // Recompute after the column set / rows change and the DOM has painted.
  useEffect(() => {
    measure();
  }, [measure, resetKey]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const topScroll = topScrollRef.current;
    if (!viewport || !topScroll) {
      return;
    }

    // Mirror scrollLeft between the two bars. The reentrancy guard is released on
    // the next frame so the programmatic scroll doesn't ping-pong between them.
    const syncScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
      if (isSyncingRef.current) {
        return;
      }
      isSyncingRef.current = true;
      target.scrollLeft = source.scrollLeft;
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
    };

    const handleViewportScroll = () => {
      syncScroll(viewport, topScroll);
      updateIndicators();
    };
    const handleTopScroll = () => {
      syncScroll(topScroll, viewport);
    };

    viewport.addEventListener('scroll', handleViewportScroll, {
      passive: true,
    });
    topScroll.addEventListener('scroll', handleTopScroll, { passive: true });
    window.addEventListener('resize', measure);

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => measure());
      resizeObserver.observe(viewport);
      if (tableRef.current) {
        resizeObserver.observe(tableRef.current);
      }
    }

    measure();

    return () => {
      viewport.removeEventListener('scroll', handleViewportScroll);
      topScroll.removeEventListener('scroll', handleTopScroll);
      window.removeEventListener('resize', measure);
      resizeObserver?.disconnect();
    };
  }, [measure, updateIndicators]);

  return {
    wrapperRef,
    topScrollRef,
    topSpacerRef,
    viewportRef,
    tableRef,
    canScrollLeft: indicators.canScrollLeft,
    canScrollRight: indicators.canScrollRight,
  };
}
