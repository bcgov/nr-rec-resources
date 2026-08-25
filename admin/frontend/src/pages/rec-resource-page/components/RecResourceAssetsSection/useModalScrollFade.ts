import { useCallback, useRef, useState } from 'react';

interface ScrollFadeState {
  canScrollUp: boolean;
  canScrollDown: boolean;
}

// Treat sub-pixel scroll offsets as "at the edge" so the fade indicators don't
// flicker on fractional scroll positions or high-DPI rounding.
const EDGE_THRESHOLD_PX = 1;

/**
 * Tracks whether a vertically-scrolling element has hidden content above/below
 * its visible viewport, so a caller can show/hide top/bottom edge-fade
 * overlays — the vertical counterpart of useSearchResultsTableScroll's
 * left/right indicators.
 *
 * `scrollRef` goes on the scrolling element itself; `contentRef` goes on its
 * (unclamped) content wrapper so growth from added/removed content — not just
 * user scrolling — is picked up too. Both are callback refs rather than plain
 * `useRef`s: react-bootstrap's `Modal` unmounts/remounts its content every
 * time it closes and reopens, and a one-shot `useEffect` would keep its
 * listeners attached to the first render's now-detached nodes after that.
 * Callback refs re-fire on every mount, so listeners always track the live
 * DOM node.
 */
export function useModalScrollFade() {
  const scrollElRef = useRef<HTMLDivElement | null>(null);
  const contentElRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<() => void>(() => {});

  const [state, setState] = useState<ScrollFadeState>({
    canScrollUp: false,
    canScrollDown: false,
  });

  const updateState = useCallback(() => {
    const el = scrollElRef.current;
    if (!el) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScrollTop = scrollHeight - clientHeight;

    setState((current) => {
      const next = {
        canScrollUp: scrollTop > EDGE_THRESHOLD_PX,
        canScrollDown: scrollTop < maxScrollTop - EDGE_THRESHOLD_PX,
      };

      return current.canScrollUp === next.canScrollUp &&
        current.canScrollDown === next.canScrollDown
        ? current
        : next;
    });
  }, []);

  const attach = useCallback(() => {
    cleanupRef.current();

    const scrollEl = scrollElRef.current;
    if (!scrollEl) {
      cleanupRef.current = () => {};
      return;
    }

    scrollEl.addEventListener('scroll', updateState, { passive: true });
    window.addEventListener('resize', updateState);

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateState());
      resizeObserver.observe(scrollEl);
      if (contentElRef.current) {
        resizeObserver.observe(contentElRef.current);
      }
    }

    updateState();

    cleanupRef.current = () => {
      scrollEl.removeEventListener('scroll', updateState);
      window.removeEventListener('resize', updateState);
      resizeObserver?.disconnect();
    };
  }, [updateState]);

  const scrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      scrollElRef.current = node;
      attach();
    },
    [attach],
  );

  const contentRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentElRef.current = node;
      attach();
    },
    [attach],
  );

  return {
    scrollRef,
    contentRef,
    canScrollUp: state.canScrollUp,
    canScrollDown: state.canScrollDown,
  };
}
