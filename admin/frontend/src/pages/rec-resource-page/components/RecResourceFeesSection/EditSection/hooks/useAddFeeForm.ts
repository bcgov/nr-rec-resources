import { useCreateFee } from '@/services';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
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

const transformDayIndicators = (data: AddFeeFormData) => {
  return Object.fromEntries(
    DAY_FIELDS.map((field) => [field, data[field] ? 'Y' : 'N']),
  );
};

const prepareFeeData = (data: AddFeeFormData, recResourceId: string) => {
  const dayIndicators = transformDayIndicators(data);

  const baseData = {
    recResourceId,
    recreation_fee_code: data.recreation_fee_code,
    fee_amount: data.fee_amount ?? undefined,
    ...dayIndicators,
  };

  if (data.fee_applies === FEE_APPLIES_OPTIONS.SPECIFIC_DATES) {
    return {
      ...baseData,
      fee_start_date: data.fee_start_date ?? undefined,
      fee_end_date: data.fee_end_date ?? undefined,
    };
  }

  return baseData;
};

export const useAddFeeForm = (recResourceId: string) => {
  const createMutation = useCreateFee();
  const { navigate } = useNavigateWithQueryParams();

  const defaultValues: AddFeeFormData = {
    recreation_fee_code: '',
    fee_amount: undefined,
    fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
    recurring_fee: false,
    fee_start_date: undefined,
    fee_end_date: undefined,
    day_preset: DAY_PRESET_OPTIONS.ALL_DAYS,
    ...DAY_PRESET_CONFIG.all_days,
  };

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

  const onSubmit = async (data: AddFeeFormData) => {
    const feeData = prepareFeeData(data, recResourceId);
    await createMutation.mutateAsync(feeData);
    reset();

    navigate({
      to: ROUTE_PATHS.REC_RESOURCE_FEES,
      params: { id: recResourceId },
    });
  };

  return {
    control,
    handleSubmit,
    errors,
    isDirty,
    createMutation,
    onSubmit,
    feeApplies,
    setValue,
  };
};
