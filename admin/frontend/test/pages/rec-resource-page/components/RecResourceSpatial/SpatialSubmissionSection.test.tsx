import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SpatialSubmissionSection } from '@/pages/rec-resource-page/components/RecResourceSpatial/SpatialSubmissionSection';
import { useGetRecreationResourceOptions } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions';
import { useCreateRecreationResourceMapFeatures } from '@/services/hooks/recreation-resource-admin/useCreateRecreationResourceMapFeatures';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';

const {
  mockValidateSubmissionMetadata,
  mockValidateGeometry,
  mockReadSpatialFile,
  mockCreateMapFeatures,
} = vi.hoisted(() => ({
  mockValidateSubmissionMetadata: vi.fn(() => []),
  mockValidateGeometry: vi.fn((featureCollection, options) => {
    const geometryType = featureCollection?.features?.[0]?.geometry?.type;
    if (
      options?.expectedGeometryType &&
      geometryType !== options.expectedGeometryType
    ) {
      return [
        {
          type: 'GEOMETRY',
          severity: 'ERROR',
          message: `Feature #1 geometry type (${geometryType}) does not match expected ${options.expectedGeometryType}.`,
        },
      ];
    }
    return [];
  }),
  mockCreateMapFeatures: vi.fn(async () => ({
    rec_resource_id: 'REC123',
    spatial_feature_geometry: ['{"type":"Polygon","coordinates":[]}'],
    site_point_geometry: undefined,
    utm_zone: null,
    utm_easting: null,
    utm_northing: null,
    latitude: null,
    longitude: null,
  })),
  mockReadSpatialFile: vi.fn(async (input: File | File[] | FileList) => {
    const files = input instanceof File ? [input] : Array.from(input);
    const hasSingleShp =
      files.length === 1 && files[0].name.toLowerCase().endsWith('.shp');

    if (!hasSingleShp) {
      throw new Error('Only .shp uploads are supported in this workflow.');
    }

    return {
      type: 'FeatureCollection',
      crs: { type: 'name', properties: { name: 'EPSG:3005' } },
      features: [
        {
          type: 'Feature',
          properties: {
            OBJECTID: 1,
            DISTRICT: 'DNC',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [1210000, 475000],
                [1215000, 475000],
                [1215000, 480000],
                [1210000, 480000],
                [1210000, 475000],
              ],
            ],
          },
        },
      ],
    };
  }),
}));

const mockUseAuthContext = vi.fn();
const mockUseGetRecreationResourceOptions = vi.mocked(
  useGetRecreationResourceOptions,
);

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions',
  () => ({
    useGetRecreationResourceOptions: vi.fn(),
  }),
);

