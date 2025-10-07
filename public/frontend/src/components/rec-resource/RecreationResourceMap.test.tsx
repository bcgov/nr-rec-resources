import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecreationResourceMap } from './RecreationResourceMap';
import { BrowserRouter } from 'react-router-dom';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import { trackEvent } from '@shared/utils';

vi.mock('@shared/components/recreation-resource-map/helpers', () => ({
  getMapFeaturesFromRecResource: vi.fn(() => []),
  getLayerStyleForRecResource: vi.fn(() => ({})),
}));

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
  it('renders the component', () => {
    render(
      <BrowserRouter>
        <RecreationResourceMap recResource={mockRecResource} />
      </BrowserRouter>,
    );

    expect(screen.getByText('View in main map')).toBeInTheDocument();
    expect(screen.getByText('Export map file')).toBeInTheDocument();
  });

  it('renders View in main map button', () => {
    render(
      <BrowserRouter>
        <RecreationResourceMap recResource={mockRecResource} />
      </BrowserRouter>,
    );

    expect(screen.getByText('View in main map')).toBeInTheDocument();
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

  it('renders Export map file button', () => {
    render(
      <BrowserRouter>
        <RecreationResourceMap recResource={mockRecResource} />
      </BrowserRouter>,
    );

    expect(screen.getByText('Export map file')).toBeInTheDocument();
  });

  it('opens download modal when Export map file button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RecreationResourceMap recResource={mockRecResource} />
      </BrowserRouter>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const downloadButton = screen.getByText('Export map file');
    await user.click(downloadButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText('Export map file')).toHaveLength(2); // Button text and modal heading
  });

  it('tracks event when Export map file button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RecreationResourceMap recResource={mockRecResource} />
      </BrowserRouter>,
    );

    const downloadButton = screen.getByText('Export map file');
    await user.click(downloadButton);

    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Map',
      action: 'Export map file',
      name: 'Test Recreation Site-123-Export map file',
    });
  });

  it('tracks event when View in main map button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RecreationResourceMap recResource={mockRecResource} />
      </BrowserRouter>,
    );

    const viewInMapButton = screen.getByText('View in main map');
    await user.click(viewInMapButton);

    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Map',
      action: 'View in main map',
      name: 'Test Recreation Site-123-View in main map',
    });
  });
});
