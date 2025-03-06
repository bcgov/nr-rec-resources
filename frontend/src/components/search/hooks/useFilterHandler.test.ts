import { describe, expect, it, Mock, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearchParams } from 'react-router-dom';
import { filterChipStore } from '@/store';
import useFilterHandler from '@/components/search/hooks/useFilterHandler';

vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(),
}));

vi.mock('@/store', () => ({
  filterChipStore: {
    setState: vi.fn(),
  },
}));

describe('useFilterHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should un-toggle a filter if isChecked is false', () => {
    const setSearchParams = vi.fn();
    const searchParams = new URLSearchParams({ page: '1', test: 'test' });
    (useSearchParams as Mock).mockReturnValue([searchParams, setSearchParams]);

    const { result } = renderHook(() => useFilterHandler());

    act(() => {
      result.current.toggleFilter({ id: '1', label: 'test', param: 'test' });
    });

    expect(setSearchParams).toHaveBeenCalledWith(searchParams);

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
    const setSearchParams = vi.fn();
    const searchParams = new URLSearchParams();
    (useSearchParams as Mock).mockReturnValue([searchParams, setSearchParams]);

    const { result } = renderHook(() => useFilterHandler());

    act(() => {
      result.current.toggleFilter(
        { id: '1', label: 'test', param: 'test' },
        true,
      );
    });

    expect(setSearchParams).toHaveBeenCalled();
    expect(setSearchParams.mock.calls[0][0]).toEqual(
      expect.any(URLSearchParams),
    );

    expect(filterChipStore.setState).toHaveBeenCalled();

    const updater = (filterChipStore.setState as Mock).mock.calls[0][0];
    const prevState: { id: string; label: string; param: string }[] = [];
    const newState = updater(prevState);

    expect(newState).toEqual([{ id: '1', label: 'test', param: 'test' }]);
  });
});
