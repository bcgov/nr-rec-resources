import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecreationResourceMap } from '../RecreationResourceMap';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import { trackEvent } from '@/utils/matomo';
import { MATOMO_TRACKING_CATEGORY_MAP } from '@/components/rec-resource/RecreationResourceMap/constants';
import { SearchMapFocusModes } from '@/components/search-map/constants';
import { ROUTE_PATHS } from '@/routes/constants';

// Mock external dependencies
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
  default: vi.fn().mockImplementation((config) => ({
    getSource: () => config.source,
    getVisible: () => config.visible,
    setVisible: vi.fn(),
  })),
}));

vi.mock('ol/source/Vector', () => ({
  default: vi.fn().mockImplementation(({ features }) => ({
    getFeatures: () => features || [],
    addFeatures: vi.fn(),
    clear: vi.fn(),
  })),
}));

vi.mock('@/components/rec-resource/RecreationResourceMap/helpers', () => ({
  getMapFeaturesFromRecResource: vi.fn(),
  getLayerStyleForRecResource: vi.fn(),
  getSitePointFeatureFromRecResource: vi.fn(),
  webMercatorXToLon: vi.fn((x) => x * 0.00001),
  webMercatorYToLat: vi.fn((y) => y * 0.00001),
}));

vi.mock('@/utils/matomo', () => ({ trackEvent: vi.fn() }));

vi.mock(
  '@/components/rec-resource/RecreationResourceMap/DownloadMapModal',
  () => ({
    default: vi.fn(({ isOpen, setIsOpen, styledFeatures, recResource }) => (
      <div
        data-testid="download-modal"
        data-is-open={isOpen}
        data-features-count={styledFeatures?.length || 0}
        data-resource-id={recResource?.rec_resource_id}
      >
        <button onClick={() => setIsOpen(false)}>Close Modal</button>
      </div>
    )),
  }),
);

vi.mock('@/images/icons/download.svg', () => ({
  default: '/mocked-download-icon.svg',
}));

vi.mock('@shared/components/icon-button', () => ({
  IconButton: ({ children, leftIcon, ...props }: any) => (
    <button {...props}>
      {leftIcon && <span data-testid="left-icon">{leftIcon}</span>}
      {children}
    </button>
  ),
}));

// Import mocked functions
import {
  getMapFeaturesFromRecResource,
  getLayerStyleForRecResource,
  getSitePointFeatureFromRecResource,
  webMercatorXToLon,
  webMercatorYToLat,
} from '@/components/rec-resource/RecreationResourceMap/helpers';

const mockGetMapFeaturesFromRecResource = vi.mocked(
  getMapFeaturesFromRecResource,
);

const mockGetLayerStyleForRecResource = vi.mocked(getLayerStyleForRecResource);
const mockTrackEvent = vi.mocked(trackEvent);

// Test utilities
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

const createMockFeature = (id: string) => ({
  getId: () => id,
  setStyle: vi.fn(),
  getGeometry: () => ({ getType: () => 'Point' }),
  getProperties: () => ({ name: `Feature ${id}` }),
});

const mockResource: RecreationResourceDetailModel = {
  rec_resource_id: '123',
  name: 'Test Resource',
  description: 'Test Description',
  location: 'Test Location',
} as unknown as RecreationResourceDetailModel;

const mockResourceWithoutName = {
  ...mockResource,
  rec_resource_id: '456',
  name: '',
};

