import { describe, expect, it, Mock, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { filterChipStore } from '@/store';
import { useFilterHandler } from '@/components/search/hooks/useFilterHandler';

vi.mock('@tanstack/react-router', () => ({
  useSearch: vi.fn(),
  useNavigate: vi.fn(),
}));

vi.mock('@/store', () => ({
  filterChipStore: {
    setState: vi.fn(),
    state: [],
  },
}));

vi.mock('@/utils/removeFilter', () => ({
  default: vi.fn(),
}));

vi.mock('@shared/utils', () => ({
  trackEvent: vi.fn(),
}));

describe('useFilterHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should un-toggle a filter if isChecked is false', () => {
    const navigate = vi.fn();
    const searchParams = { page: 1, test: 'test' };
    (useSearch as Mock).mockReturnValue(searchParams);
    (useNavigate as Mock).mockReturnValue(navigate);

    const { result } = renderHook(() => useFilterHandler());

    act(() => {
      result.current.toggleFilter({ id: '1', label: 'test', param: 'test' });
    });

    expect(navigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/search',
        search: expect.any(Function),
      }),
    );

    expect(filterChipStore.setState).toHaveBeenCalled();

    const updater = (filterChipStore.setState as Mock).mock.calls[0][0];
    const prevState = [
      { id: '1', label: 'test', param: 'test' },
      { id: '2', label: 'test', param: 'test' },
    ];
    const newState = updater(prevState);

    expect(newState).toEqual([{ id: '2', label: 'test', param: 'test' }]);
  });

  it('should toggle a filter with isChecked', () => {
    const navigate = vi.fn();
    const searchParams = {};
    (useSearch as Mock).mockReturnValue(searchParams);
    (useNavigate as Mock).mockReturnValue(navigate);

    const { result } = renderHook(() => useFilterHandler());

    act(() => {
      result.current.toggleFilter(
        { id: '1', label: 'test', param: 'test' },
        true,
      );
    });

    expect(navigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/search',
        search: expect.any(Function),
      }),
    );

    expect(filterChipStore.setState).toHaveBeenCalled();

    const updater = (filterChipStore.setState as Mock).mock.calls[0][0];
    const prevState: { id: string; label: string; param: string }[] = [];
    const newState = updater(prevState);

    expect(newState).toEqual([{ id: '1', label: 'test', param: 'test' }]);
  });
});
