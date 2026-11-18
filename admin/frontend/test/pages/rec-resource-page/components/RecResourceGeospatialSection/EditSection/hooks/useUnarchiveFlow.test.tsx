import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseAuthorizations = vi.fn();
const mockUseAuthContext = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockUpdateResource = vi.fn();
const mockUpdateMapFeatures = vi.fn();
const mockAddSpinnerNotification = vi.fn();
const mockAddSuccessNotification = vi.fn();
const mockAddErrorNotification = vi.fn();
const mockRemoveNotification = vi.fn();

vi.mock('@/hooks/useAuthorizations', () => ({
  useAuthorizations: () => mockUseAuthorizations(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

vi.mock(
  '@/services/hooks/recreation-resource-admin/useUpdateRecreationResource',
  () => ({
    useUpdateRecreationResource: () => ({ mutateAsync: mockUpdateResource }),
  }),
);

vi.mock(
  '@/services/hooks/recreation-resource-admin/useUpdateRecreationResourceMapFeatures',
  () => ({
    useUpdateRecreationResourceMapFeatures: () => ({
      mutateAsync: mockUpdateMapFeatures,
    }),
  }),
);

vi.mock('@/store/notificationStore', () => ({
  addSpinnerNotification: (...args: any[]) =>
    mockAddSpinnerNotification(...args),
  addSuccessNotification: (...args: any[]) =>
    mockAddSuccessNotification(...args),
  addErrorNotification: (...args: any[]) => mockAddErrorNotification(...args),
  removeNotification: (...args: any[]) => mockRemoveNotification(...args),
}));

import { useUnarchiveFlow } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/hooks/useUnarchiveFlow';

describe('useUnarchiveFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuthorizations.mockReturnValue({ isSuperAdmin: true });
    mockUseAuthContext.mockReturnValue({
      user: {
        email: 'idir.user@gov.bc.ca',
        preferred_username: 'idir.user',
        idir_username: 'IDIR\\idir.user',
      },
    });

    mockInvalidateQueries.mockResolvedValue(undefined);
    mockUpdateResource.mockResolvedValue(undefined);
    mockUpdateMapFeatures.mockResolvedValue(undefined);
  });

  it('opens options only for archived resources when user is super-admin', () => {
    const { result } = renderHook(() =>
      useUnarchiveFlow({
        recResourceId: 'REC0001',
        recResource: { updated_at: '2026-11-16T10:00:00.000Z' },
        isArchived: true,
      }),
    );

    act(() => {
      result.current.openOptions();
    });

    expect(result.current.showOptions).toBe(true);
  });

  it('restores directly for recent archives without re-submitting features', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-11-16T12:00:00.000Z').getTime(),
    );

    const { result } = renderHook(() =>
      useUnarchiveFlow({
        recResourceId: 'REC0001',
        recResource: { updated_at: '2026-11-16T11:00:00.000Z' },
        isArchived: true,
        spatialFeatureGeometry: [
          JSON.stringify({ type: 'Polygon', coordinates: [] }),
        ],
        sectionIds: ['S-1'],
      }),
    );

    await act(async () => {
      await result.current.restoreWithExistingData();
    });

    expect(mockUpdateMapFeatures).not.toHaveBeenCalled();
    expect(mockUpdateResource).toHaveBeenCalledWith({
      recResourceId: 'REC0001',
      updateRecreationResourceDto: { rec_status_code: 'HI' },
    });
    expect(mockAddSuccessNotification).toHaveBeenCalledWith(
      'Resource restored from Archived to Issued.',
    );
  });

  it('re-submits existing features when archive age is over 24 hours', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-11-16T12:00:00.000Z').getTime(),
    );

    const { result } = renderHook(() =>
      useUnarchiveFlow({
        recResourceId: 'REC0001',
        recResource: {
          rec_resource_type_code: 'RTE',
          updated_at: '2026-11-14T09:00:00.000Z',
        },
        isArchived: true,
        spatialFeatureGeometry: [
          JSON.stringify({ type: 'LineString', coordinates: [] }),
        ],
        sectionIds: ['S-2'],
      }),
    );

    await act(async () => {
      await result.current.restoreWithExistingData();
    });

    expect(mockUpdateMapFeatures).toHaveBeenCalledWith(
      expect.objectContaining({
        recResourceId: 'REC0001',
        recreationTypeCode: 'RTE',
        submittedBy: 'idir.user@gov.bc.ca',
      }),
    );
    expect(mockUpdateResource).toHaveBeenCalled();
    expect(mockAddSuccessNotification).toHaveBeenCalledWith(
      'Existing spatial data submitted for amendment and the resource has been restored.',
    );
  });
});
