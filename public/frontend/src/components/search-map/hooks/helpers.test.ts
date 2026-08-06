import { describe, it, expect, vi } from 'vitest';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import OLMap from 'ol/Map';
import {
  isClusteredLayer,
  applySelectedStyle,
  getFeatureLayerConfig,
  getPointFeatureCoordinates,
  centerMapOnFeature,
} from './helpers';

vi.mock('@shared/components/recreation-resource-map/helpers', () => ({
  getSitePointFeatureFromRecResource: vi.fn(),
}));

vi.mock('@/components/search-map/styles/icons', () => ({
  createSITIcon: vi.fn(() => 'mock-sit-icon'),
}));

vi.mock('ol/layer/Vector', () => {
  return {
    default: vi.fn().mockImplementation(function (opts: any) {
      let _zIndex = 0;
      return {
        setZIndex: vi.fn((z: number) => {
          _zIndex = z;
        }),
        getZIndex: vi.fn(() => _zIndex),
        _source: opts?.source,
        getSource: vi.fn(() => opts?.source),
      };
    }),
  };
});

vi.mock('ol/source/Vector', () => {
  return {
    default: vi.fn().mockImplementation(function (opts: any) {
      const feats = opts?.features ?? [];
      return { getFeatures: vi.fn(() => feats) };
    }),
  };
});

describe('isClusteredLayer', () => {
  it('returns true when layer has nested getSource', () => {
    const layer = { getSource: () => ({ getSource: () => ({}) }) };
    expect(isClusteredLayer(layer)).toBe(true);
  });

  it('returns false when layer has no nested getSource', () => {
    const layer = { getSource: () => ({}) };
    expect(isClusteredLayer(layer)).toBe(false);
  });
});

describe('applySelectedStyle', () => {
  it('calls setStyle with the style object when selectedStyle is a Style', () => {
    const feature = new Feature();
    feature.setStyle = vi.fn();
    const mockStyle = {} as any;
    const layerConfig: any = { selectedStyle: mockStyle };

    applySelectedStyle(feature, layerConfig);

    expect(feature.setStyle).toHaveBeenCalledWith(mockStyle);
  });

  it('calls setStyle with result of selectedStyle function', () => {
    const feature = new Feature();
    feature.setStyle = vi.fn();
    const mockStyle = {} as any;
    const styleFn = vi.fn(() => mockStyle);
    const layerConfig: any = { selectedStyle: styleFn };

    applySelectedStyle(feature, layerConfig);

    expect(styleFn).toHaveBeenCalledWith(feature);
    expect(feature.setStyle).toHaveBeenCalledWith(mockStyle);
  });

  it('does nothing when selectedStyle is not set', () => {
    const feature = new Feature();
    feature.setStyle = vi.fn();
    applySelectedStyle(feature, {} as any);
    expect(feature.setStyle).not.toHaveBeenCalled();
  });
});

describe('getFeatureLayerConfig', () => {
  it('returns the layer config that contains the feature', () => {
    const feature = new Feature();
    const otherFeature = new Feature();

    const config1: any = {
      id: 'layer-1',
      layer: { getSource: () => ({ getFeatures: () => [otherFeature] }) },
      onFeatureSelect: vi.fn(),
    };
    const config2: any = {
      id: 'layer-2',
      layer: { getSource: () => ({ getFeatures: () => [feature] }) },
      onFeatureSelect: vi.fn(),
    };

    expect(getFeatureLayerConfig(feature, [config1, config2])).toBe(config2);
  });

  it('returns undefined when feature is not in any layer', () => {
    const feature = new Feature();
    const configs: any[] = [
      {
        id: 'layer-1',
        layer: { getSource: () => ({ getFeatures: () => [] }) },
        onFeatureSelect: vi.fn(),
      },
    ];
    expect(getFeatureLayerConfig(feature, configs)).toBeUndefined();
  });
});

describe('getPointFeatureCoordinates', () => {
  it('returns undefined when feature has no geometry', () => {
    expect(getPointFeatureCoordinates(new Feature())).toBeUndefined();
  });

  it('returns coordinates for Point geometry', () => {
    const feature = new Feature(new Point([10, 20]));
    expect(getPointFeatureCoordinates(feature)).toEqual([10, 20]);
  });
});

describe('centerMapOnFeature', () => {
  it('does nothing when feature has no geometry', () => {
    const fitMock = vi.fn();
    const mapMock = {
      getView: () => ({ fit: fitMock, getZoom: () => 10 }),
    } as unknown as OLMap;
    centerMapOnFeature(mapMock, new Feature());
    expect(fitMock).not.toHaveBeenCalled();
  });

  it('uses defaults when no opts provided', () => {
    const fitMock = vi.fn();
    const mapMock = {
      getView: () => ({ fit: fitMock, getZoom: () => 8 }),
    } as unknown as OLMap;
    centerMapOnFeature(mapMock, new Feature(new Point([5, 5])));
    expect(fitMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        duration: 500,
        maxZoom: 8,
        padding: [0, 0, 0, 0],
      }),
    );
  });
});
