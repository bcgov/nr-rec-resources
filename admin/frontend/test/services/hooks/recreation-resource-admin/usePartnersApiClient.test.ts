import { PartnersApi } from '@/services/recreation-resource-admin';
import { usePartnersApiClient } from '@/services/hooks/recreation-resource-admin/usePartnersApiClient';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

describe('usePartnersApiClient', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_BASE_URL', 'https://example.com/api');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns an PartnersApi instance with the correct base path', async () => {
    const mockGetToken = vi.fn().mockResolvedValue('mock-token');

    const { useAuthContext } = await import('@/contexts/AuthContext');
    (useAuthContext as Mock).mockReturnValue({
      authService: { getToken: mockGetToken },
    });

    const { result } = renderHook(() => usePartnersApiClient());

    expect(result.current).toBeInstanceOf(PartnersApi);

    const config = result.current['configuration'];
    expect(config.basePath).toBe('https://example.com');

    const token = await config.accessToken?.();
    expect(token).toBe('mock-token');
    expect(mockGetToken).toHaveBeenCalled();
  });

  it('falls back to an empty basePath if VITE_API_BASE_URL is not set', async () => {
    vi.stubEnv('VITE_API_BASE_URL', undefined);

    const mockGetToken = vi.fn().mockResolvedValue('another-token');
    const { useAuthContext } = await import('@/contexts/AuthContext');
    (useAuthContext as Mock).mockReturnValue({
      authService: { getToken: mockGetToken },
    });

    const { result } = renderHook(() => usePartnersApiClient());

    const config = result.current['configuration'];
    expect(config.basePath).toBe('');
    const token = await config.accessToken?.();
    expect(token).toBe('another-token');
  });
});
