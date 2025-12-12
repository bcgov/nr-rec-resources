import { ROUTE_PATHS } from '@/constants/routes';
import { useEditActivitiesForm } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/hooks/useEditActivitiesForm';
import { useUpdateActivities } from '@/services/hooks/recreation-resource-admin/useUpdateActivities';
import { handleApiError } from '@/services/utils/errorHandler';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigateWithQueryParams } from '@shared/hooks';
import { renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(),
}));

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(() => 'mockResolver'),
}));

vi.mock('@/services/hooks/recreation-resource-admin/useUpdateActivities');
vi.mock('@/services/utils/errorHandler');
vi.mock('@/store/notificationStore');
vi.mock('@shared/hooks');

describe('useEditActivitiesForm', () => {
  const mockNavigate = vi.fn();
  const mockMutateAsync = vi.fn();
  const mockReset = vi.fn();
  const mockHandleSubmit = vi.fn();

  const mockFormState = {
    errors: {},
    isDirty: false,
  };

  const mockUseFormReturn = {
    control: { _mock: 'control' },
    handleSubmit: mockHandleSubmit,
    reset: mockReset,
    formState: mockFormState,
  };

  const mockActivities = [
    { recreation_activity_code: 1, description: 'Hiking' },
    { recreation_activity_code: 2, description: 'Camping' },
  ];
  const mockRecResourceId = 'test-resource-123';

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocks
    vi.mocked(useNavigateWithQueryParams).mockReturnValue({
      navigate: mockNavigate,
    } as any);

    vi.mocked(useUpdateActivities).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    vi.mocked(useForm).mockReturnValue(mockUseFormReturn as any);
  });

  it('initializes form with correct default values and configuration', () => {
    renderHook(() => useEditActivitiesForm(mockActivities, mockRecResourceId));

    expect(useForm).toHaveBeenCalledWith({
      resolver: 'mockResolver',
      defaultValues: {
        activity_codes: [1, 2],
      },
      mode: 'onChange',
    });
    expect(zodResolver).toHaveBeenCalled();
  });

  it('resets form when activities change', () => {
    const { rerender } = renderHook(
      ({ activities }) => useEditActivitiesForm(activities, mockRecResourceId),
      {
        initialProps: { activities: mockActivities },
      },
    );

    // Initial reset call from useEffect
    expect(mockReset).toHaveBeenCalledWith({
      activity_codes: [1, 2],
    });

    // Update activities
    const newActivities = [
      { recreation_activity_code: 3, description: 'Fishing' },
    ];

    rerender({ activities: newActivities });

    expect(mockReset).toHaveBeenCalledWith({
      activity_codes: [3],
    });
  });

  it('handles successful submission', async () => {
    const { result } = renderHook(() =>
      useEditActivitiesForm(mockActivities, mockRecResourceId),
    );

    const formData = { activity_codes: [1, 3] };
    mockMutateAsync.mockResolvedValue(undefined);

    await result.current.onSubmit(formData);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      recResourceId: mockRecResourceId,
      activity_codes: [1, 3],
    });
    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Activities updated successfully.',
    );
    expect(mockNavigate).toHaveBeenCalledWith({
      to: ROUTE_PATHS.REC_RESOURCE_ACTIVITIES,
      params: { id: mockRecResourceId },
    });
  });

  it('handles submission error', async () => {
    const { result } = renderHook(() =>
      useEditActivitiesForm(mockActivities, mockRecResourceId),
    );

    const error = new Error('API Error');
    mockMutateAsync.mockRejectedValue(error);
    vi.mocked(handleApiError).mockResolvedValue({
      message: 'Something went wrong',
    } as any);

    const formData = { activity_codes: [1, 3] };
    await result.current.onSubmit(formData);

    expect(handleApiError).toHaveBeenCalledWith(error);
    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to update activities: Something went wrong. Please try again.',
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('returns correct form state and helpers', () => {
    const { result } = renderHook(() =>
      useEditActivitiesForm(mockActivities, mockRecResourceId),
    );

    expect(result.current.control).toBe(mockUseFormReturn.control);
    expect(result.current.handleSubmit).toBe(mockHandleSubmit);
    expect(result.current.errors).toBe(mockFormState.errors);
    expect(result.current.isDirty).toBe(mockFormState.isDirty);
  });

  it('handles empty activities array', () => {
    renderHook(() => useEditActivitiesForm([], mockRecResourceId));

    expect(useForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: {
          activity_codes: [],
        },
      }),
    );
  });

  it('handles undefined activities', () => {
    renderHook(() =>
      useEditActivitiesForm(undefined as any, mockRecResourceId),
    );

    expect(useForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: {
          activity_codes: [],
        },
      }),
    );
  });
});
