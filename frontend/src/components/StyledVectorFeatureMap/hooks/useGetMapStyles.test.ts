import { describe, expect, it, vi } from 'vitest';
import { TestQueryClientProvider } from '@/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import { useGetMapStyles } from '@/components/StyledVectorFeatureMap/hooks';

describe('useGetMapStyles', () => {
  const mockMapStyleData = {
    style: 'test-style',
  };

  it('should fetch map styles successfully', async () => {
    // Mock fetch response
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockMapStyleData),
    });

    const { result } = renderHook(() => useGetMapStyles(), {
      wrapper: TestQueryClientProvider,
    });

    // Verify successful query
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify API call
    expect(fetch).toHaveBeenCalledWith(
      'https://www.arcgis.com/sharing/rest/content/items/b1624fea73bd46c681fab55be53d96ae/resources/styles/root.json',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );

    // Verify response data
    expect(result.current.data).toEqual(mockMapStyleData);
  });

  it('should handle fetch error gracefully', async () => {
    // Mock fetch error
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Fetch failed'));

    const { result } = renderHook(() => useGetMapStyles(), {
      wrapper: TestQueryClientProvider,
    });

    // Verify error handling
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
