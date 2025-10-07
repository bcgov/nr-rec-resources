import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecreationResourceMap } from '@/components/rec-resource/RecreationResourceMap';
import { BrowserRouter } from 'react-router-dom';
import { RecreationResourceDetailModel } from '@/service/custom-models';

vi.mock('@shared/components/recreation-resource-map', () => ({
  RecreationResourceMap: ({
    recResource,
  }: {
    recResource: { name: string };
  }) => <div data-testid="shared-map">{recResource.name}</div>,
  MATOMO_TRACKING_CATEGORY_MAP: 'Map',
}));

vi.mock('@shared/utils', () => ({
  trackEvent: vi.fn(),
}));

const mockRecResource = {
  rec_resource_id: '123',
  name: 'Test Recreation Site',
  closest_community: 'Test City',
  recreation_activity: [],
  recreation_status: { code: 'OPEN', description: 'Open' },
  rec_resource_type: 'Recreation Site',
  description: 'Test description',
  driving_directions: 'Test directions',
  maintenance_standard_code: 'M',
  campsite_count: 5,
  recreation_fee: [],
  recreation_access: [],
  additional_fees: [],
  recreation_structure: {},
} as RecreationResourceDetailModel;

describe('RecreationResourceMap', () => {
  it('renders the shared map component', () => {
    render(
      <BrowserRouter>
        <RecreationResourceMap recResource={mockRecResource} />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('shared-map')).toBeInTheDocument();
    expect(screen.getByText('Test Recreation Site')).toBeInTheDocument();
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
});
