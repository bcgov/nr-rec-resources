import { useMemo } from 'react';
import { useGetRecreationResourceOptions } from '@/services';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import type { GroupedOptions, GroupedOption } from '@/components/form';

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
    const groupLabels = new Map<string, string>();

    for (const option of options) {
      const [typeCode, subTypeCode] = option.id.split('|');
      if (!typeCode || !subTypeCode) continue;

      const [derivedGroupLabel, ...rest] = option.label.split(' - ');
      const subTypeLabel = rest.length ? rest.join(' - ') : option.label;
      const groupLabel = derivedGroupLabel || typeCode;

      groupLabels.set(typeCode, groupLabel);

      if (!groupMap.has(typeCode)) {
        groupMap.set(typeCode, []);
      }

      groupMap.get(typeCode)!.push({
        value: option.id,
        label: subTypeLabel,
        group: typeCode,
        groupLabel,
      });
    }

    return Array.from(groupMap.entries()).map(([typeCode, opts]) => ({
      label: groupLabels.get(typeCode) ?? typeCode,
      options: opts,
    }));
  }, [options]);

  return {
    options,
    groupedFeeOptions,
    isLoading,
  };
};
