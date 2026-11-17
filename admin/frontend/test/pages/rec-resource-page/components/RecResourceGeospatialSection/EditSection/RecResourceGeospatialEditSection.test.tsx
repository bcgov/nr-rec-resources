import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { RecResourceGeospatialEditSection } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection';

const mockUseGetRecreationResourceGeospatial = vi.fn();
const mockUtmToWgs84 = vi.fn();
const mockUtmToSitePointGeometry = vi.fn();
const mockLocationSection = vi.fn();
const mockUseWatch = vi.fn(() => [undefined, undefined, undefined]);
const controllerOnChangeByName: Record<string, ReturnType<typeof vi.fn>> = {};
let mockRecResource: Record<string, unknown> = {
  rec_resource_type_code: 'SIT',
  site_point_geometry: '{"type":"Point","coordinates":[1,2]}',
  spatial_feature_geometry: [
    '{"type":"LineString","coordinates":[[1,2],[3,4]]}',
  ],
};

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    Controller: ({ name, render }: any) => {
      const fieldOnChange = controllerOnChangeByName[name] ?? vi.fn();
      controllerOnChangeByName[name] = fieldOnChange;
      const field = {
        // Seed utm_zone with a number so clearing to '' is an actual value change.
        value: name === 'utm_zone' ? 10 : undefined,
        onChange: fieldOnChange,
        onBlur: vi.fn(),
      };
      return render({ field });
    },
    useWatch: (...args: any[]) => mockUseWatch(...args),
  };
});

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/utils/validateUtmAgainstSpatialFeatures',
  () => ({
    utmToWgs84: (...args: any[]) => mockUtmToWgs84(...args),
    utmToSitePointGeometry: (...args: any[]) =>
      mockUtmToSitePointGeometry(...args),
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/hooks',
  () => ({
    useEditGeospatialForm: () => ({
      handleSubmit: (fn: any) => (e?: any) => {
        e?.preventDefault?.();
        return fn();
      },
      control: {} as any,
      errors: {},
      isDirty: true,
      isSubmitting: false,
      onSubmit: vi.fn(),
    }),
  }),
);

vi.mock('@/routes/rec-resource/$id/geospatial/edit', () => ({
  Route: {
    useParams: () => ({ id: 'REC123' }),
  },
}));

vi.mock('@/pages/rec-resource-page/hooks/useRecResource', () => ({
  useRecResource: () => ({
    rec_resource_id: 'REC123',
    recResource: mockRecResource,
    isLoading: false,
    error: undefined,
  }),
}));

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceGeospatial',
  () => ({
    useGetRecreationResourceGeospatial: (...args: any[]) =>
      mockUseGetRecreationResourceGeospatial(...args),
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceLocationSection',
  () => ({
    RecResourceLocationSection: (props: any) => {
      mockLocationSection(props);
      return <div data-testid="mock-location">LocationSection rendered</div>;
    },
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceGeospatialSection/ExhibitASection/ExhibitASection',
  () => ({
    ExhibitASection: () => (
      <div data-testid="mock-exhibit-a">ExhibitASection rendered</div>
    ),
  }),
);

describe('RecResourceGeospatialEditSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(controllerOnChangeByName).forEach((k) => {
      delete controllerOnChangeByName[k];
    });
    mockUseWatch.mockReturnValue([undefined, undefined, undefined]);
    mockUtmToWgs84.mockReturnValue(null);
    mockUtmToSitePointGeometry.mockReturnValue(null);
    mockRecResource = {
      rec_resource_type_code: 'SIT',
      site_point_geometry: '{"type":"Point","coordinates":[1,2]}',
      spatial_feature_geometry: [
        '{"type":"LineString","coordinates":[[1,2],[3,4]]}',
      ],
    };
  });

  it('renders header and action buttons', () => {
    mockUseGetRecreationResourceGeospatial.mockReturnValue({
      data: {
        latitude: 49.123456,
        longitude: -123.654321,
      },
    });

    render(<RecResourceGeospatialEditSection />);

    expect(screen.getByText('Edit geospatial')).toBeDefined();
    expect(
      screen.getByRole('button', { name: /Save|Saving\.\.\./ }),
    ).toBeDefined();
    expect(screen.getByText('Cancel')).toBeDefined();
  });

  it('displays computed latitude and longitude', () => {
    mockUseGetRecreationResourceGeospatial.mockReturnValue({
      data: {
        latitude: 49.123456,
        longitude: -123.654321,
      },
    });

    render(<RecResourceGeospatialEditSection />);

    expect(screen.getByText(/Latitude/)).toBeDefined();
    expect(screen.getByText(/Longitude/)).toBeDefined();

    const latitudeInput = screen.getByDisplayValue(
      '49.123456',
    ) as HTMLInputElement;
    const longitudeInput = screen.getByDisplayValue(
      '-123.654321',
    ) as HTMLInputElement;

    expect(latitudeInput.disabled).toBe(true);
    expect(longitudeInput.disabled).toBe(true);
  });

  it('renders UTM form fields', () => {
    mockUseGetRecreationResourceGeospatial.mockReturnValue({ data: {} });

    render(<RecResourceGeospatialEditSection />);

    expect(screen.getByText('UTM zone')).toBeDefined();
    expect(screen.getByText('UTM easting')).toBeDefined();
    expect(screen.getByText('UTM northing')).toBeDefined();
  });

  it('renders map section when recResource is available', () => {
    mockUseGetRecreationResourceGeospatial.mockReturnValue({
      data: { latitude: 49.123456, longitude: -123.654321 },
    });

    render(<RecResourceGeospatialEditSection />);

    expect(screen.getByTestId('mock-location')).toBeDefined();
  });

  it('uses live UTM preview for lat/lon and map geometry', () => {
    mockUseWatch.mockReturnValue([10, 500000, 5480000]);
    mockUtmToWgs84.mockReturnValue({
      latitude: 50.4567891,
      longitude: -120.1234567,
    });
    mockUtmToSitePointGeometry.mockReturnValue(
      '{"type":"Point","coordinates":[5,6]}',
    );
    mockUseGetRecreationResourceGeospatial.mockReturnValue({
      data: {
        latitude: 49,
        longitude: -123,
        site_point_geometry: '{"type":"Point","coordinates":[9,9]}',
      },
    });

    render(<RecResourceGeospatialEditSection />);

    expect(screen.getByDisplayValue('50.456789')).toBeInTheDocument();
    expect(screen.getByDisplayValue('-120.123457')).toBeInTheDocument();
    expect(mockUtmToWgs84).toHaveBeenCalledWith(10, 500000, 5480000);
    expect(mockLocationSection).toHaveBeenCalledWith(
      expect.objectContaining({
        recResource: expect.objectContaining({
          site_point_geometry: '{"type":"Point","coordinates":[5,6]}',
        }),
      }),
    );
  });

  it('passes undefined when numeric input is cleared', () => {
    mockUseGetRecreationResourceGeospatial.mockReturnValue({ data: {} });

    render(<RecResourceGeospatialEditSection />);

    const zoneInput = screen.getByPlaceholderText('e.g. 10');
    fireEvent.change(zoneInput, { target: { value: '' } });

    expect(controllerOnChangeByName.utm_zone).toHaveBeenCalledWith(undefined);
  });

  it('renders right-of-way input for trail resource types', () => {
    mockRecResource = { rec_resource_type_code: 'RTE' };
    mockUseGetRecreationResourceGeospatial.mockReturnValue({ data: {} });

    render(<RecResourceGeospatialEditSection />);

    expect(screen.getByText('Right-of-way width (m)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. 15')).toBeInTheDocument();
  });
});
