import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import OLMap from 'ol/Map';
import { useZoomToExtent } from '@/components/search-map/hooks/useZoomToExtent';
import { transformExtent } from 'ol/proj';
import { getCenter } from 'ol/extent';

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

vi.mock('ol/extent', () => ({
  getCenter: vi.fn(),
}));

describe('zoomToFeature', () => {
  it('returns early if mapRef.current is null', () => {
    const mapRef = { current: null };

    const { result } = renderHook(() =>
      useZoomToExtent(mapRef as any, undefined),
    );

    const feature = {} as any;

    expect(() => result.current.zoomToFeature(feature)).not.toThrow();
  });

  it('returns early if map is null', () => {
    const mapRef = {
      current: {
        getMap: vi.fn(() => null),
      },
    };

    const { result } = renderHook(() =>
      useZoomToExtent(mapRef as any, undefined),
    );

    const feature = {} as any;

    result.current.zoomToFeature(feature);

    expect(mapRef.current.getMap).toHaveBeenCalled();
  });

  it('does nothing if geometry is null', () => {
    const setCenter = vi.fn();
    const setZoom = vi.fn();

    const mapRef = {
      current: {
        getMap: vi.fn(() => ({
          getView: () => ({
            setCenter,
            setZoom,
          }),
        })),
      },
    };

    const feature = {
      getGeometry: vi.fn(() => null),
    } as any;

    const { result } = renderHook(() =>
      useZoomToExtent(mapRef as any, undefined),
    );

    result.current.zoomToFeature(feature);

    expect(setCenter).not.toHaveBeenCalled();
    expect(setZoom).not.toHaveBeenCalled();
  });

  it('zooms to feature when geometry exists', () => {
    const setCenter = vi.fn();
    const setZoom = vi.fn();

    const mockCenter = [100, 200];
    (getCenter as any).mockReturnValue(mockCenter);

    const geometry = {
      getExtent: vi.fn(() => [0, 0, 10, 10]),
    };

    const feature = {
      getGeometry: vi.fn(() => geometry),
    } as any;

    const mapRef = {
      current: {
        getMap: vi.fn(() => ({
          getView: () => ({
            setCenter,
            setZoom,
          }),
        })),
      },
    };

    const { result } = renderHook(() =>
      useZoomToExtent(mapRef as any, undefined),
    );

    result.current.zoomToFeature(feature);

    expect(geometry.getExtent).toHaveBeenCalled();
    expect(getCenter).toHaveBeenCalledWith([0, 0, 10, 10]);
    expect(setCenter).toHaveBeenCalledWith(mockCenter);
    expect(setZoom).toHaveBeenCalledWith(15);
  });
});

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

    const mapRef = {
      current: {
        getMap: () =>
          ({
            getView: () => ({
              setCenter: vi.fn(),
              setZoom: vi.fn(),
              getZoom: vi.fn(),
              fit: vi.fn(),
            }),
            once: vi.fn(),
            getSize: vi.fn(),
          }) as unknown as OLMap,
      },
    };

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
