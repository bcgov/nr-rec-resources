import { renderHook } from '@testing-library/react';
import { useAddVectorLayerToMap } from './useAddVectorLayerToMap';
import OlMap from 'ol/Map';
import { Feature } from 'ol';
import { Style } from 'ol/style';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Point } from '~/ol/geom';

// Mock OpenLayers dependencies
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
  const setupTest = () => {
    const mapEventHandlers: Record<string, Array<() => void>> = {};
    const map = new OlMap({});

    Object.assign(map, {
      addLayer: vi.fn(),
      removeLayer: vi.fn(),
      once: vi.fn((event, handler) => {
        mapEventHandlers[event] = [...(mapEventHandlers[event] || []), handler];
      }),
      triggerEvent: (event: string) =>
        mapEventHandlers[event]?.forEach((fn) => fn()),
    });

    const features = [new Feature({ geometry: new Point([0, 0]) })];
    const mockStyle = new Style({});
    const onLayerAdded = vi.fn();

    return { map, features, mockStyle, onLayerAdded };
  };

  afterEach(() => vi.clearAllMocks());

  it('creates and adds vector layer to map', () => {
    const { map, features, mockStyle, onLayerAdded } = setupTest();
    const { result } = renderHook(() =>
      useAddVectorLayerToMap({
        map,
        features,
        layerStyle: mockStyle,
        onLayerAdded,
      }),
    );

    expect(map.addLayer).toHaveBeenCalled();
    expect(result.current).toEqual(
      expect.objectContaining({
        vectorSource: expect.any(Object),
        vectorLayer: expect.any(Object),
      }),
    );
  });

  it('handles missing map', () => {
    const { features, mockStyle, onLayerAdded } = setupTest();
    const { result } = renderHook(() =>
      useAddVectorLayerToMap({
        map: undefined as unknown as OlMap,
        features,
        layerStyle: mockStyle,
        onLayerAdded,
      }),
    );

    expect(result.current).toEqual({
      vectorSource: undefined,
      vectorLayer: undefined,
    });
  });

  it('handles empty features array', () => {
    const { map, mockStyle, onLayerAdded } = setupTest();
    const { result } = renderHook(() =>
      useAddVectorLayerToMap({
        map,
        features: [],
        layerStyle: mockStyle,
        onLayerAdded,
      }),
    );

    expect(result.current).toEqual({
      vectorSource: undefined,
      vectorLayer: undefined,
    });
  });

  it('calls onLayerAdded after map render completes', () => {
    const { map, features, mockStyle, onLayerAdded } = setupTest();
    renderHook(() =>
      useAddVectorLayerToMap({
        map,
        features,
        layerStyle: mockStyle,
        onLayerAdded,
      }),
    );

    (map as any).triggerEvent('rendercomplete');
    expect(onLayerAdded).toHaveBeenCalledWith([0, 0, 1, 1]);
  });

  it('cleans up layer on unmount', () => {
    const { map, features, mockStyle, onLayerAdded } = setupTest();
    const { unmount } = renderHook(() =>
      useAddVectorLayerToMap({
        map,
        features,
        layerStyle: mockStyle,
        onLayerAdded,
      }),
    );

    unmount();
    expect(map.removeLayer).toHaveBeenCalled();
  });
});