describe('RecreationResourceMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders map when features are available', () => {
      const mockFeatures = [createMockFeature('1'), createMockFeature('2')];
      const mockStyle = vi.fn();

      mockGetMapFeaturesFromRecResource.mockReturnValue(mockFeatures as any);
      mockGetLayerStyleForRecResource.mockReturnValue(mockStyle as any);

      render(
        <TestWrapper>
          <RecreationResourceMap recResource={mockResource} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('vector-feature-map')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Map showing Test Resource'),
      ).toBeInTheDocument();
      expect(screen.getByText('Full map')).toBeInTheDocument();
      expect(screen.getByText('Export map file')).toBeInTheDocument();
    });

    it.each([
      ['empty array', []],
      ['null', null],
      ['undefined', undefined],
    ])('does not render when features are %s', (_, returnValue) => {
      mockGetMapFeaturesFromRecResource.mockReturnValue(returnValue as any);

      const { container } = render(
        <TestWrapper>
          <RecreationResourceMap recResource={mockResource} />
        </TestWrapper>,
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders download icon with correct attributes', () => {
      const mockFeatures = [createMockFeature('1')];
      mockGetMapFeaturesFromRecResource.mockReturnValue(mockFeatures as any);
      mockGetLayerStyleForRecResource.mockReturnValue(vi.fn());

      render(
        <TestWrapper>
          <RecreationResourceMap recResource={mockResource} />
        </TestWrapper>,
      );

      const downloadIcon = screen.getByAltText('Download map');
      expect(downloadIcon).toHaveAttribute('src', '/mocked-download-icon.svg');
      expect(downloadIcon).toHaveAttribute('width', '16');
      expect(downloadIcon).toHaveAttribute('height', '16');
    });
  });

  describe('Feature Processing', () => {
    it('applies styles to features and creates vector layer', () => {
      const mockFeatures = [createMockFeature('1'), createMockFeature('2')];
      const mockStyle = vi.fn();

      mockGetMapFeaturesFromRecResource.mockReturnValue(mockFeatures as any);
      mockGetLayerStyleForRecResource.mockReturnValue(mockStyle);

      render(
        <TestWrapper>
          <RecreationResourceMap recResource={mockResource} />
        </TestWrapper>,
      );

      mockFeatures.forEach((feature) => {
        expect(feature.setStyle).toHaveBeenCalledWith(mockStyle);
      });

      const mapComponent = screen.getByTestId('vector-feature-map');
      expect(mapComponent).toHaveAttribute('data-layers-count', '1');
    });
  });

  describe('Resource Name Handling', () => {
    it.each([
      ['with name', mockResource, 'Test Resource'],
      ['empty name', mockResourceWithoutName, 'Unnamed Resource'],
      ['null name', { ...mockResource, name: null as any }, 'Unnamed Resource'],
    ])('handles resource %s correctly', (_, resource, expectedName) => {
      const mockFeatures = [createMockFeature('1')];
      mockGetMapFeaturesFromRecResource.mockReturnValue(mockFeatures as any);
      mockGetLayerStyleForRecResource.mockReturnValue(vi.fn());

      render(
        <TestWrapper>
          <RecreationResourceMap recResource={resource} />
        </TestWrapper>,
      );

      expect(
        screen.getByLabelText(`Map showing ${expectedName}`),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(`View ${expectedName} in main map`),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(`Export map file for ${expectedName}`),
      ).toBeInTheDocument();
    });
  });

  describe('Navigation and Events', () => {
    beforeEach(() => {
      const mockFeatures = [createMockFeature('1')];
      mockGetMapFeaturesFromRecResource.mockReturnValue(mockFeatures as any);
      mockGetLayerStyleForRecResource.mockReturnValue(vi.fn());
    });

    it('generates correct main map URL', () => {
      render(
        <TestWrapper>
          <RecreationResourceMap recResource={mockResource} />
        </TestWrapper>,
      );

      const viewMainMapLink = screen.getByText('Full map').closest('a');
      expect(viewMainMapLink).toHaveAttribute(
        'href',
        `${ROUTE_PATHS.SEARCH}?view=map&focus=${SearchMapFocusModes.REC_RESOURCE_ID}:123`,
      );
    });

    it.each([
      [
        'View in main map',
        'view-main-map-button',
        'View in main map',
        'Test Resource-123-View in main map',
      ],
      [
        'export map file',
        'download-button',
        'Export map file',
        'Test Resource-123-Export map file',
      ],
      [
        'Google Maps button',
        'google-maps',
        'Open in Google Maps',
        'Test Resource-123-Open in Google Maps',
      ],
    ])(
      'tracks %s click event',
      async (_, buttonTestId, action, expectedName) => {
        render(
          <TestWrapper>
            <RecreationResourceMap recResource={mockResource} />
          </TestWrapper>,
        );

        if (buttonTestId === 'google-maps') {
          const mockGeom = { getCoordinates: vi.fn(() => [100, 200]) };
          const mockFeature = { getGeometry: vi.fn(() => mockGeom) };
          (getSitePointFeatureFromRecResource as any).mockReturnValue(
            mockFeature,
          );
          (getMapFeaturesFromRecResource as any).mockReturnValue([
            { setStyle: vi.fn() },
          ]);
          const openSpy = vi
            .spyOn(window, 'open')
            .mockImplementation(() => null);

          fireEvent.click(screen.getByTestId(buttonTestId));

          expect(trackEvent).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'Open in Google Maps' }),
          );
          expect(webMercatorYToLat).toHaveBeenCalledWith(200);
          expect(webMercatorXToLon).toHaveBeenCalledWith(100);
          expect(openSpy).toHaveBeenCalledWith(
            expect.stringContaining(
              'https://www.google.com/maps/search/?api=1&query=',
            ),
            '_blank',
          );
        } else {
          fireEvent.click(screen.getByTestId(buttonTestId));
          expect(mockTrackEvent).toHaveBeenCalledWith({
            category: MATOMO_TRACKING_CATEGORY_MAP,
            action,
            name: expectedName,
          });
        }
      },
    );

    it('tracks events with fallback name when resource name is empty', () => {
      render(
        <TestWrapper>
          <RecreationResourceMap recResource={mockResourceWithoutName} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByTestId('view-main-map-button'));

      expect(mockTrackEvent).toHaveBeenCalledWith({
        category: MATOMO_TRACKING_CATEGORY_MAP,
        action: 'View in main map',
        name: 'Unnamed Resource-456-View in main map',
      });
    });

    it('handles missing rec_resource_id', () => {
      const resourceWithoutId = {
        ...mockResource,
        rec_resource_id: undefined,
      } as any;

      render(
        <TestWrapper>
          <RecreationResourceMap recResource={resourceWithoutId} />
        </TestWrapper>,
      );

      const viewMainMapLink = screen.getByText('Full map').closest('a');
      expect(viewMainMapLink).toHaveAttribute(
        'href',
        `${ROUTE_PATHS.SEARCH}?view=map&focus=${SearchMapFocusModes.REC_RESOURCE_ID}:undefined`,
      );
    });
  });

  describe('Download Modal', () => {
    beforeEach(() => {
      const mockFeatures = [createMockFeature('1'), createMockFeature('2')];
      mockGetMapFeaturesFromRecResource.mockReturnValue(mockFeatures as any);
      mockGetLayerStyleForRecResource.mockReturnValue(vi.fn());
    });

    it('opens and closes download modal with correct data', async () => {
      render(
        <TestWrapper>
          <RecreationResourceMap recResource={mockResource} />
        </TestWrapper>,
      );

      // Open modal
      fireEvent.click(screen.getByTestId('download-button'));

      await waitFor(() => {
        const modal = screen.getByTestId('download-modal');
        expect(modal).toHaveAttribute('data-is-open', 'true');
        expect(modal).toHaveAttribute('data-features-count', '2');
        expect(modal).toHaveAttribute('data-resource-id', '123');
      });

      // Close modal
      fireEvent.click(screen.getByText('Close Modal'));

      await waitFor(() => {
        expect(screen.getByTestId('download-modal')).toHaveAttribute(
          'data-is-open',
          'false',
        );
      });
    });
  });

  describe('Memoization', () => {
    it('memoizes styled features based on recResource changes', () => {
      const mockFeatures1 = [createMockFeature('1')];
      const mockFeatures2 = [createMockFeature('2')];
      const mockStyle = vi.fn();

      mockGetMapFeaturesFromRecResource.mockReturnValue(mockFeatures1 as any);
      mockGetLayerStyleForRecResource.mockReturnValue(mockStyle);

      const { rerender } = render(
        <TestWrapper>
          <RecreationResourceMap recResource={mockResource} />
        </TestWrapper>,
      );

      expect(mockGetMapFeaturesFromRecResource).toHaveBeenCalledTimes(2);

      // Rerender with same props
      rerender(
        <TestWrapper>
          <RecreationResourceMap recResource={mockResource} />
        </TestWrapper>,
      );
      expect(mockGetMapFeaturesFromRecResource).toHaveBeenCalledTimes(2);

      // Rerender with different resource
      mockGetMapFeaturesFromRecResource.mockReturnValue(mockFeatures2 as any);
      rerender(
        <TestWrapper>
          <RecreationResourceMap recResource={mockResourceWithoutName} />
        </TestWrapper>,
      );
      expect(mockGetMapFeaturesFromRecResource).toHaveBeenCalledTimes(4);
    });
  });
});
