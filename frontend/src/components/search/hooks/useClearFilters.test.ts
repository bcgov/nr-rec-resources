import { describe, expect, it, Mock, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearchParams } from 'react-router-dom';
import { filterChipStore } from '@/store';
import useClearFilters from '@/components/search/hooks/useClearFilters';

vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(),
}));

vi.mock('@/store', () => ({
  filterChipStore: {
    setState: vi.fn(),
  },
}));

describe('useClearFilters', () => {
  it('should clear filters and reset searchParams', () => {
    const setSearchParams = vi.fn();
    const searchParams = new URLSearchParams({
      page: '1',
      activities: 'test',
      type: 'test',
      district: 'test',
    });

    (useSearchParams as Mock).mockReturnValue([searchParams, setSearchParams]);

    const { result } = renderHook(() => useClearFilters());

    act(() => {
      result.current();
    });

    expect(setSearchParams).toHaveBeenCalledWith(
      new URLSearchParams({ page: '1' }),
    );

    expect(filterChipStore.setState).toHaveBeenCalled();
  });

  it('should not remove the page or filter params', () => {
    const setSearchParams = vi.fn();
    const searchParams = new URLSearchParams({
      page: '1',
      filter: 'test',
      activities: 'test',
      type: 'test',
      district: 'test',
    });

    (useSearchParams as Mock).mockReturnValue([searchParams, setSearchParams]);

    const { result } = renderHook(() => useClearFilters());

    act(() => {
      result.current();
    });

    expect(setSearchParams).toHaveBeenCalledWith(
      new URLSearchParams({ page: '1', filter: 'test' }),
    );

    expect(filterChipStore.setState).toHaveBeenCalled();
  });
});
