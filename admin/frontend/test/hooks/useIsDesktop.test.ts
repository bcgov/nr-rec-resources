import { useIsDesktop } from '@/hooks/useIsDesktop';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

type Listener = (event: MediaQueryListEvent) => void;

function createMatchMediaMock(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<Listener>();

  const mql = {
    get matches() {
      return matches;
    },
    media: '(min-width: 768px)',
    addEventListener: vi.fn((_: 'change', listener: Listener) => {
      listeners.add(listener);
    }),
    removeEventListener: vi.fn((_: 'change', listener: Listener) => {
      listeners.delete(listener);
    }),
  };

  return {
    matchMedia: vi.fn().mockReturnValue(mql),
    setMatches: (value: boolean) => {
      matches = value;
      listeners.forEach((listener) =>
        listener({ matches: value } as MediaQueryListEvent),
      );
    },
    mql,
  };
}

describe('useIsDesktop', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns true when the viewport matches the desktop breakpoint', () => {
    const { matchMedia } = createMatchMediaMock(true);
    window.matchMedia = matchMedia;

    const { result } = renderHook(() => useIsDesktop());

    expect(result.current).toBe(true);
  });

  it('returns false when the viewport does not match the desktop breakpoint', () => {
    const { matchMedia } = createMatchMediaMock(false);
    window.matchMedia = matchMedia;

    const { result } = renderHook(() => useIsDesktop());

    expect(result.current).toBe(false);
  });

  it('queries the Bootstrap md breakpoint', () => {
    const { matchMedia } = createMatchMediaMock(false);
    window.matchMedia = matchMedia;

    renderHook(() => useIsDesktop());

    expect(matchMedia).toHaveBeenCalledWith('(min-width: 768px)');
  });

  it('updates when the viewport crosses the breakpoint', () => {
    const { matchMedia, setMatches } = createMatchMediaMock(false);
    window.matchMedia = matchMedia;

    const { result } = renderHook(() => useIsDesktop());

    expect(result.current).toBe(false);

    act(() => {
      setMatches(true);
    });

    expect(result.current).toBe(true);
  });

  it('unsubscribes from the media query on unmount', () => {
    const { matchMedia, mql } = createMatchMediaMock(true);
    window.matchMedia = matchMedia;

    const { unmount } = renderHook(() => useIsDesktop());

    expect(mql.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );

    unmount();

    expect(mql.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });
});
