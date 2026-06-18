import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ResourceHeader from '@/components/rec-resource/ResourceHeader';
import { RecreationResourceDetailDto } from '@/service/recreation-resource/models/RecreationResourceDetailDto';

// Mock the imports
vi.mock('@/images/fontAwesomeIcons/location-dot.svg', () => ({
  default: 'location-dot-icon.svg',
}));

vi.mock('@/constants/districtImageMap', () => ({
  districtImageMap: {
    EAST_KOOTENAY: '/images/east-kootenay.png',
    OKANAGAN_SHUSWAP: '/images/okanagan-shuswap.png',
  },
}));

vi.mock('@/components/rec-resource/Status', () => ({
  default: () => <div data-testid="status-component">Status</div>,
}));

vi.mock('@/components/rec-resource/RecResourceReservation', () => ({
  default: () => <div data-testid="rec-resource-reservation">Reservation</div>,
}));

const mockRecreationResource: RecreationResourceDetailDto = {
  additional_fees: [],
  campsite_count: 0,
  rec_resource_id: 'RES-123',
  name: 'Test Recreation Resource',
  closest_community: 'Test Community',
  recreation_activity: [],
  recreation_status: {
    status_code: 0,
    comment: null,
    description: 'Open',
  },
  rec_resource_type: 'Campground',
  description: 'Test description',
  driving_directions: 'Test directions',
};

const mockRecreationDistrict = {
  district_code: 'EAST_KOOTENAY',
  description: 'East Kootenay',
};

describe('ResourceHeader', () => {
  it('should render location icon and closest community', () => {
    const { container } = render(
      <ResourceHeader
        formattedName="Test Resource"
        recResourceType="Campground"
        recResourceId="RES-123"
        closestCommunity="Kelowna"
        isRecreationSite={false}
        recResource={mockRecreationResource}
        isMd={false}
      />,
    );

    const locationImg = container.querySelector('img[alt="Location dot icon"]');
    expect(locationImg).toBeInTheDocument();
    expect(screen.getByText('kelowna')).toBeInTheDocument();
  });

  it('should render Status component when statusCode and statusDescription provided', () => {
    render(
      <ResourceHeader
        formattedName="Test Resource"
        recResourceType="Campground"
        recResourceId="RES-123"
        statusCode={1}
        statusDescription="Temporarily Closed"
        isRecreationSite={false}
        recResource={mockRecreationResource}
        isMd={false}
      />,
    );

    expect(screen.getByTestId('status-component')).toBeInTheDocument();
  });

  it('should not render Status component without both statusCode and statusDescription', () => {
    render(
      <ResourceHeader
        formattedName="Test Resource"
        recResourceType="Campground"
        recResourceId="RES-123"
        statusCode={1}
        isRecreationSite={false}
        recResource={mockRecreationResource}
        isMd={false}
      />,
    );

    expect(screen.queryByTestId('status-component')).not.toBeInTheDocument();
  });

  it('should render RecResourceReservation when isRecreationSite is true', () => {
    render(
      <ResourceHeader
        formattedName="Test Resource"
        recResourceType="Campground"
        recResourceId="RES-123"
        isRecreationSite={true}
        recResource={mockRecreationResource}
        isMd={false}
      />,
    );

    expect(screen.getByTestId('rec-resource-reservation')).toBeInTheDocument();
  });

  it('should not render RecResourceReservation when isRecreationSite is false', () => {
    render(
      <ResourceHeader
        formattedName="Test Resource"
        recResourceType="Campground"
        recResourceId="RES-123"
        isRecreationSite={false}
        recResource={mockRecreationResource}
        isMd={false}
      />,
    );

    expect(
      screen.queryByTestId('rec-resource-reservation'),
    ).not.toBeInTheDocument();
  });

  it('should render district image container when isMd is true and recreationDistrict provided', () => {
    const { container } = render(
      <ResourceHeader
        formattedName="Test Resource"
        recResourceType="Campground"
        recResourceId="RES-123"
        isRecreationSite={false}
        recResource={mockRecreationResource}
        isMd={true}
        recreationDistrict={mockRecreationDistrict}
      />,
    );

    const districtImageContainer = container.querySelector(
      '.district-image-container',
    );
    expect(districtImageContainer).toBeInTheDocument();
  });

  it('should not render district image container when isMd is false', () => {
    const { container } = render(
      <ResourceHeader
        formattedName="Test Resource"
        recResourceType="Campground"
        recResourceId="RES-123"
        isRecreationSite={false}
        recResource={mockRecreationResource}
        isMd={false}
        recreationDistrict={mockRecreationDistrict}
      />,
    );

    const districtImageContainer = container.querySelector(
      '.district-image-container',
    );
    expect(districtImageContainer).not.toBeInTheDocument();
  });

  it('should not render district image container when recreationDistrict is not provided', () => {
    const { container } = render(
      <ResourceHeader
        formattedName="Test Resource"
        recResourceType="Campground"
        recResourceId="RES-123"
        isRecreationSite={false}
        recResource={mockRecreationResource}
        isMd={true}
      />,
    );

    const districtImageContainer = container.querySelector(
      '.district-image-container',
    );
    expect(districtImageContainer).not.toBeInTheDocument();
  });

  it('should render all sections with all props provided', () => {
    const { container } = render(
      <ResourceHeader
        formattedName="Full Test Resource"
        recResourceType="Campground"
        recResourceId="RES-999"
        closestCommunity="Vancouver"
        statusCode={1}
        statusDescription="Temporarily Closed"
        isRecreationSite={true}
        recResource={mockRecreationResource}
        isMd={true}
        recreationDistrict={mockRecreationDistrict}
      />,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Full Test Resource',
    );
    expect(screen.getByText('vancouver')).toBeInTheDocument();
    expect(screen.getByTestId('status-component')).toBeInTheDocument();
    expect(screen.getByTestId('rec-resource-reservation')).toBeInTheDocument();
    expect(
      container.querySelector('.district-image-container'),
    ).toBeInTheDocument();
  });
});
