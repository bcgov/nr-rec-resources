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

  it('zooms to the provided extent when filter is set', () => {
    mockUseSearchParams.mockReturnValue('filter=abc');

    const mapMock = {
      getView: () => ({
        fit,
        getZoom: () => 10,
        setZoom,
      }),
      once: onMoveEnd,
    } as unknown as OLMap;

    const mapRef = { current: { getMap: () => mapMock } };

    renderHook(() => useZoomToExtent(mapRef, extentGeoJSON));

    expect(fit).toHaveBeenCalledWith([0, 0, 100, 100], {
      padding: [50, 50, 50, 50],
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

    const mapMock = {
      getView: () => ({
        fit,
        getZoom: () => 10,
        setZoom,
      }),
      once: onMoveEnd,
    } as unknown as OLMap;

    const mapRef = { current: { getMap: () => mapMock } };

    const { rerender } = renderHook(() =>
      useZoomToExtent(mapRef, extentGeoJSON),
    );

    expect(fit).toHaveBeenCalled();

    vi.clearAllMocks();

    mockUseSearchParams.mockReturnValue('');

    rerender();

    expect(fit).not.toHaveBeenCalled();
    expect(setZoom).not.toHaveBeenCalled();
  });
});
