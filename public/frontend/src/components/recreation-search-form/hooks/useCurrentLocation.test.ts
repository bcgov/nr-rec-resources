import { vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCurrentLocation } from './useCurrentLocation';

describe('useCurrentLocation', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal('navigator', { geolocation: mockGeolocation });
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it('should set latitude and longitude on success and return coords', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) =>
      success({
        coords: { latitude: 48.4284, longitude: -123.3656 },
      }),
    );

    const { result } = renderHook(() => useCurrentLocation());

    let coords;
    await act(async () => {
      coords = await result.current.getLocation();
    });

    expect(coords).toEqual({ latitude: 48.4284, longitude: -123.3656 });

    await waitFor(() => {
      expect(result.current.latitude).toBe(48.4284);
      expect(result.current.longitude).toBe(-123.3656);
      expect(result.current.error).toBeUndefined();
    });
  });

  it('should set error and reset location on failure', async () => {
    const mockError = { message: 'User denied geolocation', code: 1 };

    mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error) =>
      error(mockError),
    );

    const { result } = renderHook(() => useCurrentLocation());

    await act(async () => {
      try {
        await result.current.getLocation();
      } catch {}
    });

    await waitFor(() => {
      expect(result.current.latitude).toBeNull();
      expect(result.current.longitude).toBeNull();
      expect(result.current.error).toBe('User denied geolocation');
    });
  });

  it('should handle geolocation not supported', async () => {
    vi.stubGlobal('navigator', { geolocation: undefined });

    const { result } = renderHook(() => useCurrentLocation());

    await act(async () => {
      try {
        await result.current.getLocation();
      } catch {}
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Geolocation not supported');
    });
  });

  it('should increment permissionDeniedCount on PERMISSION_DENIED error', async () => {
    const deniedError = { message: 'Permission denied', code: 1 }; // code 1 = PERMISSION_DENIED

    mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error) =>
      error(deniedError),
    );

    const { result } = renderHook(() => useCurrentLocation());

    await act(async () => {
      try {
        await result.current.getLocation();
      } catch {}
    });

    await waitFor(() => {
      expect(result.current.permissionDeniedCount).toBeGreaterThan(0);
    });
  });
});
