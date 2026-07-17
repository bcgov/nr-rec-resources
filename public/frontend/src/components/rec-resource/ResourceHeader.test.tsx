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
        advisoriesCount={0}
      />,
    );

    const locationImg = container.querySelector('img[alt="Location dot icon"]');
    expect(locationImg).toBeInTheDocument();
    expect(screen.getByText('kelowna')).toBeInTheDocument();
  });

  it('should always render the Status component', () => {
    render(
      <ResourceHeader
        formattedName="Test Resource"
        recResourceType="Campground"
        recResourceId="RES-123"
        isRecreationSite={false}
        recResource={mockRecreationResource}
        isMd={false}
        advisoriesCount={0}
      />,
    );

    expect(screen.getByTestId('status-component')).toBeInTheDocument();
  });

  it('should pass topAdvisoryGrouplabel to Status component', () => {
    render(
      <ResourceHeader
        formattedName="Test Resource"
        recResourceType="Campground"
        recResourceId="RES-123"
        topAdvisoryGrouplabel="Seasonal restrictions"
        isRecreationSite={false}
        recResource={mockRecreationResource}
        isMd={false}
        advisoriesCount={2}
      />,
    );

    expect(screen.getByTestId('status-component')).toBeInTheDocument();
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
        advisoriesCount={0}
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
        advisoriesCount={0}
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
        advisoriesCount={0}
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
        advisoriesCount={0}
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
        advisoriesCount={0}
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
        topAdvisoryGrouplabel="Closed"
        isRecreationSite={true}
        recResource={mockRecreationResource}
        isMd={true}
        recreationDistrict={mockRecreationDistrict}
        advisoriesCount={3}
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
