import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUseRecResource = vi.fn();
const mockUseGetRecreationResourceGeospatial = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className }: any) => (
    <button className={className}>{children}</button>
  ),
}));

const mockRoute = {
  useParams: vi.fn(() => ({
    id: 'REC0001',
  })),
};

vi.mock('@/routes/rec-resource/$id/geospatial', () => ({
  Route: mockRoute,
}));

vi.mock('@/pages/rec-resource-page/hooks/useRecResource', () => ({
  useRecResource: (...args: any[]) => mockUseRecResource(...args),
}));

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceGeospatial',
  () => ({
    useGetRecreationResourceGeospatial: (...args: any[]) =>
      mockUseGetRecreationResourceGeospatial(...args),
  }),
);

vi.mock('@/components/auth', () => ({
  EditableGuard: ({ children }: any) => <>{children}</>,
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceGeospatialSection/ExhibitASection/ExhibitASection',
  () => ({
    ExhibitASection: () => (
      <div data-testid="mock-exhibit-a">ExhibitASection</div>
    ),
  }),
);

const mockUseAuthorizations = vi.fn();
vi.mock('@/hooks/useAuthorizations', () => ({
  ROLES: {
    VIEWER: 'rst-viewer',
    ADMIN: 'rst-admin',
    DEVELOPER: 'rst-developer',
  },
  useAuthorizations: () => mockUseAuthorizations(),
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceLocationSection',
  () => ({
    RecResourceLocationSection: () => (
      <div data-testid="mock-location">LocationSection rendered</div>
    ),
  }),
);

const { RecResourceGeospatialSection } = await import(
  '@/pages/rec-resource-page/components/RecResourceGeospatialSection/RecResourceGeospatialSection'
);

describe('RecResourceGeospatialSection', () => {
  beforeEach(() => {
    mockUseAuthorizations.mockReturnValue({
      canView: true,
      canEdit: true,
      canViewFeatureFlag: true,
      canEditFeatureFlag: true,
    });

    mockUseRecResource.mockReturnValue({
      rec_resource_id: 'REC0001',
      recResource: { rec_status_code: 'OP' },
      isLoading: false,
      error: undefined,
    });

    mockUseGetRecreationResourceGeospatial.mockReturnValue({
      data: {
        utm_zone: 10,
        utm_easting: 500000,
        utm_northing: 5480000,
        latitude: 49.123456,
        longitude: -123.654321,
      },
    });
  });

  it('renders header and edit link', () => {
    render(<RecResourceGeospatialSection />);

    expect(screen.getByText('Geospatial')).toBeDefined();
    expect(screen.getByText('Edit')).toBeDefined();
  });

  it('renders geospatial overview items with formatted coordinates', () => {
    render(<RecResourceGeospatialSection />);

    expect(screen.getByText('UTM zone')).toBeDefined();
    expect(screen.getByText('10')).toBeDefined();

    expect(screen.getByText('UTM easting')).toBeDefined();
    expect(screen.getByText('500000')).toBeDefined();

    expect(screen.getByText('UTM northing')).toBeDefined();
    expect(screen.getByText('5480000')).toBeDefined();

    expect(screen.getByText('Latitude')).toBeDefined();
    expect(screen.getByText('49.123456')).toBeDefined();

    expect(screen.getByText('Longitude')).toBeDefined();
    expect(screen.getByText('-123.654321')).toBeDefined();
  });

  it('renders RecResourceLocationSection when recResource exists', () => {
    render(<RecResourceGeospatialSection />);

    expect(screen.getByTestId('mock-location')).toHaveTextContent(
      'LocationSection rendered',
    );
  });

  it('does not render edit button when geometry data is missing', () => {
    mockUseGetRecreationResourceGeospatial.mockReturnValueOnce({
      data: {},
    });

    render(<RecResourceGeospatialSection />);

    expect(screen.queryByText('Edit')).toBeNull();
  });

  it('renders section with empty fallback when geospatial data is undefined', () => {
    mockUseGetRecreationResourceGeospatial.mockReturnValueOnce({
      data: undefined,
    });

    render(<RecResourceGeospatialSection />);

    expect(screen.getByText('Geospatial')).toBeDefined();
    expect(screen.queryByText('Edit')).toBeNull();
  });

  it('renders ExhibitASection', () => {
    render(<RecResourceGeospatialSection />);
    expect(screen.getByTestId('mock-exhibit-a')).toBeDefined();
  });

  it('does not render RecResourceLocationSection when recResource is null', () => {
    mockUseRecResource.mockReturnValueOnce({
      recResource: null,
      isLoading: false,
    });

    render(<RecResourceGeospatialSection />);
    expect(screen.queryByTestId('mock-location')).toBeNull();
  });

  it('uses imap URL fallback when no lat/lon or UTM data', () => {
    mockUseGetRecreationResourceGeospatial.mockReturnValueOnce({
      data: {
        // no latitude, longitude, utm_zone, utm_easting, utm_northing
      },
    });

    // Should render without throwing (imapUrl falls back to IMAP_URL constant)
    render(<RecResourceGeospatialSection />);
    expect(screen.getByText('Geospatial')).toBeDefined();
  });

  it('renders measure items (total area) for site resources', () => {
    mockUseRecResource.mockReturnValue({
      recResource: { rec_status_code: 'OP', rec_resource_type_code: 'SIT' },
      isLoading: false,
      error: undefined,
    });
    mockUseGetRecreationResourceGeospatial.mockReturnValueOnce({
      data: {
        utm_zone: 10,
        utm_easting: 500000,
        utm_northing: 5480000,
        latitude: 49.12,
        longitude: -123.65,
        total_area_hectares: 61.6545,
      },
    });

    render(<RecResourceGeospatialSection />);

    expect(screen.getByText('Total area (ha)')).toBeDefined();
    expect(screen.getByText('61.6545')).toBeDefined();

    expect(screen.queryByText('Total length (km)')).toBeNull();
    expect(screen.queryByText('Right-of-way width (m)')).toBeNull();
  });

  it('renders measure items (total length, right-of-way) for trail resources', () => {
    mockUseRecResource.mockReturnValue({
      recResource: { rec_status_code: 'OP', rec_resource_type_code: 'RTE' },
      isLoading: false,
      error: undefined,
    });
    mockUseGetRecreationResourceGeospatial.mockReturnValueOnce({
      data: {
        utm_zone: 10,
        utm_easting: 500000,
        utm_northing: 5480000,
        latitude: 49.12,
        longitude: -123.65,
        total_length_km: 41.103,
        right_of_way_m: 15,
      },
    });

    render(<RecResourceGeospatialSection />);

    expect(screen.getByText('Total length (km)')).toBeDefined();
    expect(screen.getByText('41.103')).toBeDefined();

    expect(screen.getByText('Right-of-way width (m)')).toBeDefined();
    expect(screen.getByText('15.00')).toBeDefined();

    expect(screen.queryByText('Total area (ha)')).toBeNull();
  });
});
