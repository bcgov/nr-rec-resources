import { vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCurrentLocation } from './useCurrentLocation';
import currentLocationStore from '@/store/currentLocationStore';

describe('useCurrentLocation', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal('navigator', { geolocation: mockGeolocation });

    currentLocationStore.setState((prev) => ({
      ...prev,
      latitude: null,
      longitude: null,
      error: undefined,
      permissionDeniedCount: 0,
    }));
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
      expect(result.current.permissionDeniedCount).toBe(0);
    });
  });

  it('should set error and reset location on general error', async () => {
    const mockError = { message: 'Something went wrong', code: 2 }; // Not PERMISSION_DENIED

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
      expect(result.current.error).toBe('Something went wrong');
      expect(result.current.permissionDeniedCount).toBe(0);
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
      expect(result.current.latitude).toBeNull();
      expect(result.current.longitude).toBeNull();
    });
  });

  it('should increment permissionDeniedCount on PERMISSION_DENIED error', async () => {
    const deniedError = {
      message: 'Permission denied',
      code: 1,
      PERMISSION_DENIED: 1,
    };

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
      expect(result.current.permissionDeniedCount).toBe(1);
      expect(result.current.error).toBe('Permission denied');
    });
  });
});
