import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { useBaseMaps } from './useBaseMaps';
import { MAP_LAYER_URLS } from '@/components/search-map/constants';
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
  let mockCanadaTopographicLayer: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockPrpBaseLayer = {
      id: 'prp-layer',
      setVisible: vi.fn(),
      changed: vi.fn(),
    };

    mockCanadaTopographicLayer = {
      id: 'canada-topo-layer',
      setVisible: vi.fn(),
      changed: vi.fn(),
    };

    mockUseStyledLayer = vi.fn();
    mockUseStyledLayer
      .mockReturnValueOnce(mockPrpBaseLayer)
      .mockReturnValueOnce(mockCanadaTopographicLayer);

    const { useStyledLayer } = await import('@bcgov/prp-map');
    vi.mocked(useStyledLayer).mockImplementation(mockUseStyledLayer);

    const mockTileLayer = vi.fn().mockImplementation((config) => ({
      ...config,
      id: 'tile-layer',
    }));
    const mockXYZ = vi.fn().mockImplementation((config) => ({
      ...config,
      id: 'xyz-source',
    }));
    const mockLayerGroup = vi.fn().mockImplementation((config) => ({
      ...config,
      id: 'layer-group',
    }));

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
      { id: 'satellite', name: 'Satellite' },
      { id: 'hillshade', name: 'Hillshade' },
    ];

    expectedBaseMaps.forEach((expected, index) => {
      expect(result.current[index].id).toBe(expected.id);
      expect(result.current[index].name).toBe(expected.name);
    });
  });

  it('calls useStyledLayer with correct parameters for PRP layer', () => {
    renderHook(() => useBaseMaps());

    expect(mockUseStyledLayer).toHaveBeenCalledWith(
      MAP_LAYER_URLS.BC_BASE_LAYER,
      MAP_LAYER_URLS.BC_BASE_STYLE,
      'esri',
    );
  });

  it('calls useStyledLayer with correct parameters for Canada Topographic layer', () => {
    renderHook(() => useBaseMaps());

    expect(mockUseStyledLayer).toHaveBeenCalledWith(
      MAP_LAYER_URLS.CANADA_TOPOGRAPHIC_LAYER,
      MAP_LAYER_URLS.CANADA_TOPOGRAPHIC_STYLE_BASIC,
      'esri',
    );
  });

  it('creates satellite layer with correct configuration', () => {
    renderHook(() => useBaseMaps());

    expect(XYZ).toHaveBeenCalledWith({
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attributions: 'Esri World Imagery',
      cacheSize: 512,
      maxZoom: 18,
    });

    expect(LayerGroup).toHaveBeenCalledWith({
      layers: expect.arrayContaining([
        expect.any(Object),
        mockCanadaTopographicLayer,
      ]),
    });
  });

  // it('creates hillshade layer with correct configuration', () => {
  //   renderHook(() => useBaseMaps());

  //   expect(XYZ).toHaveBeenCalledWith({
  //     url: MAP_LAYER_URLS.CANADA_HILLSHADE_TILE_LAYER,
  //     attributions: 'Esri Canada Hillshade',
  //     cacheSize: 512,
  //   });

  //   expect(LayerGroup).toHaveBeenCalledWith({
  //     layers: expect.arrayContaining([
  //       expect.any(Object), // Tile layer
  //       mockCanadaTopographicLayer, // Canada topographic layer
  //     ]),
  //   });
  // });

  it('uses the styled layers from useStyledLayer hook', () => {
    const { result } = renderHook(() => useBaseMaps());

    expect(result.current[0].layer).toBe(mockPrpBaseLayer);

    // Satellite layer should include the Canada topographic layer
    const satelliteLayer = result.current[2].layer;

    expect(satelliteLayer).toBeDefined();
  });

  it('recreates base maps when styled layers change', () => {
    const { result, rerender } = renderHook(() => useBaseMaps());

    const firstResult = result.current;

    const newMockPrpLayer = { id: 'new-prp-layer' };
    const newMockCanadaLayer = { id: 'new-canada-layer' };

    mockUseStyledLayer
      .mockReturnValueOnce(newMockPrpLayer)
      .mockReturnValueOnce(newMockCanadaLayer);

    rerender();

    const secondResult = result.current;

    expect(firstResult).not.toBe(secondResult);
    expect(secondResult[0].layer).toBe(newMockPrpLayer);
  });
});
