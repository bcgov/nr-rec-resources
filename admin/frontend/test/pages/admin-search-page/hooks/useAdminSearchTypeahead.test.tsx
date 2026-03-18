import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminSearchTypeahead } from '@/pages/admin-search-page/hooks/useAdminSearchTypeahead';

const mockUseGetRecreationResourceSuggestions = vi.fn();
const mockIsValidRecreationResourceSearchTerm = vi.fn();

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceSuggestions',
  () => ({
    useGetRecreationResourceSuggestions: (searchTerm: string) =>
      mockUseGetRecreationResourceSuggestions(searchTerm),
    isValidRecreationResourceSearchTerm: (searchTerm: unknown) =>
      mockIsValidRecreationResourceSearchTerm(searchTerm),
  }),
);

describe('useAdminSearchTypeahead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();

    mockUseGetRecreationResourceSuggestions.mockReturnValue({
      data: { suggestions: [] },
      isFetching: false,
      error: null,
    });
    mockIsValidRecreationResourceSearchTerm.mockReturnValue(true);
  });

  it('prefers the committed query over a persisted draft on load', () => {
    window.sessionStorage.setItem('admin-search-draft-query', 'draft lake');

    const { result } = renderHook(() => useAdminSearchTypeahead('committed'));

    expect(result.current.inputValue).toBe('committed');
    expect(window.sessionStorage.getItem('admin-search-draft-query')).toBe(
      'committed',
    );
    expect(mockUseGetRecreationResourceSuggestions).toHaveBeenCalledWith(
      'committed',
    );
  });

  it('syncs the draft state when the committed query changes later', () => {
    window.sessionStorage.setItem('admin-search-draft-query', 'draft lake');

    const { result, rerender } = renderHook(
      ({ committedQuery }) => useAdminSearchTypeahead(committedQuery),
      {
        initialProps: { committedQuery: 'committed' },
      },
    );

    rerender({ committedQuery: 'ridge' });

    expect(result.current.inputValue).toBe('ridge');
    expect(window.sessionStorage.getItem('admin-search-draft-query')).toBe(
      'ridge',
    );
    expect(mockUseGetRecreationResourceSuggestions).toHaveBeenLastCalledWith(
      'ridge',
    );
  });

  it('persists draft edits separately from the committed query', () => {
    const { result } = renderHook(() => useAdminSearchTypeahead('committed'));

    act(() => {
      result.current.setInputValue('draft ridge');
    });

    expect(result.current.inputValue).toBe('draft ridge');
    expect(window.sessionStorage.getItem('admin-search-draft-query')).toBe(
      'draft ridge',
    );
    expect(mockUseGetRecreationResourceSuggestions).toHaveBeenLastCalledWith(
      'draft ridge',
    );
  });
});
