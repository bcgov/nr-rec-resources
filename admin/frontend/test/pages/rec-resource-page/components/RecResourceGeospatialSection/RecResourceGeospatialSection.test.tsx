import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

const mockAddSuccessNotification = vi.fn();
const mockAddErrorNotification = vi.fn();

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: (...args: any[]) => mockAddErrorNotification(...args),
  addSuccessNotification: (...args: any[]) =>
    mockAddSuccessNotification(...args),
}));

vi.mock('@/components/file/DocumentUploadModal', () => ({
  DocumentUploadModal: ({
    show,
    fileName,
    onFileNameChange,
    onConfirm,
    onCancel,
  }: {
    show: boolean;
    fileName: string;
    onFileNameChange?: (value: string) => void;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) =>
    show ? (
      <div data-testid="mock-document-upload-modal">
        <input
          aria-label="document-file-name-input"
          value={fileName}
          onChange={(event) => onFileNameChange?.(event.target.value)}
        />
        <button type="button" onClick={onConfirm}>
          Confirm upload
        </button>
        <button type="button" onClick={onCancel}>
          Cancel upload
        </button>
      </div>
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
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    mockAddSuccessNotification.mockClear();
    mockAddErrorNotification.mockClear();
    mockInvalidateQueries.mockClear();
    mockInvalidateQueries.mockResolvedValue(undefined);

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

  it('maps pending status and purpose labels', () => {
    mockUseGetPendingMapFeatureRequests.mockReturnValueOnce({
      data: {
        data: [
          {
            submission_id: 'SUB-3',
            rec_resource_id: 'REC0001',
            amend_status_code: 'APPROVED_AMEND',
            feature_count: 1,
            geometry_types: ['Polygon'],
          },
          {
            submission_id: 'SUB-4',
            rec_resource_id: 'REC0001',
            amend_status_code: 'REJECTED_RETIRE',
            feature_count: 1,
            geometry_types: ['Polygon'],
          },
        ],
        total: 2,
      },
    });

    render(<RecResourceGeospatialSection />);

    expect(screen.getByText('APPROVED')).toBeDefined();
    expect(screen.getByText('REJECTED')).toBeDefined();
    expect(screen.getByText('Amendment')).toBeDefined();
    expect(screen.getByText('Retire')).toBeDefined();
  });

  it('shows compact create form after clicking Create new', () => {
    render(<RecResourceGeospatialSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Create new' }));

    expect(screen.getByTestId('mock-spatial-submission')).toBeDefined();
  });

  it('disables upload and regenerate actions for non-super-admin users', () => {
    mockUseAuthorizations.mockReturnValue({
      canView: true,
      canEdit: true,
      canViewFeatureFlag: true,
      canEditFeatureFlag: true,
      isSuperAdmin: false,
    });
    mockUseGetPendingMapFeatureRequests.mockReturnValue({
      data: {
        data: [
          {
            submission_id: 'SUB-5',
            application_guid: 'app-guid-5',
            rec_resource_id: 'REC0001',
            amend_status_code: 'PND',
            feature_count: 1,
            geometry_types: ['Polygon'],
          },
        ],
        total: 1,
      },
    });

    render(<RecResourceGeospatialSection />);

    expect(screen.getByRole('button', { name: /Upload/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Regenerate/i })).toBeDisabled();
  });

  it('opens the upload modal and uploads exhibit A successfully', async () => {
    const presignMutate = vi.fn().mockResolvedValue({
      url: 'https://example.com/presign',
      document_id: 'doc-1',
    });
    const finalizeMutate = vi.fn().mockResolvedValue({
      url: 'https://example.com/final.pdf',
    });

    mockPresignExhibitAUpload.mockReturnValue({
      mutateAsync: presignMutate,
      isPending: false,
    });
    mockFinalizeExhibitAUpload.mockReturnValue({
      mutateAsync: finalizeMutate,
      isPending: false,
    });

    // mockReturnValue (not Once) so re-renders keep the same row
    mockUseGetPendingMapFeatureRequests.mockReturnValue({
      data: {
        data: [
          {
            submission_id: 'SUB-6',
            rec_resource_id: 'REC0001',
            application_guid: 'app-guid-6',
            amend_status_code: 'PND',
            feature_count: 1,
            geometry_types: ['Polygon'],
            requested_at: '2026-09-01T12:00:00Z',
          },
        ],
        total: 1,
      },
    });

    render(<RecResourceGeospatialSection />);

    fireEvent.click(screen.getByRole('button', { name: /Upload Exhibit A/i }));

    fireEvent.change(screen.getByLabelText('Upload Exhibit A document'), {
      target: {
        files: [
          new File(['exhibit'], 'report.pdf', { type: 'application/pdf' }),
        ],
      },
    });

    expect(screen.getByTestId('mock-document-upload-modal')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm upload' }));

    // Wait for the LAST side effect in the chain; everything before it has run
    await waitFor(() => {
      expect(mockAddSuccessNotification).toHaveBeenCalledWith(
        'Exhibit A uploaded successfully.',
      );
    });

    expect(presignMutate).toHaveBeenCalledWith({
      recResourceId: 'REC0001',
      fileName: 'report.pdf',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/presign',
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
      }),
    );
    expect(finalizeMutate).toHaveBeenCalledWith({
      recResourceId: 'REC0001',
      submission_id: 'SUB-6',
      document_id: 'doc-1',
      file_name: 'report',
      extension: 'pdf',
      file_size: expect.any(Number),
    });
  });

  it('notifies when exhibit A upload fails', async () => {
    const presignMutate = vi.fn().mockResolvedValue({
      url: 'https://example.com/presign',
      document_id: 'doc-1',
    });

    mockPresignExhibitAUpload.mockReturnValue({
      mutateAsync: presignMutate,
      isPending: false,
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      }),
    );

    // The component logs the caught error; keep test output clean
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockUseGetPendingMapFeatureRequests.mockReturnValue({
      data: {
        data: [
          {
            submission_id: 'SUB-7',
            rec_resource_id: 'REC0001',
            amend_status_code: 'PND',
            feature_count: 1,
            geometry_types: ['Point'],
            requested_at: '2026-10-01T12:00:00Z',
          },
        ],
        total: 1,
      },
    });

    render(<RecResourceGeospatialSection />);

    fireEvent.click(screen.getByRole('button', { name: /Upload Exhibit A/i }));

    fireEvent.change(screen.getByLabelText('Upload Exhibit A document'), {
      target: {
        files: [
          new File(['exhibit'], 'failed.pdf', { type: 'application/pdf' }),
        ],
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm upload' }));

    await waitFor(() => {
      expect(mockAddErrorNotification).toHaveBeenCalledWith(
        'Failed to upload Exhibit A. Please try again.',
      );
    });

    expect(mockAddSuccessNotification).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('regenerates exhibit A for a submission and notifies on success', async () => {
    const regenerateMutate = vi.fn().mockResolvedValue({
      pdfUrl: 'https://example.com/regenerated.pdf',
    });

    mockCreateOrGetExhibitAByApplicationGuid.mockReturnValue({
      mutateAsync: regenerateMutate,
      isPending: false,
    });

    mockUseGetPendingMapFeatureRequests.mockReturnValue({
      data: {
        data: [
          {
            submission_id: 'SUB-8',
            application_guid: 'app-guid-8',
            rec_resource_id: 'REC0001',
            amend_status_code: 'APPROVED_NEW',
            feature_count: 1,
            geometry_types: ['Polygon'],
            requested_at: '2026-11-01T12:00:00Z',
          },
        ],
        total: 1,
      },
    });

    render(<RecResourceGeospatialSection />);

    fireEvent.click(screen.getByRole('button', { name: /Regenerate/i }));

    await waitFor(() => {
      expect(mockAddSuccessNotification).toHaveBeenCalledWith(
        'Exhibit A regenerated successfully.',
      );
    });

    expect(regenerateMutate).toHaveBeenCalledWith({
      applicationGuid: 'app-guid-8',
      userId: 'IDIR\\idir.user',
      generate: true,
    });
  });
});
