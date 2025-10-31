import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInitialPageFromSearchParams } from './useInitialPageFromSearchParams';
import * as router from '@tanstack/react-router';
import * as helpers from './helpers';

vi.mock('@tanstack/react-router', () => ({
  useSearch: vi.fn(),
  useNavigate: vi.fn(),
}));

vi.mock('./helpers', () => ({
  getFilterState: vi.fn(),
  haveFiltersChanged: vi.fn(),
}));

describe('useInitialPageFromSearchParams', () => {
  it('should reset page when filters change', () => {
    const navigate = vi.fn();
    const searchParams = { page: 2 };
    vi.mocked(router.useSearch).mockReturnValue(searchParams);
    vi.mocked(router.useNavigate).mockReturnValue(navigate);

    vi.mocked(helpers.getFilterState).mockReturnValueOnce({
      activities: 'hiking',
    });
    vi.mocked(helpers.haveFiltersChanged).mockReturnValue(true);

    const { result } = renderHook(() => useInitialPageFromSearchParams());

    expect(navigate).toHaveBeenCalledWith({
      search: expect.any(Function),
    });
    expect(result.current).toBe(1);
  });
});
