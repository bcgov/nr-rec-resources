import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useMediaQuery from './useMediaQuery';

describe('useMediaQuery', () => {
  let matchMediaMock: any;

  beforeEach(() => {
    matchMediaMock = vi.spyOn(window, 'matchMedia');
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
