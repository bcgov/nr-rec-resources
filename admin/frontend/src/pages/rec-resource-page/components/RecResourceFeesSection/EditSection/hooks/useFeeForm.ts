import { useCreateFee, useUpdateFee, RecreationFeeUIModel } from '@/services';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ROUTE_PATHS } from '@/constants/routes';
import { useNavigate } from '@tanstack/react-router';
import {
  AddFeeFormData,
  FEE_APPLIES_OPTIONS,
  DAY_PRESET_OPTIONS,
  createAddFeeSchema,
} from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/schemas/addFee';
import {
  DAY_FIELDS,
  DAY_PRESET_CONFIG,
} from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/hooks/constants';

type FeeFormMode = 'create' | 'edit';

const LEGACY_FEE_CODE_MAP: Record<
  string,
  { recreation_fee_code: string; recreation_fee_sub_code?: string }
> = {
  C: { recreation_fee_code: 'O', recreation_fee_sub_code: 'CAMPING' },
  H: { recreation_fee_code: 'O', recreation_fee_sub_code: 'HUTS' },
  D: { recreation_fee_code: 'A', recreation_fee_sub_code: 'DAY_USE' },
  P: { recreation_fee_code: 'A', recreation_fee_sub_code: 'PARKING' },
};

const toFeeTypeSubtypeValue = (fee?: RecreationFeeUIModel): string => {
  const feeWithSubtype = fee as RecreationFeeUIModel & {
    recreation_fee_sub_code?: string;
  };

  if (
    !feeWithSubtype?.recreation_fee_code ||
    !feeWithSubtype?.recreation_fee_sub_code
  ) {
    return '';
  }

  return `${feeWithSubtype.recreation_fee_code}|${feeWithSubtype.recreation_fee_sub_code}`;
};

const parseFeeTypeSubtypeValue = (value: string) => {
  const normalizedValue = value.trim();

  if (normalizedValue.includes('|')) {
    const [recreation_fee_code, recreation_fee_sub_code] =
      normalizedValue.split('|');

    return {
      recreation_fee_code,
      recreation_fee_sub_code,
    };
  }

  const legacyMapped = LEGACY_FEE_CODE_MAP[normalizedValue];
  if (legacyMapped) {
    return legacyMapped;
  }

  const [recreation_fee_code, recreation_fee_sub_code] = value.split('|');

  return {
    recreation_fee_code,
    recreation_fee_sub_code,
  };
};

const transformDayIndicators = (data: AddFeeFormData) => {
  return Object.fromEntries(
    DAY_FIELDS.map((field) => [field, data[field] ? 'Y' : 'N']),
  ) as Record<(typeof DAY_FIELDS)[number], 'Y' | 'N'>;
};

const dayPresetFromFee = (
  fee?: RecreationFeeUIModel,
): AddFeeFormData['day_preset'] => {
  if (!fee) return DAY_PRESET_OPTIONS.ALL_DAYS;

  const days = {
    monday_ind: fee.monday_ind === 'Y',
    tuesday_ind: fee.tuesday_ind === 'Y',
    wednesday_ind: fee.wednesday_ind === 'Y',
    thursday_ind: fee.thursday_ind === 'Y',
    friday_ind: fee.friday_ind === 'Y',
    saturday_ind: fee.saturday_ind === 'Y',
    sunday_ind: fee.sunday_ind === 'Y',
  };

  const matches = (
    preset: (typeof DAY_PRESET_CONFIG)[keyof typeof DAY_PRESET_CONFIG],
  ) => DAY_FIELDS.every((f) => preset[f] === days[f]);

  if (matches(DAY_PRESET_CONFIG.all_days)) return DAY_PRESET_OPTIONS.ALL_DAYS;
  if (matches(DAY_PRESET_CONFIG.weekends)) return DAY_PRESET_OPTIONS.WEEKENDS;
  return DAY_PRESET_OPTIONS.CUSTOM;
};

