import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useMediaQuery from './useMediaQuery';

describe('useMediaQuery', () => {
  let matchMediaMock: any;

  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    matchMediaMock = window.matchMedia;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return true if the media query matches', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(min-width: 600px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(result.current).toBe(true);
  });

  it('should update state when media query changes', () => {
    let listener: (arg0: { matches: boolean }) => void;
    matchMediaMock.mockImplementation((query: string) => {
      return {
        matches: query === '(min-width: 600px)',
        addEventListener: (
          event: string,
          cb: (arg0: { matches: boolean }) => void,
        ) => {
          if (event === 'change') listener = cb;
        },
        removeEventListener: vi.fn(),
      };
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(result.current).toBe(true);

    act(() => {
      listener({ matches: false });
    });

    expect(result.current).toBe(false);
  });
});
