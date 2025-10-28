import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecreationResourceMap } from '@/components/rec-resource/RecreationResourceMap';
import { BrowserRouter } from 'react-router-dom';
import { RecreationResourceDetailModel } from '@/service/custom-models';

const mockFeature = {
  setStyle: vi.fn(),
  getGeometry: vi.fn(() => ({
    getCoordinates: vi.fn(() => [0, 0]),
  })),
};

vi.mock('@shared/components/recreation-resource-map', async () => {
  const actual = await vi.importActual(
    '@shared/components/recreation-resource-map',
  );
  return {
    ...actual,
    RecreationResourceMap: ({ recResource }: any) => (
      <div data-testid="shared-recreation-resource-map">
        Mock Map for {recResource.name}
      </div>
    ),
    getMapFeaturesFromRecResource: vi.fn(() => [mockFeature]),
    getSitePointFeatureFromRecResource: vi.fn(() => mockFeature),
    getLayerStyleForRecResource: vi.fn(() => ({})),
  };
});

vi.mock('@shared/utils', () => ({
  trackEvent: vi.fn(),
}));

const mockRecResource = {
  rec_resource_id: '123',
  name: 'Test Recreation Site',
  closest_community: 'Test City',
  recreation_activity: [],
  recreation_status: {
    status_code: 1,
    description: 'Open',
    comment: null,
  },
  rec_resource_type: 'Recreation Site',
  description: 'Test description',
  driving_directions: 'Test directions',
  maintenance_standard_code: 'M',
  campsite_count: 5,
  recreation_fee: [],
  recreation_access: [],
  additional_fees: [],
  recreation_structure: {},
  spatial_feature_geometry: [],
} as unknown as RecreationResourceDetailModel;

describe('RecreationResourceMap', () => {
  it('renders the component', () => {
    render(
      <BrowserRouter>
        <RecreationResourceMap recResource={mockRecResource} />
      </BrowserRouter>,
    );

    expect(screen.getByText('Full map')).toBeInTheDocument();
    expect(screen.getByText('Export map file')).toBeInTheDocument();
    // expect(screen.getByText('Google Maps')).toBeInTheDocument();
  });

  it('renders Full map button', () => {
    render(
      <BrowserRouter>
        <RecreationResourceMap recResource={mockRecResource} />
      </BrowserRouter>,
    );

    expect(screen.getByText('Full map')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <BrowserRouter>
        <RecreationResourceMap
          recResource={mockRecResource}
          className="custom-class"
        />
      </BrowserRouter>,
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