export function useFeeForm({
  recResourceId,
  mode,
  initialFee,
  onDone,
}: {
  recResourceId: string;
  mode: FeeFormMode;
  initialFee?: RecreationFeeUIModel;
  onDone?: () => void;
}) {
  const createMutation = useCreateFee();
  const updateMutation = useUpdateFee();
  const navigate = useNavigate();

  const defaultValues: AddFeeFormData = useMemo(() => {
    if (!initialFee) {
      return {
        fee_type_sub_type: '',
        fee_amount: undefined,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
        is_recurring: false,
        fee_start_date: undefined,
        fee_end_date: undefined,
        recurring_start_mmdd: undefined,
        recurring_end_mmdd: undefined,
        day_preset: DAY_PRESET_OPTIONS.ALL_DAYS,
        fee_determination_letter_confirmed: false,
        ...DAY_PRESET_CONFIG.all_days,
      };
    }

    const isRecurring = initialFee.recurring_ind;

    const feeApplies =
      isRecurring || initialFee.fee_start_date || initialFee.fee_end_date
        ? FEE_APPLIES_OPTIONS.SPECIFIC_DATES
        : FEE_APPLIES_OPTIONS.ALWAYS;

    const day_preset = dayPresetFromFee(initialFee);

    return {
      fee_type_sub_type: toFeeTypeSubtypeValue(initialFee),
      fee_amount: initialFee.fee_amount ?? undefined,
      fee_applies: feeApplies,
      is_recurring: !!initialFee.recurring_ind,
      fee_start_date: initialFee.fee_start_date
        ? initialFee.fee_start_date.toISOString().split('T')[0]
        : undefined,
      fee_end_date: initialFee.fee_end_date
        ? initialFee.fee_end_date.toISOString().split('T')[0]
        : undefined,
      recurring_start_mmdd: initialFee.recurring_start_mmdd ?? undefined,
      recurring_end_mmdd: initialFee.recurring_end_mmdd ?? undefined,
      day_preset,
      monday_ind: initialFee.monday_ind === 'Y',
      tuesday_ind: initialFee.tuesday_ind === 'Y',
      wednesday_ind: initialFee.wednesday_ind === 'Y',
      thursday_ind: initialFee.thursday_ind === 'Y',
      friday_ind: initialFee.friday_ind === 'Y',
      saturday_ind: initialFee.saturday_ind === 'Y',
      sunday_ind: initialFee.sunday_ind === 'Y',
      fee_determination_letter_confirmed: false,
    };
  }, [initialFee]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, dirtyFields },
  } = useForm<AddFeeFormData>({
    resolver: zodResolver(
      createAddFeeSchema({ requireFdlConfirmation: mode === 'create' }),
    ) as any,
    defaultValues,
    mode: 'onSubmit',
  });

  const feeApplies = useWatch({ control, name: 'fee_applies' });
  const isRecurring = useWatch({ control, name: 'is_recurring' });
  const dayPreset = useWatch({ control, name: 'day_preset' });
  const fdlChecked = useWatch({
    control,
    name: 'fee_determination_letter_confirmed',
  });
  const hasInitializedDayPreset = useRef(false);

  // In edit mode, amount is locked until FDL checkbox is ticked
  const amountLocked = mode === 'edit' && !fdlChecked;

  // FDL checkbox ticking alone should not enable the submit button in edit mode
  const isSubmittable =
    mode === 'edit'
      ? Object.keys(dirtyFields).some(
          (f) => f !== 'fee_determination_letter_confirmed',
        )
      : true;

  useEffect(() => {
    // Preserve initial day selections until the user changes the preset.
    if (!hasInitializedDayPreset.current) {
      hasInitializedDayPreset.current = true;
      return;
    }

    if (dayPreset === DAY_PRESET_OPTIONS.CUSTOM) {
      return;
    }

    const presetConfig = DAY_PRESET_CONFIG[dayPreset];

    DAY_FIELDS.forEach((field) => {
      setValue(field, presetConfig[field]);
    });
  }, [dayPreset, setValue]);

  const done = () => {
    if (onDone) return onDone();
    navigate({
      to: ROUTE_PATHS.REC_RESOURCE_FEES,
      params: { id: recResourceId },
    });
  };

  const onSubmit = async (data: AddFeeFormData) => {
    const { recreation_fee_code, recreation_fee_sub_code } =
      parseFeeTypeSubtypeValue(data.fee_type_sub_type);

    if (!recreation_fee_sub_code) {
      setError('fee_type_sub_type', {
        message: 'Fee sub-type is required',
      });
      return;
    }

    const dayIndicators = transformDayIndicators(data);
    const isSpecificDates =
      data.fee_applies === FEE_APPLIES_OPTIONS.SPECIFIC_DATES;
    const isRecurring = isSpecificDates && data.is_recurring;

    if (mode === 'create') {
      const feeData = {
        recResourceId,
        recreation_fee_code,
        recreation_fee_sub_code,
        fee_amount: data.fee_amount ?? undefined,
        ...dayIndicators,
        recurring_ind: isRecurring,
        recurring_start_mmdd: isRecurring
          ? data.recurring_start_mmdd
          : undefined,
        recurring_end_mmdd: isRecurring ? data.recurring_end_mmdd : undefined,
        fee_start_date:
          isSpecificDates && !isRecurring ? data.fee_start_date : undefined,
        fee_end_date:
          isSpecificDates && !isRecurring ? data.fee_end_date : undefined,
      };

      await createMutation.mutateAsync(feeData);
      reset();
      done();
      return;
    }

    if (!initialFee?.fee_id) {
      return;
    }

    if (dirtyFields.fee_amount && !data.fee_determination_letter_confirmed) {
      setError('fee_determination_letter_confirmed', {
        message: 'You must confirm you have a fee determination letter',
      });
      return;
    }

    const updateData = {
      recResourceId,
      feeId: initialFee.fee_id,
      recreation_fee_code,
      recreation_fee_sub_code,
      fee_amount: data.fee_amount ?? null,
      recurring_ind: isRecurring,
      recurring_start_mmdd: isRecurring ? data.recurring_start_mmdd : null,
      recurring_end_mmdd: isRecurring ? data.recurring_end_mmdd : null,
      fee_start_date:
        isSpecificDates && !isRecurring ? data.fee_start_date : null,
      fee_end_date: isSpecificDates && !isRecurring ? data.fee_end_date : null,
      ...dayIndicators,
    };
    await updateMutation.mutateAsync(updateData);

    reset();
    done();
  };

  const mutation = mode === 'create' ? createMutation : updateMutation;

  return {
    control,
    handleSubmit,
    errors,
    isSubmittable,
    amountLocked,
    fdlChecked,
    mutation,
    onSubmit,
    feeApplies,
    isRecurring,
    setValue,
  };
}
