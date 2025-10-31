import { renderHook, waitFor } from '@testing-library/react';
import { Mock, vi } from 'vitest';
import { useGetRecreationResourceSuggestions } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceSuggestions';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { TestQueryClientProvider } from '@test/test-utils';

// --- Mocks ---
vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(() => vi.fn()), // mock as a function returning a function
}));

const mockGetSuggestions = vi.fn();

// --- Helpers ---
const renderSuggestionsHook = (searchTerm: string) =>
  renderHook(() => useGetRecreationResourceSuggestions(searchTerm), {
    wrapper: TestQueryClientProvider,
  });

const setMockSuggestions = (value: any, isError = false) => {
  if (isError) {
    mockGetSuggestions.mockRejectedValueOnce(value);
  } else {
    mockGetSuggestions.mockResolvedValue(value);
  }
};

// --- Tests ---
describe('useGetRecreationResourceSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceAdminApiClient as Mock).mockReturnValue({
      getRecreationResourceSuggestions: mockGetSuggestions,
    });
  });

  it('does not fetch if search term is invalid', () => {
    const { result } = renderSuggestionsHook('  ');
    expect(result.current.data).toEqual({ total: 0, suggestions: [] });
    expect(mockGetSuggestions).not.toHaveBeenCalled();
  });

  it('fetches data when search term is valid', async () => {
    setMockSuggestions({
      total: 1,
      suggestions: [{ id: '1', name: 'Park' }],
    });

    const { result } = renderSuggestionsHook('Park');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(mockGetSuggestions).toHaveBeenCalledWith({ searchTerm: 'Park' });
      expect(result.current.data).toEqual({
        total: 1,
        suggestions: [{ id: '1', name: 'Park' }],
      });
    });
  });

  it('returns initialData immediately', () => {
    const { result } = renderSuggestionsHook('Valid');
    expect(result.current.data).toEqual({ total: 0, suggestions: [] });
  });
});
