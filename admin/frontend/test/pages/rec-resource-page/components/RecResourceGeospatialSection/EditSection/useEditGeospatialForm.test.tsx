import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

let mockConsoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockValidateUtm.mockReturnValue(true); // default: validation passes
  mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  mockConsoleError.mockRestore();
});

describe('useEditGeospatialForm', () => {
  it('returns undefined when recResourceId is missing', async () => {
    const { result: hookResult } = renderHook(() =>
      useEditGeospatialForm(undefined, undefined),
    );

    let result: unknown;
    await act(async () => {
      result = await hookResult.current.onSubmit({
        utm_zone: 10,
        utm_easting: 500000,
        utm_northing: 5480000,
      });
    });

    expect(result).toBeUndefined();
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Missing rec_resource_id; cannot submit geospatial update',
    );
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

    const { result: hookResult } = renderHook(() =>
      useEditGeospatialForm(undefined, 'REC123'),
    );

    let result: unknown;
    await act(async () => {
      result = await hookResult.current.onSubmit({
        utm_zone: 10,
        utm_easting: 500000,
        utm_northing: 5480000,
      });
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

    const { result: hookResult } = renderHook(() =>
      useEditGeospatialForm(undefined, 'REC123'),
    );

    await expect(
      hookResult.current.onSubmit({
        utm_zone: 10,
        utm_easting: 500000,
        utm_northing: 5480000,
      }),
    ).rejects.toBe(error);

    expect(mockHandleApiError).toHaveBeenCalledWith(error);
    expect(mockAddErrorNotification).toHaveBeenCalledWith(
      'Failed to update geospatial data: something went wrong. Please try again.',
    );
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Failed to update geospatial data',
      error,
    );
  });

  it('sets root error and returns undefined when UTM spatial validation fails', async () => {
    mockValidateUtm.mockReturnValue(false);

    const geospatialData = {
      spatial_feature_geometry: ['{"type":"Point","coordinates":[0,0]}'],
    };

    const { result: hookResult } = renderHook(() =>
      useEditGeospatialForm(geospatialData as any, 'REC123'),
    );

    let result: unknown;
    await act(async () => {
      result = await hookResult.current.onSubmit({
        utm_zone: 10,
        utm_easting: 500000,
        utm_northing: 5480000,
      });
    });

    expect(result).toBeUndefined();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
