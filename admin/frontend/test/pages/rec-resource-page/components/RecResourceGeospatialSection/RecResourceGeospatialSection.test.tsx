import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockUseRecResource = vi.fn();
const mockUseGetRecreationResourceGeospatial = vi.fn();
const mockUseGetPendingMapFeatureRequests = vi.fn();
const mockUseGetExhibitADocs = vi.fn();
const mockUseAuthContext = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockPresignExhibitAUpload = vi.fn();
const mockFinalizeExhibitAUpload = vi.fn();
const mockCreateOrGetExhibitAByApplicationGuid = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className }: any) => (
    <button className={className}>{children}</button>
  ),
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
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

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetPendingMapFeatureRequests',
  () => ({
    useGetPendingMapFeatureRequests: (...args: any[]) =>
      mockUseGetPendingMapFeatureRequests(...args),
  }),
);

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetExhibitADocs',
  () => ({
    useGetExhibitADocs: (...args: any[]) => mockUseGetExhibitADocs(...args),
  }),
);

vi.mock(
  '@/services/hooks/recreation-resource-admin/useExhibitADocsHooks',
  () => ({
    usePresignExhibitAUpload: () => mockPresignExhibitAUpload(),
    useFinalizeExhibitAUpload: () => mockFinalizeExhibitAUpload(),
    useCreateOrGetExhibitAByApplicationGuid: () =>
      mockCreateOrGetExhibitAByApplicationGuid(),
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

vi.mock('@/components/file/DocumentUploadModal', () => ({
  DocumentUploadModal: ({ show }: { show: boolean }) =>
    show ? (
      <div data-testid="mock-document-upload-modal">Upload modal</div>
    ) : null,
}));

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

vi.mock('@/components/RecResourceSpatial/SpatialSubmissionSection', () => ({
  SpatialSubmissionSection: () => (
    <div data-testid="mock-spatial-submission">SpatialSubmissionSection</div>
  ),
}));

const { RecResourceGeospatialSection } = await import(
  '@/pages/rec-resource-page/components/RecResourceGeospatialSection/RecResourceGeospatialSection'
);

describe('RecResourceGeospatialSection', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  beforeEach(() => {
    mockUseAuthContext.mockReturnValue({
      user: {
        email: 'idir.user@gov.bc.ca',
        idir_username: 'IDIR\\idir.user',
        preferred_username: 'idir.user',
      },
    });

    mockUseAuthorizations.mockReturnValue({
      canView: true,
      canEdit: true,
      canViewFeatureFlag: true,
      canEditFeatureFlag: true,
      isSuperAdmin: true,
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

    mockUseGetPendingMapFeatureRequests.mockReturnValue({
      data: {
        data: [],
        total: 0,
      },
    });

    mockUseGetExhibitADocs.mockReturnValue({ data: [] });
    mockPresignExhibitAUpload.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mockFinalizeExhibitAUpload.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mockCreateOrGetExhibitAByApplicationGuid.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
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

  it('renders spatial submissions section', () => {
    render(<RecResourceGeospatialSection />);
    expect(screen.getByText('Spatial submissions')).toBeDefined();
    expect(screen.getByText('No spatial submissions found.')).toBeDefined();
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

  it('renders SNCSC reference link using status_request_guid when present', () => {
    vi.stubEnv('VITE_SNCSC_WEB_URL', 'https://example.gov.bc.ca/sncsc-web/');
    mockUseGetPendingMapFeatureRequests.mockReturnValueOnce({
      data: {
        data: [
          {
            submission_id: 'SUB-1',
            rec_resource_id: 'REC0001',
            amend_status_code: 'PND',
            feature_count: 1,
            geometry_types: ['Point'],
            status_request_guid: 'guid-123',
          },
        ],
        total: 1,
      },
    });

    render(<RecResourceGeospatialSection />);

    const sncscLink = screen.getByRole('link', { name: /SNCSC Link/i });
    expect(sncscLink).toHaveAttribute(
      'href',
      'https://example.gov.bc.ca/sncsc-web/guid-123',
    );
  });

  it('renders reference placeholder when status_request_guid is missing', () => {
    vi.stubEnv('VITE_SNCSC_WEB_URL', 'https://example.gov.bc.ca/sncsc-web');
    mockUseGetPendingMapFeatureRequests.mockReturnValueOnce({
      data: {
        data: [
          {
            submission_id: 'SUB-2',
            rec_resource_id: 'REC0001',
            amend_status_code: 'PND',
            feature_count: 1,
            geometry_types: ['Point'],
          },
        ],
        total: 1,
      },
    });

    render(<RecResourceGeospatialSection />);

    expect(screen.queryByRole('link', { name: /SNCSC Link/i })).toBeNull();
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
  });
});
