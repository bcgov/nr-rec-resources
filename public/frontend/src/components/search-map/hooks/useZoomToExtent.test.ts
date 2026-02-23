import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import OLMap from 'ol/Map';
import { useZoomToExtent } from '@/components/search-map/hooks/useZoomToExtent';
import { transformExtent } from 'ol/proj';

vi.mock('ol/proj', () => ({
  transformExtent: vi.fn(() => [0, 0, 100, 100]),
}));

vi.mock('ol/format/GeoJSON', () => {
  return {
    default: vi.fn().mockImplementation(function () {
      return {
        readGeometry: vi.fn().mockReturnValue({
          getExtent: vi.fn().mockReturnValue([1, 2, 3, 4]),
        }),
      };
    }),
  };
});

const mockUseSearchParams = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useSearch: () => mockUseSearchParams(),
  };
});

vi.mock('@tanstack/react-store', () => ({
  useStore: vi.fn(() => ({ wasCleared: false })),
}));

vi.mock('@/store/searchInputStore', () => ({
  default: { setState: vi.fn() },
}));

// ---- Fake OL Map & View ----
const mockView = {
  getZoom: vi.fn(() => 10),
  setZoom: vi.fn(),
  setCenter: vi.fn(),
  fit: vi.fn(),
};

describe('useZoomToExtent', () => {
  const extentGeoJSON = JSON.stringify({
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 0],
      ],
    ],
  });

  const differentExtentGeoJSON = JSON.stringify({
    type: 'Polygon',
    coordinates: [
      [
        [1, 1],
        [2, 1],
        [2, 2],
        [1, 2],
        [1, 1],
      ],
    ],
  });

  let fit: ReturnType<typeof vi.fn>;
  let setZoom: ReturnType<typeof vi.fn>;
  let onMoveEnd: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fit = vi.fn();
    setZoom = vi.fn();
    onMoveEnd = vi.fn((_event: string, cb: () => void) => cb());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createMapMock = (width: number, height: number) =>
    ({
      getView: () => ({
        fit,
        getZoom: () => 10,
        setZoom,
      }),
      once: onMoveEnd,
      getSize: () => [width, height],
    }) as unknown as OLMap;

  it('zooms to the provided extent on desktop', () => {
    mockUseSearchParams.mockReturnValue('filter=abc');

    const mapRef = { current: { getMap: () => createMapMock(1200, 800) } };

    const { rerender } = renderHook(
      ({ extent }) => useZoomToExtent(mapRef, extent),
      { initialProps: { extent: extentGeoJSON } },
    );

    // First call should be skipped due to initial load check
    expect(fit).not.toHaveBeenCalled();

    // Second call should trigger the zoom when extent changes
    rerender({ extent: differentExtentGeoJSON });
    expect(fit).toHaveBeenCalledWith([0, 0, 100, 100], {
      padding: [140, 120, 120, 120],
      maxZoom: 16,
      duration: 500,
    });

    expect(transformExtent).toHaveBeenCalledWith(
      [1, 2, 3, 4],
      'EPSG:3005',
      'EPSG:3857',
    );

    expect(setZoom).toHaveBeenCalledWith(10.01);
    expect(onMoveEnd).toHaveBeenCalled();
  });

  it('zooms to the provided extent on tablet', () => {
    mockUseSearchParams.mockReturnValue('filter=abc');

    const mapRef = { current: { getMap: () => createMapMock(800, 600) } };

    const { rerender } = renderHook(
      ({ extent }) => useZoomToExtent(mapRef, extent),
      { initialProps: { extent: extentGeoJSON } },
    );

    // First call should be skipped due to initial load check
    expect(fit).not.toHaveBeenCalled();

    // Second call should trigger the zoom when extent changes
    rerender({ extent: differentExtentGeoJSON });
    expect(fit).toHaveBeenCalledWith([0, 0, 100, 100], {
      padding: [140, 120, 120, 120],
      maxZoom: 16,
      duration: 500,
    });
  });

  it('zooms to the provided extent on mobile', () => {
    mockUseSearchParams.mockReturnValue('filter=abc');

    const mapRef = { current: { getMap: () => createMapMock(375, 667) } };

    const { rerender } = renderHook(
      ({ extent }) => useZoomToExtent(mapRef, extent),
      { initialProps: { extent: extentGeoJSON } },
    );

    // First call should be skipped due to initial load check
    expect(fit).not.toHaveBeenCalled();

    // Second call should trigger the zoom when extent changes
    rerender({ extent: differentExtentGeoJSON });
    expect(fit).toHaveBeenCalledWith([0, 0, 100, 100], {
      padding: [100, 80, 50, 80],
      maxZoom: 16,
      duration: 500,
    });
  });

  it('does not crash on invalid extent', () => {
    mockUseSearchParams.mockReturnValue('filter=abc');

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const mapRef = { current: { getMap: () => ({}) as unknown as OLMap } };

    const { rerender } = renderHook(
      ({ extent }) => useZoomToExtent(mapRef, extent),
      { initialProps: { extent: extentGeoJSON } },
    );

    // Second call with invalid extent should trigger error
    rerender({ extent: 'invalid-json' });

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('zooms when extent changes after initialization', () => {
    mockUseSearchParams.mockReturnValue('filter=abc');

    const mapRef = { current: { getMap: () => createMapMock(1200, 800) } };

    const { rerender } = renderHook(
      ({ extent }) => useZoomToExtent(mapRef, extent),
      { initialProps: { extent: extentGeoJSON } },
    );

    // First call should be skipped due to initial load check
    expect(fit).not.toHaveBeenCalled();

    // Second call should trigger zoom when extent changes
    rerender({ extent: differentExtentGeoJSON });

    // Should have called fit because map is initialized and extent changed
    expect(fit).toHaveBeenCalled();
  });

  it('skips zoom if filter was cleared', async () => {
    const mapRef = { current: { getMap: () => createMapMock(1200, 800) } };

    vi.resetModules();
    vi.doMock('@tanstack/react-store', () => ({
      useStore: vi.fn(() => ({ wasCleared: true })),
    }));

    const { useZoomToExtent: useZoomToExtentWithClearedFilter } = await import(
      '@/components/search-map/hooks/useZoomToExtent'
    );

    const { rerender } = renderHook(
      ({ extent }) => useZoomToExtentWithClearedFilter(mapRef, extent),
      { initialProps: { extent: extentGeoJSON } },
    );

    // First call should be skipped due to initial load check
    expect(fit).not.toHaveBeenCalled();

    // Second call should NOT trigger zoom because wasCleared is true
    rerender({ extent: differentExtentGeoJSON });

    // Should not have called fit because wasCleared is true
    expect(fit).not.toHaveBeenCalled();
  });

  it('zooms when there is a state', () => {
    sessionStorage.setItem('locationZoomState', '12');
    sessionStorage.setItem('locationCenterState', '123,456');
    mockUseSearchParams.mockReturnValue('filter=abc');

    const mapRef = { current: { getMap: () => createMapMock(1200, 800) } };

    const { rerender } = renderHook(
      ({ extent }) => useZoomToExtent(mapRef, extent),
      { initialProps: { extent: extentGeoJSON } },
    );

    // Second call should trigger zoom when extent changes
    rerender({ extent: differentExtentGeoJSON });

    expect(sessionStorage.getItem('lastZoomState')).toBeNull();
    expect(sessionStorage.getItem('lastCenterState')).toBeNull();
  });
});
