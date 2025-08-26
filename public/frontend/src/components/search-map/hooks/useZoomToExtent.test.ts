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
    default: vi.fn().mockImplementation(() => ({
      readGeometry: vi.fn().mockReturnValue({
        getExtent: vi.fn().mockReturnValue([1, 2, 3, 4]),
      }),
    })),
  };
});

const mockUseSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(mockUseSearchParams())],
  };
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

    renderHook(() => useZoomToExtent(mapRef, extentGeoJSON));

    expect(fit).toHaveBeenCalledWith([0, 0, 100, 100], {
      padding: [150, 250, 300, 250],
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

    renderHook(() => useZoomToExtent(mapRef, extentGeoJSON));

    expect(fit).toHaveBeenCalledWith([0, 0, 100, 100], {
      padding: [150, 200, 250, 200],
      maxZoom: 16,
      duration: 500,
    });
  });

  it('zooms to the provided extent on mobile', () => {
    mockUseSearchParams.mockReturnValue('filter=abc');

    const mapRef = { current: { getMap: () => createMapMock(375, 667) } };

    renderHook(() => useZoomToExtent(mapRef, extentGeoJSON));

    expect(fit).toHaveBeenCalledWith([0, 0, 100, 100], {
      padding: [50, 50, 50, 50],
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

    renderHook(() => useZoomToExtent(mapRef, 'invalid-json'));

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('skips zoom if filter was cleared', () => {
    mockUseSearchParams.mockReturnValue('filter=abc');

    const mapRef = { current: { getMap: () => createMapMock(1200, 800) } };

    const { rerender } = renderHook(() =>
      useZoomToExtent(mapRef, extentGeoJSON),
    );

    expect(fit).toHaveBeenCalled();

    vi.clearAllMocks();

    // simulate filter cleared
    mockUseSearchParams.mockReturnValue('');

    rerender();

    expect(fit).not.toHaveBeenCalled();
    expect(setZoom).not.toHaveBeenCalled();
  });
});
