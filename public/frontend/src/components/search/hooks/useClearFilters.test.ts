import { describe, expect, it, Mock, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { filterChipStore } from '@/store';
import { useClearFilters } from '@/components/search/hooks/useClearFilters';

vi.mock('@tanstack/react-router', () => ({
  useSearch: vi.fn(),
  useNavigate: vi.fn(),
}));

vi.mock('@/store', () => ({
  filterChipStore: {
    setState: vi.fn(),
  },
}));

describe('useClearFilters', () => {
  it('should clear filters and reset searchParams', () => {
    const navigate = vi.fn();
    const searchParams = {
      page: '1',
      activities: 'test',
      type: 'test',
      district: 'test',
    };

    (useSearch as Mock).mockReturnValue(searchParams);
    (useNavigate as Mock).mockReturnValue(navigate);

    const { result } = renderHook(() => useClearFilters());

    act(() => {
      result.current();
    });

    expect(navigate).toHaveBeenCalledWith({
      search: expect.any(Function),
    });

    expect(filterChipStore.setState).toHaveBeenCalled();
  });

  it('should not remove the page or filter params', () => {
    const navigate = vi.fn();
    const searchParams = {
      page: '1',
      filter: 'test',
      activities: 'test',
      type: 'test',
      district: 'test',
    };

    (useSearch as Mock).mockReturnValue(searchParams);
    (useNavigate as Mock).mockReturnValue(navigate);

    const { result } = renderHook(() => useClearFilters());

    act(() => {
      result.current();
    });

    expect(navigate).toHaveBeenCalledWith({
      search: expect.any(Function),
    });

    expect(filterChipStore.setState).toHaveBeenCalled();
  });
});
