import { ROUTE_PATHS } from '@/constants/routes';
import { useAddFeeForm } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/hooks/useAddFeeForm';
import {
  FEE_APPLIES_OPTIONS,
  DAY_PRESET_OPTIONS,
} from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/schemas/addFee';
import { useCreateFee } from '@/services';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigateWithQueryParams } from '@shared/hooks';
import { renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as reactHookForm from 'react-hook-form';

vi.mock('react-hook-form', () => ({
  useForm: vi.fn(),
  useWatch: vi.fn(),
}));

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(() => 'mockResolver'),
}));

vi.mock('@/services', () => ({
  useCreateFee: vi.fn(),
}));

vi.mock('@shared/hooks', () => ({
  useNavigateWithQueryParams: vi.fn(),
}));

describe('useAddFeeForm', () => {
  const mockNavigate = vi.fn();
  const mockMutateAsync = vi.fn();
  const mockReset = vi.fn();
  const mockHandleSubmit = vi.fn();
  const mockSetValue = vi.fn();

  const mockFormState = {
    errors: {},
    isDirty: false,
  };

  const mockUseFormReturn = {
    control: { _mock: 'control' },
    handleSubmit: mockHandleSubmit,
    reset: mockReset,
    setValue: mockSetValue,
    formState: mockFormState,
  };

  const mockRecResourceId = 'test-resource-123';

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useNavigateWithQueryParams).mockReturnValue({
      navigate: mockNavigate,
    } as any);

    vi.mocked(useCreateFee).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    vi.mocked(useForm).mockReturnValue(mockUseFormReturn as any);
    vi.mocked(reactHookForm.useWatch).mockImplementation(({ name }: any) => {
      if (name === 'fee_applies') return FEE_APPLIES_OPTIONS.ALWAYS;
      if (name === 'day_preset') return DAY_PRESET_OPTIONS.ALL_DAYS;
      return undefined;
    });
  });

  it('initializes form with correct default values', () => {
    renderHook(() => useAddFeeForm(mockRecResourceId));

    expect(useForm).toHaveBeenCalledWith({
      resolver: 'mockResolver',
      defaultValues: {
        recreation_fee_code: '',
        fee_amount: undefined,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
        recurring_fee: false,
        fee_start_date: undefined,
        fee_end_date: undefined,
        day_preset: DAY_PRESET_OPTIONS.ALL_DAYS,
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: true,
        sunday_ind: true,
      },
      mode: 'onChange',
    });
    expect(zodResolver).toHaveBeenCalled();
  });

  it('handles successful submission', async () => {
    const { result } = renderHook(() => useAddFeeForm(mockRecResourceId));

    const formData = {
      recreation_fee_code: 'D',
      fee_amount: 15,
      fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
      recurring_fee: true,
      fee_start_date: '2024-05-15',
      fee_end_date: '2024-10-15',
      day_preset: DAY_PRESET_OPTIONS.WEEKENDS,
      monday_ind: false,
      tuesday_ind: false,
      wednesday_ind: false,
      thursday_ind: false,
      friday_ind: false,
      saturday_ind: true,
      sunday_ind: true,
    };

    mockMutateAsync.mockResolvedValue(undefined);

    await result.current.onSubmit(formData);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      recResourceId: mockRecResourceId,
      recreation_fee_code: 'D',
      fee_amount: 15,
      fee_start_date: '2024-05-15',
      fee_end_date: '2024-10-15',
      monday_ind: 'N',
      tuesday_ind: 'N',
      wednesday_ind: 'N',
      thursday_ind: 'N',
      friday_ind: 'N',
      saturday_ind: 'Y',
      sunday_ind: 'Y',
    });
    expect(mockReset).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith({
      to: ROUTE_PATHS.REC_RESOURCE_FEES,
      params: { id: mockRecResourceId },
    });
  });

  it('transforms day indicators from boolean to Y/N', async () => {
    const { result } = renderHook(() => useAddFeeForm(mockRecResourceId));

    const formData = {
      recreation_fee_code: 'D',
      fee_amount: 15,
      fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
      recurring_fee: false,
      fee_start_date: undefined,
      fee_end_date: undefined,
      day_preset: DAY_PRESET_OPTIONS.CUSTOM,
      monday_ind: true,
      tuesday_ind: false,
      wednesday_ind: true,
      thursday_ind: false,
      friday_ind: true,
      saturday_ind: false,
      sunday_ind: false,
    };

    mockMutateAsync.mockResolvedValue(undefined);

    await result.current.onSubmit(formData);

    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        monday_ind: 'Y',
        tuesday_ind: 'N',
        wednesday_ind: 'Y',
        thursday_ind: 'N',
        friday_ind: 'Y',
        saturday_ind: 'N',
        sunday_ind: 'N',
      }),
    );
  });

  it('updates day fields when day preset changes to all_days', () => {
    vi.mocked(reactHookForm.useWatch).mockImplementation(({ name }: any) => {
      if (name === 'day_preset') return DAY_PRESET_OPTIONS.ALL_DAYS;
      return FEE_APPLIES_OPTIONS.ALWAYS;
    });

    renderHook(() => useAddFeeForm(mockRecResourceId));

    expect(mockSetValue).toHaveBeenCalled();
  });

  it('updates day fields when day preset changes to weekends', () => {
    vi.mocked(reactHookForm.useWatch).mockImplementation(({ name }: any) => {
      if (name === 'day_preset') return DAY_PRESET_OPTIONS.WEEKENDS;
      return FEE_APPLIES_OPTIONS.ALWAYS;
    });

    renderHook(() => useAddFeeForm(mockRecResourceId));

    expect(mockSetValue).toHaveBeenCalled();
  });

  it('does not include dates when fee applies always', async () => {
    const { result } = renderHook(() => useAddFeeForm(mockRecResourceId));

    const formData = {
      recreation_fee_code: 'D',
      fee_amount: 15,
      fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
      recurring_fee: false,
      fee_start_date: '2024-05-15',
      fee_end_date: '2024-10-15',
      day_preset: DAY_PRESET_OPTIONS.ALL_DAYS,
      monday_ind: true,
      tuesday_ind: true,
      wednesday_ind: true,
      thursday_ind: true,
      friday_ind: true,
      saturday_ind: true,
      sunday_ind: true,
    };

    mockMutateAsync.mockResolvedValue(undefined);

    await result.current.onSubmit(formData);

    const callArgs = mockMutateAsync.mock.calls[0][0];
    expect(callArgs).not.toHaveProperty('fee_start_date');
    expect(callArgs).not.toHaveProperty('fee_end_date');
  });
});
