import { useEditFeaturesForm } from '@/pages/rec-resource-page/components/RecResourceFeatureSection/EditSection/hooks/useEditFeaturesForm';
import { useUpdateFeatures } from '@/services/hooks/recreation-resource-admin/useUpdateFeatures';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-hook-form', () => ({
  useForm: vi.fn(),
}));

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(() => 'mockResolver'),
}));

vi.mock('@/services/hooks/recreation-resource-admin/useUpdateFeatures');

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

vi.mock('@/services/utils/errorHandler', () => ({
  handleApiError: vi.fn(async (error) => ({
    message: error.message || 'Unknown error',
  })),
}));

describe('useEditFeaturesForm', () => {
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

  const mockFeatures = [
    { recreation_feature_code: 'BOAT', description: 'Boat Launch' },
    { recreation_feature_code: 'CAMP', description: 'Camping' },
  ];
  const mockRecResourceId = 'test-resource-123';

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUpdateFeatures).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    vi.mocked(useForm).mockReturnValue(mockUseFormReturn as any);
  });

  it('initializes form with correct default values and configuration', () => {
    renderHook(() => useEditFeaturesForm(mockFeatures, mockRecResourceId));

    expect(useForm).toHaveBeenCalledWith({
      resolver: 'mockResolver',
      defaultValues: {
        feature_codes: ['BOAT', 'CAMP'],
      },
      mode: 'onChange',
    });
    expect(zodResolver).toHaveBeenCalled();
  });

  it('resets form when features change', () => {
    const { rerender } = renderHook(
      ({ features }) => useEditFeaturesForm(features, mockRecResourceId),
      {
        initialProps: { features: mockFeatures },
      },
    );

    // Initial reset call from useEffect
    expect(mockReset).toHaveBeenCalledWith({
      feature_codes: ['BOAT', 'CAMP'],
    });

    // Update features
    const newFeatures = [
      { recreation_feature_code: 'TRAIL', description: 'Trail' },
    ];

    rerender({ features: newFeatures });

    expect(mockReset).toHaveBeenCalledWith({
      feature_codes: ['TRAIL'],
    });
  });

  it('handles successful submission and returns true', async () => {
    const { result } = renderHook(() =>
      useEditFeaturesForm(mockFeatures, mockRecResourceId),
    );

    const formData = { feature_codes: ['BOAT', 'TRAIL'] };
    mockMutateAsync.mockResolvedValue(undefined);

    const success = await result.current.onSubmit(formData);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      recResourceId: mockRecResourceId,
      feature_codes: ['BOAT', 'TRAIL'],
    });
    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Features updated successfully.',
    );
    expect(success).toBe(true);
  });

  it('handles submission error and returns false', async () => {
    const { result } = renderHook(() =>
      useEditFeaturesForm(mockFeatures, mockRecResourceId),
    );

    const error = new Error('API Error');
    mockMutateAsync.mockRejectedValue(error);

    const formData = { feature_codes: ['BOAT', 'TRAIL'] };
    const success = await result.current.onSubmit(formData);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      recResourceId: mockRecResourceId,
      feature_codes: ['BOAT', 'TRAIL'],
    });
    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to update features: API Error',
    );
    expect(success).toBe(false);
  });

  it('returns correct form state and helpers', () => {
    const { result } = renderHook(() =>
      useEditFeaturesForm(mockFeatures, mockRecResourceId),
    );

    expect(result.current.control).toBe(mockUseFormReturn.control);
    expect(result.current.handleSubmit).toBe(mockHandleSubmit);
    expect(result.current.errors).toBe(mockFormState.errors);
    expect(result.current.isDirty).toBe(mockFormState.isDirty);
    expect(result.current.updateMutation).toBeDefined();
  });

  it('handles empty features array', () => {
    renderHook(() => useEditFeaturesForm([], mockRecResourceId));

    expect(useForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: {
          feature_codes: [],
        },
      }),
    );
  });
});