vi.mock(
  '@/services/hooks/recreation-resource-admin/useCreateRecreationResourceMapFeatures',
  () => ({
    useCreateRecreationResourceMapFeatures: vi.fn(),
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceSpatial/spatialSubmissionUtils',
  () => ({
    ACTION_CODES: ['I', 'U'],
    ACCURACY_CODES: ['1', '5', '10', '100', '1000'],
    CAPTURE_METHODS: ['GPS', 'DIGITIZE', 'Ortho', 'Mono'],
    DATA_SOURCES: ['AirPhoto', 'TRIM', 'Satellite', 'Survey', 'Unknown'],
    validateSubmissionMetadata: mockValidateSubmissionMetadata,
    validateGeometry: mockValidateGeometry,
    readSpatialFile: mockReadSpatialFile,
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceSpatial/SpatialSubmissionMap',
  () => ({
    SpatialSubmissionMap: vi.fn(() => (
      <div data-testid="spatial-editor-map">Spatial preview map</div>
    )),
  }),
);

describe('SpatialSubmissionSection', () => {
  const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
  const mockUseCreateRecreationResourceMapFeatures = vi.mocked(
    useCreateRecreationResourceMapFeatures,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleLog.mockClear();
    mockUseAuthContext.mockReturnValue({
      user: {
        email: 'idir.user@gov.bc.ca',
      },
      authService: {
        getUserFullName: () => 'Idir User',
      },
    });
    mockUseGetRecreationResourceOptions.mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.NaturalDistrict,
          options: [
            {
              id: 'DCC',
              label: 'Chilliwack Natural Resource District',
            },
            {
              id: 'DPG',
              label: 'Prince George Natural Resource District',
            },
          ],
        },
        {
          type: GetOptionsByTypesTypesEnum.District,
          options: [
            {
              id: 'RDCC',
              label: 'Chilliwack Recreation District',
              is_archived: false,
            },
            {
              id: 'OLD',
              label: 'Archived Recreation District',
              is_archived: true,
            },
          ],
        },
        {
          type: GetOptionsByTypesTypesEnum.ResourceType,
          options: [
            {
              id: 'SIT',
              label: 'Site',
            },
            {
              id: 'RTE',
              label: 'Route',
            },
          ],
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);
    mockUseCreateRecreationResourceMapFeatures.mockReturnValue({
      mutateAsync: mockCreateMapFeatures,
      isPending: false,
    } as any);
  });

  it('renders wizard and shows live district options', async () => {
    render(
      <SpatialSubmissionSection
        recResourceId="REC123"
        defaultRecreationTypeCode="SIT"
        defaultNaturalResourceDistrict="DCC"
        defaultRecreationDistrict="RDCC"
      />,
    );

    expect(screen.getByText('Spatial submission')).toBeDefined();
    expect(screen.getByLabelText(/recreation type/i)).toBeDefined();
    await waitFor(() => {
      expect(screen.getByLabelText(/recreation type/i)).toHaveValue('SIT');
    });
    expect(screen.getByLabelText('Feature type')).toHaveValue('Polygon');
    expect(screen.getByRole('option', { name: 'Linear' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Polygon' })).toBeDefined();
    expect(
      screen.getByRole('option', {
        name: 'Chilliwack Natural Resource District',
      }),
    ).toBeDefined();
    expect(
      screen.getByRole('option', {
        name: 'Chilliwack Recreation District',
      }),
    ).toBeDefined();
    expect(screen.getByLabelText('Natural Resource District')).toHaveValue(
      'DCC',
    );
    expect(screen.getByLabelText('Recreation District')).toHaveValue('RDCC');
    expect(
      screen.queryByRole('option', { name: 'Archived Recreation District' }),
    ).toBeNull();
    expect(screen.getByRole('option', { name: 'Site' })).toBeDefined();
    expect(screen.getByLabelText('REC#')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Spatial File')).not.toHaveAttribute(
      'multiple',
    );
    expect(screen.getByLabelText('Spatial File')).toHaveAttribute(
      'accept',
      '.shp',
    );
    expect(screen.getByText(/Select one `\.shp` file/)).toBeDefined();
  });

  it('auto-fills email address and submitter name from the logged-in user', async () => {
    render(
      <SpatialSubmissionSection
        recResourceId="REC123"
        defaultRecreationTypeCode="SIT"
        defaultNaturalResourceDistrict="DCC"
        defaultRecreationDistrict="RDCC"
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Email Address')).toHaveValue(
        'idir.user@gov.bc.ca',
      );
      expect(screen.getByLabelText('Submitter Name')).toHaveValue('Idir User');
    });
  });

  it('shows missing-file validation message', async () => {
    render(
      <SpatialSubmissionSection
        recResourceId="REC123"
        defaultRecreationTypeCode="SIT"
        defaultNaturalResourceDistrict="DCC"
        defaultRecreationDistrict="RDCC"
      />,
    );

    fireEvent.click(screen.getByText('Validate Spatial File'));

    await waitFor(() => {
      expect(screen.getByText(/Please upload a \.shp file\./)).toBeDefined();
    });

    expect(mockValidateSubmissionMetadata).not.toHaveBeenCalled();
  });

  it('validates spatial file and shows map in view-only mode', async () => {
    render(
      <SpatialSubmissionSection
        recResourceId="REC123"
        defaultRecreationTypeCode="SIT"
        defaultNaturalResourceDistrict="DCC"
        defaultRecreationDistrict="RDCC"
      />,
    );

    fireEvent.change(screen.getByLabelText(/recreation type/i), {
      target: { value: 'RTE' },
    });
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'valid@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Telephone Number'), {
      target: { value: '6045550100' },
    });
    fireEvent.change(screen.getByLabelText('Submitter Name'), {
      target: { value: 'Valid User' },
    });
    fireEvent.change(screen.getByLabelText('Natural Resource District'), {
      target: { value: 'DCC' },
    });
    fireEvent.change(screen.getByLabelText('Recreation District'), {
      target: { value: 'RDCC' },
    });

    const fileInput = screen.getByLabelText('Spatial File') as HTMLInputElement;
    const shpFile = new File(['shp-content'], 'submission.shp', {
      type: 'application/octet-stream',
    });
    fireEvent.change(fileInput, { target: { files: [shpFile] } });

    fireEvent.click(screen.getByText('Validate Spatial File'));

    await waitFor(() => {
      expect(
        screen.getByText('Spatial file validated successfully.'),
      ).toBeDefined();
    });

    expect(
      screen.getByRole('button', { name: 'Create Request' }),
    ).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Create Request' }));

    await waitFor(() => {
      expect(mockCreateMapFeatures).toHaveBeenCalledWith({
        recResourceId: 'REC123',
        recreationTypeCode: 'RTE',
        naturalResourceDistrictCode: 'DCC',
        recreationDistrictCode: 'RDCC',
        submittedBy: 'Valid User',
        features: [
          {
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [1210000, 475000],
                  [1215000, 475000],
                  [1215000, 480000],
                  [1210000, 480000],
                  [1210000, 475000],
                ],
              ],
            },
          },
        ],
      });
    });

    expect(screen.getByLabelText('Spatial File')).toBeDisabled();
    expect(screen.getByText('Validate Spatial File')).toBeDisabled();
    expect(screen.getByText('Create Request')).toBeDisabled();

    expect(mockConsoleLog).toHaveBeenCalledWith(
      'Extracted shapefile features:',
      expect.objectContaining({
        fileName: 'submission.shp',
        featureCount: 1,
        features: expect.arrayContaining([
          expect.objectContaining({
            geometry: expect.objectContaining({ type: 'Polygon' }),
          }),
        ]),
      }),
    );

    expect(screen.getByTestId('spatial-editor-map')).toBeDefined();
    expect(screen.queryByText('Download XML')).toBeNull();
    expect(screen.queryByText('Download Updated ZIP')).toBeNull();
  });

  it('replaces the selected shapefile when a new one is chosen', async () => {
    render(
      <SpatialSubmissionSection
        recResourceId="REC123"
        defaultRecreationTypeCode="SIT"
        defaultNaturalResourceDistrict="DCC"
        defaultRecreationDistrict="RDCC"
      />,
    );

    const fileInput = screen.getByLabelText('Spatial File') as HTMLInputElement;
    const shpFile = new File(['shp-content'], 'submission-one.shp', {
      type: 'application/octet-stream',
    });
    const replacementShpFile = new File(['shp-content'], 'submission-two.shp', {
      type: 'application/octet-stream',
    });

    fireEvent.change(fileInput, { target: { files: [shpFile] } });
    expect(fileInput.files?.[0]?.name).toBe('submission-one.shp');
    fireEvent.change(fileInput, { target: { files: [replacementShpFile] } });

    expect(fileInput.files?.[0]?.name).toBe('submission-two.shp');
  });

  it('shows feature-type validation message when geometry does not match selection', async () => {
    render(
      <SpatialSubmissionSection
        recResourceId="REC123"
        defaultRecreationTypeCode="SIT"
        defaultNaturalResourceDistrict="DCC"
        defaultRecreationDistrict="RDCC"
      />,
    );

    fireEvent.change(screen.getByLabelText('Feature type'), {
      target: { value: 'LineString' },
    });
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'valid@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Telephone Number'), {
      target: { value: '6045550100' },
    });
    fireEvent.change(screen.getByLabelText('Submitter Name'), {
      target: { value: 'Valid User' },
    });

    const fileInput = screen.getByLabelText('Spatial File') as HTMLInputElement;
    const file = new File(['shp-content'], 'submission.shp', {
      type: 'application/octet-stream',
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByText('Validate Spatial File'));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Feature #1 geometry type \(Polygon\) does not match expected LineString\./,
        ),
      ).toBeDefined();
    });
  });

  it('shows validation message when a non-.shp file is uploaded', async () => {
    render(
      <SpatialSubmissionSection
        recResourceId="REC123"
        defaultRecreationTypeCode="SIT"
        defaultNaturalResourceDistrict="DCC"
        defaultRecreationDistrict="RDCC"
      />,
    );

    const fileInput = screen.getByLabelText('Spatial File') as HTMLInputElement;
    const dbfFile = new File(['dbf-content'], 'submission.dbf', {
      type: 'application/octet-stream',
    });
    fireEvent.change(fileInput, { target: { files: [dbfFile] } });

    fireEvent.click(screen.getByText('Validate Spatial File'));

    await waitFor(() => {
      expect(screen.getByText(/Unable to parse shapefile/i)).toBeDefined();
    });

    expect(screen.getByText(/Only \.shp uploads are supported/i)).toBeDefined();
  });
});
