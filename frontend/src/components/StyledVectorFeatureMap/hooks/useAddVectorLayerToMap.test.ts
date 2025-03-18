import { renderHook } from '@testing-library/react';
import { useAddVectorLayerToMap } from './useAddVectorLayerToMap';
import OlMap from 'ol/Map';
import { Feature } from 'ol';
import { Style } from 'ol/style';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { Point } from '~/ol/geom';

// Mock dependencies
vi.mock('ol/source/Vector', () => ({
  default: vi.fn().mockImplementation(() => ({
    getExtent: () => [0, 0, 1, 1],
  })),
}));

vi.mock('ol/layer/Vector', () => ({
  default: vi.fn(),
}));

vi.mock('ol/Map', () => ({
  default: vi.fn().mockImplementation(() => ({
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    getView: () => ({
      fit: vi.fn(),
    }),
  })),
}));

describe('useAddVectorLayerToMap', () => {
  let map: OlMap;
  let features: Feature[];
  let mockStyle: Style;
  let onLayerAdded: Mock;

  beforeEach(() => {
    map = new OlMap({});
    vi.spyOn(map, 'addLayer');
    vi.spyOn(map, 'removeLayer');

    features = [
      new Feature({
        geometry: new Point([0, 0]),
      }),
    ];

    mockStyle = new Style({});
    onLayerAdded = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create vector layer and add it to map', () => {
    const { result } = renderHook(() =>
      useAddVectorLayerToMap({
        map,
        features,
        layerStyle: mockStyle,
        onLayerAdded,
      }),
    );

    expect(map.addLayer).toHaveBeenCalledTimes(1);
    expect(result.current.vectorSource).toBeDefined();
    expect(result.current.vectorLayer).toBeDefined();
  });

  it('should not create layer when map is not provided', () => {
    const { result } = renderHook(() =>
      useAddVectorLayerToMap({
        map: undefined as unknown as OlMap,
        features,
        layerStyle: mockStyle,
        onLayerAdded,
      }),
    );

    expect(map.addLayer).not.toHaveBeenCalled();
    expect(result.current.vectorSource).toBeUndefined();
    expect(result.current.vectorLayer).toBeUndefined();
  });

  it('should not create layer when features array is empty', () => {
    const { result } = renderHook(() =>
      useAddVectorLayerToMap({
        map,
        features: [],
        layerStyle: mockStyle,
        onLayerAdded,
      }),
    );

    expect(map.addLayer).not.toHaveBeenCalled();
    expect(result.current.vectorSource).toBeUndefined();
    expect(result.current.vectorLayer).toBeUndefined();
  });

  it('should call onLayerAdded with extent', () => {
    renderHook(() =>
      useAddVectorLayerToMap({
        map,
        features,
        layerStyle: mockStyle,
        onLayerAdded,
      }),
    );

    expect(onLayerAdded).toHaveBeenCalledTimes(1);
    expect(onLayerAdded).toHaveBeenCalledWith([0, 0, 1, 1]);
  });

  it('should remove layer on cleanup', () => {
    const { unmount } = renderHook(() =>
      useAddVectorLayerToMap({
        map,
        features,
        layerStyle: mockStyle,
        onLayerAdded,
      }),
    );

    unmount();
    expect(map.removeLayer).toHaveBeenCalledTimes(1);
  });
});
