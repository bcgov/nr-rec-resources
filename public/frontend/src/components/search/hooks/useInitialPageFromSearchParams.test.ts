import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInitialPageFromSearchParams } from './useInitialPageFromSearchParams';
import * as router from 'react-router-dom';
import * as helpers from './helpers';

vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(),
}));

vi.mock('./helpers', () => ({
  getFilterState: vi.fn(),
  haveFiltersChanged: vi.fn(),
}));

describe('useInitialPageFromSearchParams', () => {
  it('should reset page when filters change', () => {
    const setSearchParams = vi.fn();
    const searchParams = new URLSearchParams({ page: '2' });
    vi.mocked(router.useSearchParams).mockReturnValue([
      searchParams,
      setSearchParams,
    ]);

    vi.mocked(helpers.getFilterState).mockReturnValueOnce({
      activities: 'hiking',
    });
    vi.mocked(helpers.haveFiltersChanged).mockReturnValue(true);

    const { result } = renderHook(() => useInitialPageFromSearchParams());

    expect(setSearchParams).toHaveBeenCalled();
    expect(result.current).toBe(1);
  });
});
