import { useCreateFee, useUpdateFee, RecreationFeeUIModel } from '@/services';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigateWithQueryParams } from '@shared/hooks';
import { ROUTE_PATHS } from '@/constants/routes';
import {
  AddFeeFormData,
  FEE_APPLIES_OPTIONS,
  DAY_PRESET_OPTIONS,
  addFeeSchema,
} from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/schemas/addFee';
import {
  DAY_FIELDS,
  DAY_PRESET_CONFIG,
} from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/hooks/constants';

type FeeFormMode = 'create' | 'edit';

const transformDayIndicators = (data: AddFeeFormData) => {
  return Object.fromEntries(
    DAY_FIELDS.map((field) => [field, data[field] ? 'Y' : 'N']),
  ) as Record<(typeof DAY_FIELDS)[number], 'Y' | 'N'>;
};

const toYmd = (date: Date | null | undefined): string | undefined => {
  if (!date) return undefined;
  return date.toISOString().slice(0, 10);
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
  const { navigate } = useNavigateWithQueryParams();

  const defaultValues: AddFeeFormData = useMemo(() => {
    if (!initialFee) {
      return {
        recreation_fee_code: '',
        fee_amount: undefined,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
        recurring_fee: false,
        fee_start_date: undefined,
        fee_end_date: undefined,
        day_preset: DAY_PRESET_OPTIONS.ALL_DAYS,
        ...DAY_PRESET_CONFIG.all_days,
      };
    }

    const feeApplies =
      initialFee.fee_start_date || initialFee.fee_end_date
        ? FEE_APPLIES_OPTIONS.SPECIFIC_DATES
        : FEE_APPLIES_OPTIONS.ALWAYS;

    const day_preset = dayPresetFromFee(initialFee);

    return {
      recreation_fee_code: initialFee.recreation_fee_code ?? '',
      fee_amount: initialFee.fee_amount ?? undefined,
      fee_applies: feeApplies,
      recurring_fee: false,
      fee_start_date: toYmd(initialFee.fee_start_date),
      fee_end_date: toYmd(initialFee.fee_end_date),
      day_preset,
      monday_ind: initialFee.monday_ind === 'Y',
      tuesday_ind: initialFee.tuesday_ind === 'Y',
      wednesday_ind: initialFee.wednesday_ind === 'Y',
      thursday_ind: initialFee.thursday_ind === 'Y',
      friday_ind: initialFee.friday_ind === 'Y',
      saturday_ind: initialFee.saturday_ind === 'Y',
      sunday_ind: initialFee.sunday_ind === 'Y',
    };
  }, [initialFee]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AddFeeFormData>({
    resolver: zodResolver(addFeeSchema) as any,
    defaultValues,
    mode: 'onChange',
  });

  const feeApplies = useWatch({ control, name: 'fee_applies' });
  const dayPreset = useWatch({ control, name: 'day_preset' });

  useEffect(() => {
    const presetConfig = DAY_PRESET_CONFIG[dayPreset];
    if (presetConfig) {
      DAY_FIELDS.forEach((field) => {
        setValue(field, presetConfig[field]);
      });
    }
  }, [dayPreset, setValue]);

  const done = () => {
    if (onDone) return onDone();
    navigate({
      to: ROUTE_PATHS.REC_RESOURCE_FEES,
      params: { id: recResourceId },
    });
  };

  const onSubmit = async (data: AddFeeFormData) => {
    const dayIndicators = transformDayIndicators(data);

    if (mode === 'create') {
      const feeData = {
        recResourceId,
        recreation_fee_code: data.recreation_fee_code,
        fee_amount: data.fee_amount ?? undefined,
        ...dayIndicators,
        ...(data.fee_applies === FEE_APPLIES_OPTIONS.SPECIFIC_DATES
          ? {
              fee_start_date: data.fee_start_date ?? undefined,
              fee_end_date: data.fee_end_date ?? undefined,
            }
          : {}),
      };

      await createMutation.mutateAsync(feeData);
      reset();
      done();
      return;
    }

    if (!initialFee?.fee_id) {
      // Should not happen – edit mode requires a fee id.
      return;
    }

    const fee_start_date =
      data.fee_applies === FEE_APPLIES_OPTIONS.SPECIFIC_DATES
        ? (data.fee_start_date ?? null)
        : null;
    const fee_end_date =
      data.fee_applies === FEE_APPLIES_OPTIONS.SPECIFIC_DATES
        ? (data.fee_end_date ?? null)
        : null;

    await updateMutation.mutateAsync({
      recResourceId,
      feeId: initialFee.fee_id,
      recreation_fee_code: data.recreation_fee_code,
      fee_amount: data.fee_amount ?? null,
      fee_start_date,
      fee_end_date,
      ...dayIndicators,
    });

    reset();
    done();
  };

  const mutation = mode === 'create' ? createMutation : updateMutation;

  return {
    control,
    handleSubmit,
    errors,
    isDirty,
    mutation,
    onSubmit,
    feeApplies,
  };
}
