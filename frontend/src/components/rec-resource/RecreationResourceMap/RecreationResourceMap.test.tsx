import { describe, expect, it, Mock, vi } from 'vitest';
import { render } from '@testing-library/react';
import { StyledVectorFeatureMap } from '@/components/StyledVectorFeatureMap';
import { GeoJSON } from 'ol/format';
import { RecreationResourceDto } from '@/service/recreation-resource';
import { RecreationResourceMap } from '@/components/rec-resource/RecreationResourceMap/RecreationResourceMap';

// Mock dependencies
vi.mock('@/components/StyledVectorFeatureMap', () => ({
  StyledVectorFeatureMap: vi.fn(() => null),
}));

vi.mock('ol/format', () => ({
  GeoJSON: vi.fn(),
}));

vi.mock('@/components/rec-resource/RecreationResourceMap/helpers', () => ({
  getLayerStyle: vi.fn(() => ({ color: 'blue' })),
}));

describe('RecreationResourceMap', () => {
  const mockRecResource = {
    name: 'Test Trail',
    geometry: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        },
      },
    ],
  } as unknown as RecreationResourceDto;

  beforeEach(() => {
    vi.clearAllMocks();
    (GeoJSON as Mock).mockImplementation(() => ({
      readFeatures: vi.fn(() => [{ type: 'Feature' }]),
    }));
  });

  it('renders StyledVectorFeatureMap with correct props', () => {
    const cssStyles = { width: '100%' };
    render(
      <RecreationResourceMap
        recResource={mockRecResource}
        mapComponentCssStyles={cssStyles}
      />,
    );

    expect(StyledVectorFeatureMap).toHaveBeenCalledWith(
      expect.objectContaining({
        mapComponentCssStyles: cssStyles,
        features: expect.any(Array),
        layerStyle: expect.any(Object),
      }),
      undefined, // no children passed
    );
  });

  it('handles undefined recResource', () => {
    render(<RecreationResourceMap />);

    expect(StyledVectorFeatureMap).toHaveBeenCalledWith(
      expect.objectContaining({
        features: [],
        layerStyle: expect.any(Object),
      }),
      undefined, // no children passed
    );
  });

  it('creates GeoJSON with correct projections', () => {
    render(<RecreationResourceMap recResource={mockRecResource} />);

    expect(GeoJSON).toHaveBeenCalledWith({
      dataProjection: 'EPSG:3005',
      featureProjection: 'EPSG:3857',
    });
  });
});
