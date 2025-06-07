import { describe, expect, it, vi } from 'vitest';
import { Style } from 'ol/style';
import { LineString, Point, Polygon } from 'ol/geom';
import {
  isLineOrMultiLineStringGeometry,
  isPointGeometry,
  isPolygonOrMultiPolygonGeometry,
} from '@/utils/map';
import {
  createFillStyle,
  createImageStyle,
  createStrokeStyle,
  createTextStyle,
} from '@/components/rec-resource/RecreationResourceMap/helpers/layerStyleHelpers';
import { getLayerStyleForRecResource } from '@/components/rec-resource/RecreationResourceMap/helpers';

// Mock the utility functions
vi.mock('@/utils/map', () => ({
  isPointGeometry: vi.fn(),
  isLineOrMultiLineStringGeometry: vi.fn(),
  isPolygonOrMultiPolygonGeometry: vi.fn(),
}));

// Mock the style helper functions
vi.mock(
  '@/components/rec-resource/RecreationResourceMap/helpers/layerStyleHelpers',
  () => ({
    createFillStyle: vi.fn(() => 'mockFillStyle'),
    createImageStyle: vi.fn(() => 'mockImageStyle'),
    createStrokeStyle: vi.fn(() => 'mockStrokeStyle'),
    createTextStyle: vi.fn(() => 'mockTextStyle'),
  }),
);

vi.mock('@/utils/recreationResourceUtils', () => ({
  isRecreationTrail: vi.fn(),
}));

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

    // Set up mock return values
    vi.mocked(isPointGeometry).mockReturnValue(true);
    vi.mocked(isLineOrMultiLineStringGeometry).mockReturnValue(false);
    vi.mocked(isPolygonOrMultiPolygonGeometry).mockReturnValue(false);

    const styleFunction = getLayerStyleForRecResource(mockRecResource);
    const style = styleFunction(pointFeature, 1);

    expect(isPointGeometry).toHaveBeenCalledWith(pointFeature.getGeometry());
    expect(createImageStyle).toHaveBeenCalledWith(true, mockRecResource);
    expect(createTextStyle).toHaveBeenCalledWith('Test Resource', false, true);
    expect(style).toBeInstanceOf(Style);
  });

  it('should create style for line geometry', () => {
    const lineFeature = createMockFeature(
      new LineString([
        [0, 0],
        [1, 1],
      ]),
    );

    // Set up mock return values
    vi.mocked(isPointGeometry).mockReturnValue(false);
    vi.mocked(isLineOrMultiLineStringGeometry).mockReturnValue(true);
    vi.mocked(isPolygonOrMultiPolygonGeometry).mockReturnValue(false);

    const styleFunction = getLayerStyleForRecResource(mockRecResource);
    const style = styleFunction(lineFeature, 1);

    expect(isLineOrMultiLineStringGeometry).toHaveBeenCalledWith(
      lineFeature.getGeometry(),
    );
    expect(createStrokeStyle).toHaveBeenCalledWith(true);
    expect(createTextStyle).toHaveBeenCalledWith('Test Resource', true, false);
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

    // Set up mock return values
    vi.mocked(isPointGeometry).mockReturnValue(false);
    vi.mocked(isLineOrMultiLineStringGeometry).mockReturnValue(false);
    vi.mocked(isPolygonOrMultiPolygonGeometry).mockReturnValue(true);

    const styleFunction = getLayerStyleForRecResource(mockRecResource);
    const style = styleFunction(polygonFeature, 1);

    expect(isPolygonOrMultiPolygonGeometry).toHaveBeenCalledWith(
      polygonFeature.getGeometry(),
    );
    expect(createFillStyle).toHaveBeenCalledWith(true);
    expect(createTextStyle).toHaveBeenCalledWith('Test Resource', false, false);
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

    // Set up mock return values
    vi.mocked(isPointGeometry).mockReturnValue(false);
    vi.mocked(isLineOrMultiLineStringGeometry).mockReturnValue(false);
    vi.mocked(isPolygonOrMultiPolygonGeometry).mockReturnValue(true);

    const styleFunction = getLayerStyleForRecResource({
      ...mockRecResource,
      site_point_geometry: { type: 'Point', coordinates: [0, 0] },
    });
    const style = styleFunction(polygonFeature, 1);

    expect(createTextStyle).not.toHaveBeenCalled();
    expect(style).toBeInstanceOf(Style);
  });
});
