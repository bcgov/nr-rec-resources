import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecreationResourceMap } from '@shared/components/recreation-resource-map/RecreationResourceMap';
import { RecreationResourceMapData } from '@shared/components/recreation-resource-map/types';
import {
  getMapFeaturesFromRecResource,
  getLayerStyleForRecResource,
} from '@shared/components/recreation-resource-map/helpers';

vi.mock('@bcgov/prp-map', () => ({
  VectorFeatureMap: vi.fn(({ style, layers, 'aria-label': ariaLabel }) => (
    <div
      data-testid="vector-feature-map"
      style={style}
      aria-label={ariaLabel}
      data-layers-count={layers?.length || 0}
    />
  )),
}));

vi.mock('ol/layer/Vector', () => ({
  default: vi.fn().mockImplementation(function (config) {
    return {
      getSource: () => config.source,
      getVisible: () => config.visible,
      setVisible: vi.fn(),
    };
  }),
}));

vi.mock('ol/source/Vector', () => ({
  default: vi.fn().mockImplementation(function ({ features }) {
    return {
      getFeatures: () => features || [],
      addFeatures: vi.fn(),
      clear: vi.fn(),
    };
  }),
}));

vi.mock('@shared/components/recreation-resource-map/helpers', () => ({
  getMapFeaturesFromRecResource: vi.fn(),
  getLayerStyleForRecResource: vi.fn(),
}));

const mockGetMapFeaturesFromRecResource = vi.mocked(
  getMapFeaturesFromRecResource,
);
const mockGetLayerStyleForRecResource = vi.mocked(getLayerStyleForRecResource);

// Test utilities
const createMockFeature = (id: string) => ({
  getId: () => id,
  setStyle: vi.fn(),
  getGeometry: () => ({
    getExtent: () => [0, 0, 100, 100],
  }),
});

const mockRecResource: RecreationResourceMapData = {
  rec_resource_id: '123',
  name: 'Test Recreation Site',
  rec_resource_type: 'Recreation Site',
  site_point_geometry: 'POINT(-123.5 48.5)',
};

describe('RecreationResourceMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders VectorFeatureMap when features exist', () => {
      const mockFeature = createMockFeature('feature-1');
      mockGetMapFeaturesFromRecResource.mockReturnValue([mockFeature as any]);
      mockGetLayerStyleForRecResource.mockReturnValue({} as any);

      render(<RecreationResourceMap recResource={mockRecResource} />);

      expect(screen.getByTestId('vector-feature-map')).toBeInTheDocument();
      expect(screen.getByTestId('vector-feature-map')).toHaveAttribute(
        'aria-label',
        'Map showing Test Recreation Site',
      );
    });

    it('does not render when no features exist', () => {
      mockGetMapFeaturesFromRecResource.mockReturnValue([]);

      const { container } = render(
        <RecreationResourceMap recResource={mockRecResource} />,
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('applies custom CSS styles when provided', () => {
      const mockFeature = createMockFeature('feature-1');
      mockGetMapFeaturesFromRecResource.mockReturnValue([mockFeature as any]);
      mockGetLayerStyleForRecResource.mockReturnValue({} as any);

      const customStyles = {
        width: '500px',
        height: '400px',
      };

      render(
        <RecreationResourceMap
          recResource={mockRecResource}
          mapComponentCssStyles={customStyles}
        />,
      );

      const mapElement = screen.getByTestId('vector-feature-map');
      expect(mapElement).toHaveStyle('width: 500px');
      expect(mapElement).toHaveStyle('height: 400px');
    });

    it('uses resource name for aria-label', () => {
      const mockFeature = createMockFeature('feature-1');
      mockGetMapFeaturesFromRecResource.mockReturnValue([mockFeature as any]);
      mockGetLayerStyleForRecResource.mockReturnValue({} as any);

      render(<RecreationResourceMap recResource={mockRecResource} />);

      expect(screen.getByTestId('vector-feature-map')).toHaveAttribute(
        'aria-label',
        'Map showing Test Recreation Site',
      );
    });
  });

  describe('Feature Styling', () => {
    it('calls getMapFeaturesFromRecResource with correct resource', () => {
      const mockFeature = createMockFeature('feature-1');
      mockGetMapFeaturesFromRecResource.mockReturnValue([mockFeature as any]);
      mockGetLayerStyleForRecResource.mockReturnValue({} as any);

      render(<RecreationResourceMap recResource={mockRecResource} />);

      expect(mockGetMapFeaturesFromRecResource).toHaveBeenCalledWith(
        mockRecResource,
      );
    });

    it('calls getLayerStyleForRecResource with correct parameters', () => {
      const mockFeature = createMockFeature('feature-1');
      mockGetMapFeaturesFromRecResource.mockReturnValue([mockFeature as any]);
      mockGetLayerStyleForRecResource.mockReturnValue({} as any);

      render(<RecreationResourceMap recResource={mockRecResource} />);

      expect(mockGetLayerStyleForRecResource).toHaveBeenCalledWith(
        mockRecResource,
        'MAP_DISPLAY',
      );
    });

    it('applies style to each feature', () => {
      const mockFeature1 = createMockFeature('feature-1');
      const mockFeature2 = createMockFeature('feature-2');
      mockGetMapFeaturesFromRecResource.mockReturnValue([
        mockFeature1 as any,
        mockFeature2 as any,
      ]);
      const mockStyle = { test: 'style' };
      mockGetLayerStyleForRecResource.mockReturnValue(mockStyle as any);

      render(<RecreationResourceMap recResource={mockRecResource} />);

      expect(mockFeature1.setStyle).toHaveBeenCalledWith(mockStyle);
      expect(mockFeature2.setStyle).toHaveBeenCalledWith(mockStyle);
    });
  });
});
