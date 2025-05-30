import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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

  it('should set latitude and longitude on success', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) =>
      success({
        coords: { latitude: 48.4284, longitude: -123.3656 },
      }),
    );

    const { result } = renderHook(() => useCurrentLocation());

    act(() => {
      result.current.getLocation();
    });

    expect(result.current.latitude).toBe(48.4284);
    expect(result.current.longitude).toBe(-123.3656);
    expect(result.current.error).toBeUndefined();
  });

  it('should set error and disable location on failure', () => {
    const mockError = { message: 'User denied geolocation' };

    mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error) =>
      error(mockError),
    );

    const { result } = renderHook(() => useCurrentLocation());

    act(() => {
      result.current.getLocation();
    });

    expect(result.current.latitude).toBeNull();
    expect(result.current.longitude).toBeNull();
    expect(result.current.error).toBe('User denied geolocation');
  });

  it('should handle geolocation not supported', () => {
    vi.stubGlobal('navigator', { geolocation: undefined });

    const { result } = renderHook(() => useCurrentLocation());

    act(() => {
      result.current.getLocation();
    });

    expect(result.current.error).toBe('Geolocation not supported');
  });
});
