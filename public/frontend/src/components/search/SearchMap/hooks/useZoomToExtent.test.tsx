import { describe, it, vi, expect } from 'vitest';
import { render } from '@testing-library/react';
import OLMap from 'ol/Map';
import { useZoomToExtent } from '@/components/search/SearchMap/hooks/useZoomToExtent';
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

describe('useZoomToExtent', () => {
  it('zooms to the provided extent', () => {
    const fit = vi.fn();
    const setZoom = vi.fn();
    const onMoveEnd = vi.fn((_event: string, cb: () => void) => cb());

    const mapMock = {
      getView: () => ({
        fit,
        getZoom: () => 10,
        setZoom,
      }),
      once: onMoveEnd,
    } as unknown as OLMap;

    const mapRef = { current: { getMap: () => mapMock } };

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

    const TestComponent = () => {
      useZoomToExtent(mapRef, extentGeoJSON);
      return null;
    };

    render(<TestComponent />);

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
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mapRef = { current: { getMap: () => ({}) as unknown as OLMap } };

    const TestComponent = () => {
      useZoomToExtent(mapRef, 'invalid-json');
      return null;
    };

    render(<TestComponent />);

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
