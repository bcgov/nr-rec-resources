import { useFeeForm } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/hooks/useFeeForm';
import {
  FEE_APPLIES_OPTIONS,
  DAY_PRESET_OPTIONS,
} from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/schemas/addFee';
import { useCreateFee, useUpdateFee } from '@/services';
import { useNavigateWithQueryParams } from '@shared/hooks';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as reactHookForm from 'react-hook-form';

vi.mock('@/services', () => ({
  useCreateFee: vi.fn(),
  useUpdateFee: vi.fn(),
}));

vi.mock('@shared/hooks', () => ({
  useNavigateWithQueryParams: vi.fn(),
}));

vi.mock('react-hook-form', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useForm: vi.fn(),
    useWatch: vi.fn(),
  };
});

describe('useFeeForm', () => {
  const mockNavigate = vi.fn();
  const mockCreateMutateAsync = vi.fn();
  const mockUpdateMutateAsync = vi.fn();
  const mockReset = vi.fn();
  const mockHandleSubmit = vi.fn();
  const mockSetValue = vi.fn();
  let mockDirtyFields: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDirtyFields = {};

    vi.mocked(useNavigateWithQueryParams).mockReturnValue({
      navigate: mockNavigate,
    } as any);

    vi.mocked(useCreateFee).mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
    } as any);

    vi.mocked(useUpdateFee).mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
    } as any);

    vi.mocked(reactHookForm.useForm).mockReturnValue({
      control: { _mock: 'control' },
      handleSubmit: mockHandleSubmit,
      reset: mockReset,
      setValue: mockSetValue,
      formState: { errors: {}, isDirty: false, dirtyFields: mockDirtyFields },
    } as any);

    // Avoid preset effect noise; it's not needed for submit behavior
    vi.mocked(reactHookForm.useWatch).mockReturnValue(undefined as any);
  });

  it('does not overwrite existing day selections on initial load when day preset is custom', () => {
    const recResourceId = 'REC123';

    vi.mocked(reactHookForm.useWatch).mockImplementation(({ name }: any) => {
      if (name === 'day_preset') return DAY_PRESET_OPTIONS.CUSTOM;
      return FEE_APPLIES_OPTIONS.ALWAYS;
    });

    renderHook(() =>
      useFeeForm({
        recResourceId,
        mode: 'edit',
        initialFee: {
          fee_id: 123,
          recreation_fee_code: 'D',
          monday_ind: 'Y',
          tuesday_ind: 'N',
          wednesday_ind: 'Y',
          thursday_ind: 'N',
          friday_ind: 'N',
          saturday_ind: 'Y',
          sunday_ind: 'N',
        } as any,
      }),
    );

    expect(mockSetValue).not.toHaveBeenCalled();
  });

  it('clears day selections when user switches to custom day preset', () => {
    const recResourceId = 'REC123';
    let currentPreset: (typeof DAY_PRESET_OPTIONS)[keyof typeof DAY_PRESET_OPTIONS] =
      DAY_PRESET_OPTIONS.ALL_DAYS;

    vi.mocked(reactHookForm.useWatch).mockImplementation(({ name }: any) => {
      if (name === 'day_preset') return currentPreset;
      return FEE_APPLIES_OPTIONS.ALWAYS;
    });

    const { rerender } = renderHook(() =>
      useFeeForm({
        recResourceId,
        mode: 'create',
      }),
    );

    expect(mockSetValue).not.toHaveBeenCalled();

    mockDirtyFields = { day_preset: true };
    vi.mocked(reactHookForm.useForm).mockReturnValue({
      control: { _mock: 'control' },
      handleSubmit: mockHandleSubmit,
      reset: mockReset,
      setValue: mockSetValue,
      formState: { errors: {}, isDirty: true, dirtyFields: mockDirtyFields },
    } as any);

    currentPreset = DAY_PRESET_OPTIONS.CUSTOM;
    rerender();

    expect(mockSetValue).toHaveBeenCalledWith('monday_ind', false);
    expect(mockSetValue).toHaveBeenCalledWith('tuesday_ind', false);
    expect(mockSetValue).toHaveBeenCalledWith('wednesday_ind', false);
    expect(mockSetValue).toHaveBeenCalledWith('thursday_ind', false);
    expect(mockSetValue).toHaveBeenCalledWith('friday_ind', false);
    expect(mockSetValue).toHaveBeenCalledWith('saturday_ind', false);
    expect(mockSetValue).toHaveBeenCalledWith('sunday_ind', false);
  });

  it('create mode: submits with day indicators transformed and dates included only for specific dates', async () => {
    const onDone = vi.fn();
    const recResourceId = 'REC123';

    const { result } = renderHook(() =>
      useFeeForm({
        recResourceId,
        mode: 'create',
        onDone,
      }),
    );

    mockCreateMutateAsync.mockResolvedValueOnce(undefined);

    await result.current.onSubmit({
      recreation_fee_code: 'D',
      fee_amount: 15,
      fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
      fee_start_date: '2024-05-15',
      fee_end_date: '2024-10-15',
      day_preset: DAY_PRESET_OPTIONS.CUSTOM,
      monday_ind: false,
      tuesday_ind: true,
      wednesday_ind: false,
      thursday_ind: true,
      friday_ind: false,
      saturday_ind: true,
      sunday_ind: false,
    });

    expect(mockCreateMutateAsync).toHaveBeenCalledWith({
      recResourceId,
      recreation_fee_code: 'D',
      fee_amount: 15,
      fee_start_date: '2024-05-15',
      fee_end_date: '2024-10-15',
      monday_ind: 'N',
      tuesday_ind: 'Y',
      wednesday_ind: 'N',
      thursday_ind: 'Y',
      friday_ind: 'N',
      saturday_ind: 'Y',
      sunday_ind: 'N',
    });
    expect(mockReset).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalled();
  });

  it('edit mode: submits with feeId and clears dates when fee applies always', async () => {
    const onDone = vi.fn();
    const recResourceId = 'REC123';

    const { result } = renderHook(() =>
      useFeeForm({
        recResourceId,
        mode: 'edit',
        initialFee: {
          fee_id: 123,
          recreation_fee_code: 'D',
          monday_ind: 'Y',
          tuesday_ind: 'Y',
          wednesday_ind: 'Y',
          thursday_ind: 'Y',
          friday_ind: 'Y',
          saturday_ind: 'Y',
          sunday_ind: 'Y',
        } as any,
        onDone,
      }),
    );

    mockUpdateMutateAsync.mockResolvedValueOnce(undefined);

    await result.current.onSubmit({
      recreation_fee_code: 'D',
      fee_amount: undefined,
      fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
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
    });

    expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
      recResourceId,
      feeId: 123,
      recreation_fee_code: 'D',
      fee_amount: null,
      fee_start_date: null,
      fee_end_date: null,
      monday_ind: 'Y',
      tuesday_ind: 'Y',
      wednesday_ind: 'Y',
      thursday_ind: 'Y',
      friday_ind: 'Y',
      saturday_ind: 'Y',
      sunday_ind: 'Y',
    });
    expect(mockReset).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalled();
  });
});
