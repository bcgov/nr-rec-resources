import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { RecreationResourceMap } from './RecreationResourceMap';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import { trackEvent } from '@shared/utils';

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

vi.mock('@shared/utils');

const mockRecResource = {
  rec_resource_id: '123',
  name: 'Test Recreation Site',
  rec_resource_type: 'Recreation Site',
  spatial_feature_geometry: [],
} as any as RecreationResourceDetailModel;

describe('RecreationResourceMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders the component', async () => {
    await renderWithRouter(
      <RecreationResourceMap recResource={mockRecResource} />,
    );

    expect(screen.getByText('Full map')).toBeInTheDocument();
    expect(screen.getByText('Export map file')).toBeInTheDocument();
    // expect(screen.getByText('Google Maps')).toBeInTheDocument();
  });

  it('renders Full map button', async () => {
    await renderWithRouter(
      <RecreationResourceMap recResource={mockRecResource} />,
    );

    expect(screen.getByText('Full map')).toBeInTheDocument();
  });

  it('applies custom className when provided', async () => {
    const { container } = await renderWithRouter(
      <RecreationResourceMap
        recResource={mockRecResource}
        className="custom-class"
      />,
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('renders Export map file button', async () => {
    await renderWithRouter(
      <RecreationResourceMap recResource={mockRecResource} />,
    );

    expect(screen.getByText('Export map file')).toBeInTheDocument();
  });

  it('opens download modal when Export map file button is clicked', async () => {
    const user = userEvent.setup();

    await renderWithRouter(
      <RecreationResourceMap recResource={mockRecResource} />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const downloadButton = screen.getByText('Export map file');
    await user.click(downloadButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText('Export map file')).toHaveLength(2); // Button text and modal heading
  });

  it('tracks event when Export map file button is clicked', async () => {
    const user = userEvent.setup();

    await renderWithRouter(
      <RecreationResourceMap recResource={mockRecResource} />,
    );

    const downloadButton = screen.getByText('Export map file');
    await user.click(downloadButton);

    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Map',
      action: 'Export map file',
      name: 'Test Recreation Site-123-Export map file',
    });
  });

  it('tracks event when Full map button is clicked', async () => {
    const user = userEvent.setup();

    await renderWithRouter(
      <RecreationResourceMap recResource={mockRecResource} />,
    );

    const viewInMapButton = screen.getByText('Full map');
    await user.click(viewInMapButton);

    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Map',
      action: 'View in main map',
      name: 'Test Recreation Site-123-View in main map',
    });
  });
});
