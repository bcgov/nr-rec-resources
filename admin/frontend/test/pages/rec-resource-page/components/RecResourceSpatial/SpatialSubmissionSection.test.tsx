import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SpatialSubmissionSection } from '@/pages/rec-resource-page/components/RecResourceSpatial/SpatialSubmissionSection';
import { useGetRecreationResourceOptions } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions';
import { useCreateRecreationResourceMapFeatures } from '@/services/hooks/recreation-resource-admin/useCreateRecreationResourceMapFeatures';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';

const {
  mockValidateGeometry,
  mockReadSpatialFile,
  mockCreateMapFeatures,
  mockExtractSectionIdDetails,
  mockPrepareFeatureCollectionForSectionEditing,
  mockUpdateFeatureSectionId,
} = vi.hoisted(() => ({
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
    const hasShpUpload = files.some((file) =>
      file.name.toLowerCase().endsWith('.shp'),
    );

    if (!hasShpUpload) {
      throw new Error(
        'Only .zip or .shp uploads are supported in this workflow.',
      );
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
            section_id: 'River Way South',
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
        {
          type: 'Feature',
          properties: {
            OBJECTID: 2,
            DISTRICT: 'DNC',
            section_id: 'North Loop 1',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [1216000, 475000],
                [1220000, 475000],
                [1220000, 480000],
                [1216000, 480000],
                [1216000, 475000],
              ],
            ],
          },
        },
      ],
    };
  }),
  mockExtractSectionIdDetails: vi.fn((featureCollection: any) => {
    const features = featureCollection?.features ?? [];
    const featureSectionIds = features.map((feature: any, index: number) => ({
      featureIndex: index + 1,
      sectionId: feature.properties?.section_id?.trim() || null,
    }));

    const sectionIds = featureSectionIds
      .map((featureSectionId: any) => featureSectionId.sectionId)
      .filter(Boolean);

    const duplicateIds = sectionIds.filter(
      (sectionId: string, index: number) =>
        sectionIds.indexOf(sectionId) !== index,
    );

    return {
      fieldName: 'section_id',
      sectionIds,
      featureSectionIds,
      issues: duplicateIds.length
        ? [
            {
              type: 'SECTION_ID',
              severity: 'ERROR',
              message: `Duplicate section IDs found: ${duplicateIds.join(', ')}`,
            },
          ]
        : [],
    };
  }),
  mockPrepareFeatureCollectionForSectionEditing: vi.fn(
    (featureCollection: any) => ({
      featureCollection,
      fieldName: 'section_id',
      sourceFieldName: 'section_id',
    }),
  ),
  mockUpdateFeatureSectionId: vi.fn(
    (
      featureCollection: any,
      featureIndex: number,
      fieldName: string,
      nextSectionId: string,
    ) => ({
      ...featureCollection,
      features: featureCollection.features.map((feature: any, index: number) =>
        index === featureIndex
          ? {
              ...feature,
              properties: {
                ...feature.properties,
                [fieldName]: nextSectionId,
              },
            }
          : feature,
      ),
    }),
  ),
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
    DEFAULT_SECTION_ID_FIELD_NAME: 'section_id',
    DATA_SOURCES: ['AirPhoto', 'TRIM', 'Satellite', 'Survey', 'Unknown'],
    extractSectionIdDetails: mockExtractSectionIdDetails,
    prepareFeatureCollectionForSectionEditing:
      mockPrepareFeatureCollectionForSectionEditing,
    validateGeometry: mockValidateGeometry,
    readSpatialFile: mockReadSpatialFile,
    updateFeatureSectionId: mockUpdateFeatureSectionId,
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceSpatial/SpatialSubmissionMap',
  () => ({
    SpatialSubmissionMap: vi.fn(
      ({ selectedFeatureIndex, onFeatureSelect }: any) => (
        <div data-testid="spatial-editor-map">
          <span data-testid="selected-feature-index">
            {selectedFeatureIndex ?? 'none'}
          </span>
          <button type="button" onClick={() => onFeatureSelect?.(1)}>
            Select feature 2 from map
          </button>
        </div>
      ),
    ),
  }),
);

describe('SpatialSubmissionSection', () => {
  const mockUseCreateRecreationResourceMapFeatures = vi.mocked(
    useCreateRecreationResourceMapFeatures,
  );

  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(screen.getByLabelText('Spatial File')).toHaveAttribute('multiple');
    expect(screen.getByLabelText('Spatial File')).toHaveAttribute(
      'accept',
      '.zip,.shp,.dbf',
    );
    expect(
      screen.getByText(/Upload one `\.zip` bundle .* matching `\.dbf`/),
    ).toBeDefined();
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
      expect(
        screen.getByText(
          /Please upload a \.zip shapefile bundle or a \.shp file/i,
        ),
      ).toBeDefined();
    });
  });

  it('validates spatial file, allows renaming a selected section, and submits edited section ids', async () => {
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

    expect(screen.getByText('Sections (2)')).toBeDefined();
    expect(screen.getByDisplayValue('River Way South')).toBeDefined();
    expect(screen.getByTestId('selected-feature-index')).toHaveTextContent('0');

    fireEvent.click(
      screen.getByRole('button', { name: /North Loop 1.*Feature #2/i }),
    );
    expect(screen.getByDisplayValue('North Loop 1')).toBeDefined();

    fireEvent.change(screen.getByLabelText('Section ID / name'), {
      target: { value: 'North Loop Renamed' },
    });

    expect(screen.getByDisplayValue('North Loop Renamed')).toBeDefined();

    fireEvent.click(
      screen.getByRole('button', { name: 'Select feature 2 from map' }),
    );
    expect(screen.getByDisplayValue('North Loop Renamed')).toBeDefined();

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
            sectionId: 'River Way South',
          },
          {
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [1216000, 475000],
                  [1220000, 475000],
                  [1220000, 480000],
                  [1216000, 480000],
                  [1216000, 475000],
                ],
              ],
            },
            sectionId: 'North Loop Renamed',
          },
        ],
      });
    });

    expect(screen.getByLabelText('Spatial File')).toBeDisabled();
    expect(screen.getByText('Validate Spatial File')).toBeDisabled();
    expect(screen.getByText('Create Request')).toBeDisabled();

    expect(screen.getByTestId('spatial-editor-map')).toBeDefined();
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

    expect(
      screen.getByText(/Only \.zip or \.shp uploads are supported/i),
    ).toBeDefined();
  });
});
