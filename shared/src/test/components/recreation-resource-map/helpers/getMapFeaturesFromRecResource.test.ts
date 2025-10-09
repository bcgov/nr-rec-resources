import { describe, expect, it, vi } from 'vitest';
import { GeoJSON } from 'ol/format';
import { getMapFeaturesFromRecResource } from '@shared/components/recreation-resource-map/helpers';

vi.mock('ol/format', () => ({
  GeoJSON: vi.fn().mockImplementation(() => ({
    readFeatures: vi.fn().mockReturnValue(['mockFeature']),
    readFeature: vi.fn().mockReturnValue('mockFeature'),
  })),
}));

describe('getMapFeaturesFromRecResource', () => {
  it('should return empty array when no resource is provided', () => {
    const result = getMapFeaturesFromRecResource(undefined);
    expect(result).toEqual([]);
  });

  it('should convert spatial features when only spatial_feature_geometry is provided', () => {
    const mockResource = {
      spatial_feature_geometry: [
        { type: 'Point', coordinates: [0, 0] },
        { type: 'Point', coordinates: [1, 1] },
      ],
    } as any;

    const result = getMapFeaturesFromRecResource(mockResource);
    expect(result).toEqual(['mockFeature', 'mockFeature', 'mockFeature']); // includes site point feature
    expect(GeoJSON).toHaveBeenCalledWith({
      dataProjection: 'EPSG:3005',
      featureProjection: 'EPSG:3857',
    });
  });

  it('should convert point geometry when only site_point_geometry is provided', () => {
    const mockResource = {
      site_point_geometry: { type: 'Point', coordinates: [0, 0] },
      spatial_feature_geometry: [],
    } as any;

    const result = getMapFeaturesFromRecResource(mockResource);
    expect(result).toEqual(['mockFeature']);
  });

  it('should convert both spatial features and point geometry when both are provided', () => {
    const mockResource = {
      site_point_geometry: { type: 'Point', coordinates: [0, 0] },
      spatial_feature_geometry: [{ type: 'Point', coordinates: [1, 1] }],
    } as any;

    const result = getMapFeaturesFromRecResource(mockResource);
    expect(result).toEqual(['mockFeature', 'mockFeature']);
  });

  it('should handle empty spatial_feature_geometry array', () => {
    const mockResource = {
      spatial_feature_geometry: [],
    } as any;

    const result = getMapFeaturesFromRecResource(mockResource);
    expect(result).toEqual(['mockFeature']); // includes site point feature
  });
});
