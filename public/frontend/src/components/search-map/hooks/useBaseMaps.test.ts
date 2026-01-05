import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { useBaseMaps } from './useBaseMaps';
import {
  BASE_LAYER_URLS,
  BC_BASE_LAYER_URLS,
  CANADA_TOPO_LAYER_URLS,
  WORLD_BASEMAP_V2_URLS,
} from '@/components/search-map/constants';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import LayerGroup from 'ol/layer/Group';

vi.mock('@bcgov/prp-map', () => ({
  useStyledLayer: vi.fn(),
}));

vi.mock('ol/layer/Tile', () => ({
  default: vi.fn(),
}));

vi.mock('ol/source/XYZ', () => ({
  default: vi.fn(),
}));

vi.mock('ol/layer/Group', () => ({
  default: vi.fn(),
}));

describe('useBaseMaps', () => {
  let mockUseStyledLayer: Mock;
  let mockPrpBaseLayer: any;
  let mockCanadaTopographicLayerBasic: any;
  let mockWorldBasemapV2Layer: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockPrpBaseLayer = {
      id: 'prp-layer',
      setVisible: vi.fn(),
      changed: vi.fn(),
    };

    mockCanadaTopographicLayerBasic = {
      id: 'canada-topo-layer-basic',
      setVisible: vi.fn(),
      changed: vi.fn(),
    };

    mockWorldBasemapV2Layer = {
      id: 'world-basemap-v2-layer',
      setVisible: vi.fn(),
      changed: vi.fn(),
      setOpacity: vi.fn(),
    };

    mockUseStyledLayer = vi.fn();
    mockUseStyledLayer
      .mockReturnValueOnce(mockPrpBaseLayer)
      .mockReturnValueOnce(mockCanadaTopographicLayerBasic)
      .mockReturnValueOnce(mockWorldBasemapV2Layer);

    const { useStyledLayer } = await import('@bcgov/prp-map');
    vi.mocked(useStyledLayer).mockImplementation(mockUseStyledLayer);

    const mockTileLayer = vi.fn().mockImplementation(function (config) {
      return {
        ...config,
        id: 'tile-layer',
      };
    });
    const mockXYZ = vi.fn().mockImplementation(function (config) {
      return {
        ...config,
        id: 'xyz-source',
      };
    });
    const mockLayerGroup = vi.fn().mockImplementation(function (config) {
      return {
        ...config,
        id: 'layer-group',
      };
    });

    vi.mocked(TileLayer).mockImplementation(mockTileLayer);
    vi.mocked(XYZ).mockImplementation(mockXYZ);
    vi.mocked(LayerGroup).mockImplementation(mockLayerGroup);
  });

  it('returns an array of base maps with correct structure', () => {
    const { result } = renderHook(() => useBaseMaps());

    expect(result.current).toHaveLength(3);
    expect(Array.isArray(result.current)).toBe(true);

    result.current.forEach((baseMap) => {
      expect(baseMap).toHaveProperty('id');
      expect(baseMap).toHaveProperty('name');
      expect(baseMap).toHaveProperty('layer');
      expect(typeof baseMap.id).toBe('string');
      expect(typeof baseMap.name).toBe('string');
      expect(baseMap.layer).toBeDefined();
    });
  });

  it('returns base maps with correct IDs and names', () => {
    const { result } = renderHook(() => useBaseMaps());

    const expectedBaseMaps = [
      { id: 'prp', name: 'BC Basemap' },
      { id: 'hillshade', name: 'Hillshade' },
      { id: 'satellite', name: 'Satellite' },
    ];

    expectedBaseMaps.forEach((expected, index) => {
      expect(result.current[index].id).toBe(expected.id);
      expect(result.current[index].name).toBe(expected.name);
    });
  });

  it('returns base maps with image properties', () => {
    const { result } = renderHook(() => useBaseMaps());

    expect(result.current[0]).toHaveProperty(
      'image',
      '/src/components/search-map/assets/basemap/bc_basemap.webp',
    );
    expect(result.current[1]).toHaveProperty(
      'image',
      '/src/components/search-map/assets/basemap/hillshade.webp',
    );
    expect(result.current[2]).toHaveProperty(
      'image',
      '/src/components/search-map/assets/basemap/satellite.webp',
    );
  });

  it('calls useStyledLayer with correct parameters for BC Basemap layer', () => {
    renderHook(() => useBaseMaps());

    expect(mockUseStyledLayer).toHaveBeenCalledWith(
      BC_BASE_LAYER_URLS.VECTOR_TILE_URL,
      BC_BASE_LAYER_URLS.STYLE_URL,
      'esri',
    );
  });

  it('calls useStyledLayer with correct parameters for Canada Topographic layer basic', () => {
    renderHook(() => useBaseMaps());

    expect(mockUseStyledLayer).toHaveBeenCalledWith(
      CANADA_TOPO_LAYER_URLS.VECTOR_TILE_URL,
      CANADA_TOPO_LAYER_URLS.STYLE_URL_BASIC,
      'esri',
    );
  });

  it('calls useStyledLayer with correct parameters for World Basemap V2 layer', () => {
    renderHook(() => useBaseMaps());

    expect(mockUseStyledLayer).toHaveBeenCalledWith(
      WORLD_BASEMAP_V2_URLS.VECTOR_TILE_URL,
      WORLD_BASEMAP_V2_URLS.STYLE_URL,
      'esri',
    );
  });

  it('sets opacity on World Basemap V2 layer', () => {
    renderHook(() => useBaseMaps());

    expect(mockWorldBasemapV2Layer.setOpacity).toHaveBeenCalledWith(0.3);
  });

  it('creates satellite layer with correct configuration', () => {
    renderHook(() => useBaseMaps());

    expect(XYZ).toHaveBeenCalledWith({
      url: BASE_LAYER_URLS.ESRI_WORLD_IMAGERY_LAYER,
      attributions: 'Esri World Imagery',
      cacheSize: 512,
      maxZoom: 18,
    });

    expect(LayerGroup).toHaveBeenCalledWith({
      layers: expect.arrayContaining([
        expect.any(Object), // Satellite tile layer
        mockCanadaTopographicLayerBasic, // Canada topographic layer basic
      ]),
    });
  });

  it('creates hillshade layer with correct configuration', () => {
    renderHook(() => useBaseMaps());

    expect(XYZ).toHaveBeenCalledWith({
      url: BASE_LAYER_URLS.CANADA_HILLSHADE_TILE_LAYER,
      attributions: 'Esri Canada Hillshade',
      cacheSize: 1024,
    });

    expect(LayerGroup).toHaveBeenCalledWith({
      layers: expect.arrayContaining([
        expect.any(Object), // Canada hillshade tile layer
        mockWorldBasemapV2Layer, // World basemap v2 layer
        mockCanadaTopographicLayerBasic, // Canada topographic layer basic
      ]),
    });
  });

  it('recreates base maps when styled layers change', () => {
    const { result, rerender } = renderHook(() => useBaseMaps());

    const firstResult = result.current;

    const newMockPrpLayer = { id: 'new-prp-layer' };
    const newMockCanadaLayerBasic = { id: 'new-canada-layer-basic' };
    const newMockWorldBasemapV2Layer = {
      id: 'new-world-basemap-v2-layer',
      setOpacity: vi.fn(),
    };

    mockUseStyledLayer
      .mockReturnValueOnce(newMockPrpLayer)
      .mockReturnValueOnce(newMockCanadaLayerBasic)
      .mockReturnValueOnce(newMockWorldBasemapV2Layer);

    rerender();

    const secondResult = result.current;

    expect(firstResult).not.toBe(secondResult);
    expect(secondResult[0].layer).toBe(newMockPrpLayer);
  });
});
