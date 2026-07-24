import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockNavigate = vi.fn();
const mockAddSuccessNotification = vi.fn();
const mockAddErrorNotification = vi.fn();
const mockHandleApiError = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock(
  '@/services/hooks/recreation-resource-admin/useUpdateRecreationResourceGeospatial',
  () => ({
    default: () => ({ mutateAsync: mockMutateAsync }),
  }),
);

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/store/notificationStore', () => ({
  addSuccessNotification: (...args: any[]) =>
    mockAddSuccessNotification(...args),
  addErrorNotification: (...args: any[]) => mockAddErrorNotification(...args),
}));

vi.mock('@/services/utils/errorHandler', () => ({
  handleApiError: (...args: any[]) => mockHandleApiError(...args),
}));

import useEditGeospatialForm from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/hooks/useEditGeospatialForm';
import { ROUTE_PATHS } from '@/constants/routes';

const mockValidateUtm = vi.fn();
vi.mock(
  '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/utils/validateUtmAgainstSpatialFeatures',
  () => ({
    validateUtmAgainstSpatialFeatures: (...args: any[]) =>
      mockValidateUtm(...args),
    utmToAlbers: vi.fn(),
    utmToWgs84: vi.fn(),
    utmToSitePointGeometry: vi.fn(),
  }),
);

beforeEach(() => {
  vi.clearAllMocks();
  mockValidateUtm.mockReturnValue(true); // default: validation passes
});

describe('useEditGeospatialForm', () => {
  it('returns undefined when recResourceId is missing', async () => {
    function Expose() {
      const { onSubmit } = useEditGeospatialForm(undefined, undefined);
      (globalThis as any).__onSubmit = onSubmit;
      return null;
    }
    render(<Expose />);
    const result = await (globalThis as any).__onSubmit({
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5480000,
    });
    expect(result).toBeUndefined();
    expect(mockAddSuccessNotification).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('calls update mutation, shows success notification and navigates on success', async () => {
    const returned = {
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5480000,
    };
    mockMutateAsync.mockResolvedValue(returned);

    function Expose() {
      const { onSubmit } = useEditGeospatialForm(undefined, 'REC123');
      (globalThis as any).__onSubmit = onSubmit;
      return null;
    }

    render(<Expose />);

    const result = await (globalThis as any).__onSubmit({
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5480000,
    });

    expect(mockMutateAsync).toHaveBeenCalled();
    expect(mockAddSuccessNotification).toHaveBeenCalledWith(
      'Geospatial data updated successfully.',
    );
    expect(mockNavigate).toHaveBeenCalledWith({
      to: ROUTE_PATHS.REC_RESOURCE_GEOSPATIAL,
      params: { id: 'REC123' },
    });
    expect(result).toEqual(returned);
  });

  it('handles mutation failure by showing error notification and rethrowing', async () => {
    const error = new Error('boom');
    mockMutateAsync.mockRejectedValue(error);
    mockHandleApiError.mockResolvedValue({ message: 'something went wrong' });

    function Expose() {
      const { onSubmit } = useEditGeospatialForm(undefined, 'REC123');
      (globalThis as any).__onSubmit = onSubmit;
      return null;
    }

    render(<Expose />);

    await expect(
      (globalThis as any).__onSubmit({
        utm_zone: 10,
        utm_easting: 500000,
        utm_northing: 5480000,
      }),
    ).rejects.toBe(error);

    expect(mockHandleApiError).toHaveBeenCalledWith(error);
    expect(mockAddErrorNotification).toHaveBeenCalled();
  });

  it('sets root error and returns undefined when UTM spatial validation fails', async () => {
    mockValidateUtm.mockReturnValue(false);

    function Expose() {
      const form = useEditGeospatialForm(
        {
          spatial_feature_geometry: ['{"type":"Point","coordinates":[0,0]}'],
        } as any,
        'REC123',
      );
      (globalThis as any).__onSubmit = form.onSubmit;
      return null;
    }

    render(<Expose />);

    const result = await (globalThis as any).__onSubmit({
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5480000,
    });

    expect(result).toBeUndefined();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
