import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Style } from 'ol/style';
import { LineString, Point, Polygon } from 'ol/geom';
import {
  createFillStyle,
  createImageStyle,
  createStrokeStyle,
  createTextStyle,
} from '@shared/components/recreation-resource-map/helpers/layerStyleHelpers';
import { getLayerStyleForRecResource } from '@shared/components/recreation-resource-map/helpers';
import { StyleContext } from '@shared/components/recreation-resource-map/constants';

// Mock the style helper functions
vi.mock(
  '@shared/components/recreation-resource-map/helpers/layerStyleHelpers',
  () => ({
    createFillStyle: vi.fn(() => 'mockFillStyle'),
    createImageStyle: vi.fn(() => 'mockImageStyle'),
    createStrokeStyle: vi.fn(() => 'mockStrokeStyle'),
    createTextStyle: vi.fn(() => 'mockTextStyle'),
  }),
);

describe('getLayerStyleForRecResource', () => {
  const mockRecResource = {
    name: 'Test Resource',
    site_point_geometry: null,
  } as any;

  const createMockFeature = (geometry: any) =>
    ({
      getGeometry: () => geometry,
    }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create style for point geometry', () => {
    const pointFeature = createMockFeature(new Point([0, 0]));

    const styleFunction = getLayerStyleForRecResource(mockRecResource);
    const style = styleFunction(pointFeature, 1);

    expect(createImageStyle).toHaveBeenCalledWith(
      true,
      mockRecResource,
      StyleContext.DOWNLOAD,
    );
    expect(createTextStyle).toHaveBeenCalledWith(
      'Test Resource',
      false,
      true,
      StyleContext.DOWNLOAD,
    );
    expect(style).toBeInstanceOf(Style);
  });

  it('should create style for line geometry', () => {
    const lineFeature = createMockFeature(
      new LineString([
        [0, 0],
        [1, 1],
      ]),
    );

    const styleFunction = getLayerStyleForRecResource(
      mockRecResource,
      StyleContext.DOWNLOAD,
    );
    const style = styleFunction(lineFeature, 1);

    expect(createStrokeStyle).toHaveBeenCalledWith(true, StyleContext.DOWNLOAD);
    expect(createTextStyle).toHaveBeenCalledWith(
      'Test Resource',
      true,
      false,
      StyleContext.DOWNLOAD,
    );
    expect(style).toBeInstanceOf(Style);
  });

  it('should create style for polygon geometry', () => {
    const polygonFeature = createMockFeature(
      new Polygon([
        [
          [0, 0],
          [1, 1],
          [1, 0],
          [0, 0],
        ],
      ]),
    );

    const styleFunction = getLayerStyleForRecResource(
      mockRecResource,
      StyleContext.DOWNLOAD,
    );
    const style = styleFunction(polygonFeature, 1);

    expect(createFillStyle).toHaveBeenCalledWith(true);
    expect(createTextStyle).toHaveBeenCalledWith(
      'Test Resource',
      false,
      false,
      StyleContext.DOWNLOAD,
    );
    expect(style).toBeInstanceOf(Style);
  });

  it('should not show text for polygon when site point exists', () => {
    const polygonFeature = createMockFeature(
      new Polygon([
        [
          [0, 0],
          [1, 1],
          [1, 0],
          [0, 0],
        ],
      ]),
    );

    const styleFunction = getLayerStyleForRecResource({
      ...mockRecResource,
      site_point_geometry: '{"type": "Point", "coordinates": [0, 0]}',
    });
    const style = styleFunction(polygonFeature, 1);

    expect(createTextStyle).not.toHaveBeenCalled();
    expect(style).toBeInstanceOf(Style);
  });
});
