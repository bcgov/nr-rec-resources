import { useMemo } from 'react';
import { useGetRecreationResourceOptions } from '@/services';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import type { GroupedOptions, GroupedOption } from '@/components/form';

const FEE_TYPE_GROUP_LABELS: Record<string, string> = {
  O: 'Overnight',
  T: 'Trail use',
  A: 'Additional fees',
};

export const useFeeOptions = () => {
  const { data: resourceOptions, isLoading } = useGetRecreationResourceOptions([
    GetOptionsByTypesTypesEnum.FeeType,
  ]);

  const feeTypeOptions = resourceOptions?.[0];

  const options = useMemo(() => {
    return feeTypeOptions?.options ?? [];
  }, [feeTypeOptions]);

  const groupedFeeOptions = useMemo((): GroupedOptions[] => {
    const groupMap = new Map<string, GroupedOption[]>();

    for (const option of options) {
      const [typeCode, subTypeCode] = option.id.split('|');
      if (!typeCode || !subTypeCode) continue;

      const groupLabel = FEE_TYPE_GROUP_LABELS[typeCode] ?? typeCode;

      if (!groupMap.has(typeCode)) {
        groupMap.set(typeCode, []);
      }

      groupMap.get(typeCode)!.push({
        value: option.id,
        label: option.label.includes(' - ')
          ? option.label.split(' - ').slice(1).join(' - ')
          : option.label,
        group: typeCode,
        groupLabel,
      });
    } // <- this was missing

    return Array.from(groupMap.entries()).map(([typeCode, opts]) => ({
      label: FEE_TYPE_GROUP_LABELS[typeCode] ?? typeCode,
      options: opts,
    }));
  }, [options]);

  return {
    options,
    groupedFeeOptions,
    isLoading,
  };
};
