import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import BaseLayer from 'ol/layer/Base';
import { useMapInitialization } from './useMapInitialization';
import {
  MAP_CENTER_COORDINATES,
  MAP_EXTENT_COORDINATES,
} from '@/components/StyledVectorFeatureMap/constants';

vi.mock('ol/Map');
vi.mock('ol/View');

describe('useMapInitialization', () => {
  let mockLayers: BaseLayer[];
  let mockMap: OlMap;
  let mockView: OlView;

  beforeEach(() => {
    mockLayers = [
      { getId: () => 'layer1' } as unknown as BaseLayer,
      { getId: () => 'layer2' } as unknown as BaseLayer,
    ];

    mockView = {
      setCenter: vi.fn(),
      setZoom: vi.fn(),
    } as unknown as OlView;

    mockMap = {
      setView: vi.fn(),
      addLayer: vi.fn(),
    } as unknown as OlMap;

    vi.mocked(OlMap).mockImplementation(() => mockMap);
    vi.mocked(OlView).mockImplementation(() => mockView);
  });

  it('should create a map with correct configuration', () => {
    renderHook(() => useMapInitialization(mockLayers));

    expect(OlMap).toHaveBeenCalledWith({
      controls: [],
      view: expect.any(Object),
      layers: mockLayers,
    });

    expect(OlView).toHaveBeenCalledWith({
      center: MAP_CENTER_COORDINATES,
      constrainResolution: true,
      zoom: 15,
      enableRotation: false,
      extent: MAP_EXTENT_COORDINATES,
      maxZoom: 30,
    });
  });

  it('should memoize the map instance', () => {
    const { result, rerender } = renderHook(
      ({ layers }) => useMapInitialization(layers),
      {
        initialProps: { layers: mockLayers },
      },
    );

    const firstInstance = result.current;
    rerender({ layers: mockLayers });

    expect(result.current).toBe(firstInstance);
  });
});
