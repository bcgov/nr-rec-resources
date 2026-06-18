import {
  parseFeeTypeSubtypeValue,
  useFeeForm,
} from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/hooks/useFeeForm';
import {
  FEE_APPLIES_OPTIONS,
  DAY_PRESET_OPTIONS,
} from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/schemas/addFee';
import { useCreateFee, useUpdateFee } from '@/services';
import { renderHook } from '@testing-library/react';
import { useNavigate } from '@tanstack/react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as reactHookForm from 'react-hook-form';

vi.mock('@/services', () => ({
  useCreateFee: vi.fn(),
  useUpdateFee: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
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
  const mockSetError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

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
      setError: mockSetError,
      formState: { errors: {}, isDirty: false, dirtyFields: {} },
    } as any);

    // Avoid preset effect noise; it's not needed for submit behavior
    vi.mocked(reactHookForm.useWatch).mockReturnValue(undefined as any);
  });

  it('does not overwrite existing day selections on initial load when day preset is custom', () => {
    const recResourceId = 'REC123';

    vi.mocked(reactHookForm.useWatch).mockImplementation(((args?: any) => {
      const name = args?.name;
      if (name === 'day_preset') return DAY_PRESET_OPTIONS.CUSTOM;
      return FEE_APPLIES_OPTIONS.ALWAYS;
    }) as any);

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

  it('preserves day selections when user switches to custom day preset', () => {
    const recResourceId = 'REC123';
    let currentPreset: (typeof DAY_PRESET_OPTIONS)[keyof typeof DAY_PRESET_OPTIONS] =
      DAY_PRESET_OPTIONS.ALL_DAYS;

    vi.mocked(reactHookForm.useWatch).mockImplementation(((args?: any) => {
      const name = args?.name;
      if (name === 'day_preset') return currentPreset;
      return FEE_APPLIES_OPTIONS.ALWAYS;
    }) as any);

    const { rerender } = renderHook(() =>
      useFeeForm({
        recResourceId,
        mode: 'create',
      }),
    );

    expect(mockSetValue).not.toHaveBeenCalled();

    currentPreset = DAY_PRESET_OPTIONS.CUSTOM;
    rerender();

    // When switching to CUSTOM, setValue should NOT be called because
    // the user is managing custom day selections manually
    expect(mockSetValue).not.toHaveBeenCalled();
  });

  it('reselects all days when switching from weekends back to all days', () => {
    const recResourceId = 'REC123';
    let currentPreset: (typeof DAY_PRESET_OPTIONS)[keyof typeof DAY_PRESET_OPTIONS] =
      DAY_PRESET_OPTIONS.ALL_DAYS;

    vi.mocked(reactHookForm.useWatch).mockImplementation(((args?: any) => {
      const name = args?.name;
      if (name === 'day_preset') return currentPreset;
      return FEE_APPLIES_OPTIONS.ALWAYS;
    }) as any);

    const { rerender } = renderHook(() =>
      useFeeForm({
        recResourceId,
        mode: 'create',
      }),
    );

    currentPreset = DAY_PRESET_OPTIONS.WEEKENDS;
    rerender();
    expect(mockSetValue).toHaveBeenCalledWith('monday_ind', false);
    expect(mockSetValue).toHaveBeenCalledWith('saturday_ind', true);
    expect(mockSetValue).toHaveBeenCalledWith('sunday_ind', true);

    mockSetValue.mockClear();
    currentPreset = DAY_PRESET_OPTIONS.ALL_DAYS;
    rerender();

    expect(mockSetValue).toHaveBeenCalledWith('monday_ind', true);
    expect(mockSetValue).toHaveBeenCalledWith('tuesday_ind', true);
    expect(mockSetValue).toHaveBeenCalledWith('wednesday_ind', true);
    expect(mockSetValue).toHaveBeenCalledWith('thursday_ind', true);
    expect(mockSetValue).toHaveBeenCalledWith('friday_ind', true);
    expect(mockSetValue).toHaveBeenCalledWith('saturday_ind', true);
    expect(mockSetValue).toHaveBeenCalledWith('sunday_ind', true);
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
      fee_type_sub_type: 'A|D',
      fee_amount: 15,
      fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
      is_recurring: true,
      recurring_start_mmdd: '05-15',
      recurring_end_mmdd: '10-15',
      day_preset: DAY_PRESET_OPTIONS.CUSTOM,
      monday_ind: false,
      tuesday_ind: true,
      wednesday_ind: false,
      thursday_ind: true,
      friday_ind: false,
      saturday_ind: true,
      sunday_ind: false,
      fee_determination_letter_confirmed: true,
    });

    expect(mockCreateMutateAsync).toHaveBeenCalledWith({
      recResourceId,
      recreation_fee_code: 'A',
      recreation_fee_sub_code: 'D',
      fee_amount: 15,
      recurring_ind: true,
      recurring_start_mmdd: '05-15',
      recurring_end_mmdd: '10-15',
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
      fee_type_sub_type: 'A|D',
      fee_amount: undefined,
      fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
      is_recurring: false,
      recurring_start_mmdd: undefined,
      recurring_end_mmdd: undefined,
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
      fee_determination_letter_confirmed: false,
    });

    expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
      recResourceId,
      feeId: 123,
      recreation_fee_code: 'A',
      recreation_fee_sub_code: 'D',
      fee_amount: null,
      fee_start_date: null,
      fee_end_date: null,
      recurring_ind: false,
      recurring_start_mmdd: null,
      recurring_end_mmdd: null,
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

  describe('isSubmittable', () => {
    it('create mode: is always true regardless of dirty state', () => {
      vi.mocked(reactHookForm.useForm).mockReturnValue({
        control: { _mock: 'control' },
        handleSubmit: mockHandleSubmit,
        reset: mockReset,
        setValue: mockSetValue,
        setError: mockSetError,
        formState: { errors: {}, isDirty: false, dirtyFields: {} },
      } as any);

      const { result } = renderHook(() =>
        useFeeForm({ recResourceId: 'REC1', mode: 'create' }),
      );

      expect(result.current.isSubmittable).toBe(true);
    });

    it('edit mode: false when no fields other than FDL are dirty', () => {
      vi.mocked(reactHookForm.useForm).mockReturnValue({
        control: { _mock: 'control' },
        handleSubmit: mockHandleSubmit,
        reset: mockReset,
        setValue: mockSetValue,
        setError: mockSetError,
        formState: {
          errors: {},
          isDirty: true,
          dirtyFields: { fee_determination_letter_confirmed: true },
        },
      } as any);

      const { result } = renderHook(() =>
        useFeeForm({
          recResourceId: 'REC1',
          mode: 'edit',
          initialFee: { fee_id: 1 } as any,
        }),
      );

      expect(result.current.isSubmittable).toBe(false);
    });

    it('edit mode: true when at least one non-FDL field is dirty', () => {
      vi.mocked(reactHookForm.useForm).mockReturnValue({
        control: { _mock: 'control' },
        handleSubmit: mockHandleSubmit,
        reset: mockReset,
        setValue: mockSetValue,
        setError: mockSetError,
        formState: {
          errors: {},
          isDirty: true,
          dirtyFields: {
            fee_determination_letter_confirmed: true,
            fee_amount: true,
          },
        },
      } as any);

      const { result } = renderHook(() =>
        useFeeForm({
          recResourceId: 'REC1',
          mode: 'edit',
          initialFee: { fee_id: 1 } as any,
        }),
      );

      expect(result.current.isSubmittable).toBe(true);
    });

    it('edit mode: false when dirtyFields is completely empty', () => {
      // dirtyFields: {} is already the beforeEach default, but this test
      // explicitly asserts the false case for an untouched edit form
      const { result } = renderHook(() =>
        useFeeForm({
          recResourceId: 'REC1',
          mode: 'edit',
          initialFee: { fee_id: 1 } as any,
        }),
      );

      expect(result.current.isSubmittable).toBe(false);
    });
  });

  describe('edit mode: missing initialFee guard', () => {
    it('does not call update when initialFee is absent', async () => {
      const { result } = renderHook(() =>
        useFeeForm({ recResourceId: 'REC1', mode: 'edit' }),
      );

      await result.current.onSubmit({
        fee_type_sub_type: 'A|D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
        is_recurring: false,
        recurring_start_mmdd: undefined,
        recurring_end_mmdd: undefined,
        fee_start_date: undefined,
        fee_end_date: undefined,
        day_preset: DAY_PRESET_OPTIONS.ALL_DAYS,
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: false,
        sunday_ind: false,
        fee_determination_letter_confirmed: true,
      });

      expect(mockUpdateMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('edit mode FDL validation in onSubmit', () => {
    const baseSubmitData = {
      fee_type_sub_type: 'A|D',
      fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
      is_recurring: false,
      recurring_start_mmdd: undefined,
      recurring_end_mmdd: undefined,
      fee_start_date: undefined,
      fee_end_date: undefined,
      day_preset: DAY_PRESET_OPTIONS.ALL_DAYS,
      monday_ind: true,
      tuesday_ind: true,
      wednesday_ind: true,
      thursday_ind: true,
      friday_ind: true,
      saturday_ind: false,
      sunday_ind: false,
    };

    it('blocks submission and sets error when amount is dirty but FDL is unchecked', async () => {
      vi.mocked(reactHookForm.useForm).mockReturnValue({
        control: { _mock: 'control' },
        handleSubmit: mockHandleSubmit,
        reset: mockReset,
        setValue: mockSetValue,
        setError: mockSetError,
        formState: {
          errors: {},
          isDirty: true,
          dirtyFields: { fee_amount: true },
        },
      } as any);

      const { result } = renderHook(() =>
        useFeeForm({
          recResourceId: 'REC1',
          mode: 'edit',
          initialFee: { fee_id: 99, fee_amount: 10 } as any,
        }),
      );

      await result.current.onSubmit({
        ...baseSubmitData,
        fee_amount: 20,
        fee_determination_letter_confirmed: false,
      });

      expect(mockSetError).toHaveBeenCalledWith(
        'fee_determination_letter_confirmed',
        { message: 'You must confirm you have a fee determination letter' },
      );
      expect(mockUpdateMutateAsync).not.toHaveBeenCalled();
    });

    it('proceeds with submission when amount is dirty and FDL is checked', async () => {
      vi.mocked(reactHookForm.useForm).mockReturnValue({
        control: { _mock: 'control' },
        handleSubmit: mockHandleSubmit,
        reset: mockReset,
        setValue: mockSetValue,
        setError: mockSetError,
        formState: {
          errors: {},
          isDirty: true,
          dirtyFields: { fee_amount: true },
        },
      } as any);

      mockUpdateMutateAsync.mockResolvedValueOnce(undefined);

      const onDone = vi.fn();
      const { result } = renderHook(() =>
        useFeeForm({
          recResourceId: 'REC1',
          mode: 'edit',
          initialFee: { fee_id: 99, fee_amount: 10 } as any,
          onDone,
        }),
      );

      await result.current.onSubmit({
        ...baseSubmitData,
        fee_amount: 20,
        fee_determination_letter_confirmed: true,
      });

      expect(mockSetError).not.toHaveBeenCalled();
      expect(mockUpdateMutateAsync).toHaveBeenCalled();
      expect(onDone).toHaveBeenCalled();
    });

    it('proceeds with submission when amount is not dirty even if FDL is unchecked', async () => {
      vi.mocked(reactHookForm.useForm).mockReturnValue({
        control: { _mock: 'control' },
        handleSubmit: mockHandleSubmit,
        reset: mockReset,
        setValue: mockSetValue,
        setError: mockSetError,
        formState: {
          errors: {},
          isDirty: true,
          dirtyFields: { monday_ind: true },
        },
      } as any);

      mockUpdateMutateAsync.mockResolvedValueOnce(undefined);

      const onDone = vi.fn();
      const { result } = renderHook(() =>
        useFeeForm({
          recResourceId: 'REC1',
          mode: 'edit',
          initialFee: { fee_id: 99, fee_amount: 10 } as any,
          onDone,
        }),
      );

      await result.current.onSubmit({
        ...baseSubmitData,
        fee_amount: 10,
        fee_determination_letter_confirmed: false,
      });

      expect(mockSetError).not.toHaveBeenCalled();
      expect(mockUpdateMutateAsync).toHaveBeenCalled();
    });
  });

  describe('fee type/subtype validation', () => {
    it('accepts legacy one-letter subtype values like O|B', async () => {
      const recResourceId = 'REC123';
      const onDone = vi.fn();

      mockCreateMutateAsync.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() =>
        useFeeForm({
          recResourceId,
          mode: 'create',
          onDone,
        }),
      );

      await result.current.onSubmit({
        fee_type_sub_type: 'O|B',
        fee_amount: 20,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
        is_recurring: false,
        fee_start_date: undefined,
        fee_end_date: undefined,
        recurring_start_mmdd: undefined,
        recurring_end_mmdd: undefined,
        day_preset: DAY_PRESET_OPTIONS.ALL_DAYS,
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: true,
        sunday_ind: true,
        fee_determination_letter_confirmed: true,
      });

      expect(mockSetError).not.toHaveBeenCalledWith('fee_type_sub_type', {
        message: 'Please select a valid fee type',
      });
      expect(mockCreateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          recResourceId,
          recreation_fee_code: 'O',
          recreation_fee_sub_code: 'B',
        }),
      );
      expect(onDone).toHaveBeenCalled();
    });

    it('blocks submission when fee type code is invalid', async () => {
      const { result } = renderHook(() =>
        useFeeForm({ recResourceId: 'REC123', mode: 'create' }),
      );

      await result.current.onSubmit({
        fee_type_sub_type: 'INVALID|B',
        fee_amount: 20,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
        is_recurring: false,
        fee_start_date: undefined,
        fee_end_date: undefined,
        recurring_start_mmdd: undefined,
        recurring_end_mmdd: undefined,
        day_preset: DAY_PRESET_OPTIONS.ALL_DAYS,
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: true,
        sunday_ind: true,
        fee_determination_letter_confirmed: true,
      });

      expect(mockSetError).toHaveBeenCalledWith('fee_type_sub_type', {
        message: 'Please select a valid fee type',
      });
      expect(mockCreateMutateAsync).not.toHaveBeenCalled();
    });

    it('blocks submission when fee subtype is missing or invalid', async () => {
      const { result } = renderHook(() =>
        useFeeForm({ recResourceId: 'REC123', mode: 'create' }),
      );

      await result.current.onSubmit({
        fee_type_sub_type: 'O',
        fee_amount: 20,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
        is_recurring: false,
        fee_start_date: undefined,
        fee_end_date: undefined,
        recurring_start_mmdd: undefined,
        recurring_end_mmdd: undefined,
        day_preset: DAY_PRESET_OPTIONS.ALL_DAYS,
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: true,
        sunday_ind: true,
        fee_determination_letter_confirmed: true,
      });

      expect(mockSetError).toHaveBeenCalledWith('fee_type_sub_type', {
        message: 'Please select a valid fee subtype',
      });
      expect(mockCreateMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('parseFeeTypeSubtypeValue', () => {
    it('returns empty parts when value is empty', () => {
      expect(parseFeeTypeSubtypeValue('')).toEqual({
        recreation_fee_code: '',
        recreation_fee_sub_code: '',
      });
    });

    it('normalizes lowercase and whitespace to uppercase parts', () => {
      expect(parseFeeTypeSubtypeValue('  o|day_use  ')).toEqual({
        recreation_fee_code: 'O',
        recreation_fee_sub_code: 'DAY_USE',
      });
    });

    it('treats values without delimiter as fee code only', () => {
      expect(parseFeeTypeSubtypeValue('t')).toEqual({
        recreation_fee_code: 'T',
        recreation_fee_sub_code: '',
      });
    });
  });

  describe('default values and completion behavior', () => {
    it('builds fee_type_sub_type and weekends preset from initial fee', () => {
      renderHook(() =>
        useFeeForm({
          recResourceId: 'REC123',
          mode: 'edit',
          initialFee: {
            fee_id: 7,
            recreation_fee_code: 'o',
            recreation_fee_sub_code: 'b',
            recurring_ind: false,
            monday_ind: 'N',
            tuesday_ind: 'N',
            wednesday_ind: 'N',
            thursday_ind: 'N',
            friday_ind: 'N',
            saturday_ind: 'Y',
            sunday_ind: 'Y',
          } as any,
        }),
      );

      const useFormArg = vi
        .mocked(reactHookForm.useForm)
        .mock.calls.at(-1)?.[0];
      expect(useFormArg?.defaultValues?.fee_type_sub_type).toBe('O|B');
      expect(useFormArg?.defaultValues?.day_preset).toBe(
        DAY_PRESET_OPTIONS.WEEKENDS,
      );
    });

    it('uses custom day preset when day pattern does not match predefined presets', () => {
      renderHook(() =>
        useFeeForm({
          recResourceId: 'REC123',
          mode: 'edit',
          initialFee: {
            fee_id: 8,
            recurring_ind: false,
            monday_ind: 'Y',
            tuesday_ind: 'N',
            wednesday_ind: 'Y',
            thursday_ind: 'N',
            friday_ind: 'Y',
            saturday_ind: 'N',
            sunday_ind: 'N',
          } as any,
        }),
      );

      const useFormArg = vi
        .mocked(reactHookForm.useForm)
        .mock.calls.at(-1)?.[0];
      expect(useFormArg?.defaultValues?.day_preset).toBe(
        DAY_PRESET_OPTIONS.CUSTOM,
      );
    });

    it('navigates to fees route when onDone is not provided', async () => {
      mockCreateMutateAsync.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() =>
        useFeeForm({ recResourceId: 'REC123', mode: 'create' }),
      );

      await result.current.onSubmit({
        fee_type_sub_type: 'A|D',
        fee_amount: 12,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
        is_recurring: false,
        fee_start_date: undefined,
        fee_end_date: undefined,
        recurring_start_mmdd: undefined,
        recurring_end_mmdd: undefined,
        day_preset: DAY_PRESET_OPTIONS.ALL_DAYS,
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: true,
        sunday_ind: true,
        fee_determination_letter_confirmed: true,
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/rec-resource/$id/fees',
        params: { id: 'REC123' },
      });
    });
  });
});
