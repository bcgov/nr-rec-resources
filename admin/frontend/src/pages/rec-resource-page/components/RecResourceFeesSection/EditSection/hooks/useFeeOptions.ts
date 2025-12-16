import { useGetRecreationResourceOptions } from '@/services';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import { useMemo } from 'react';

export const useFeeOptions = () => {
  const { data: resourceOptions, isLoading } = useGetRecreationResourceOptions([
    GetOptionsByTypesTypesEnum.FeeType,
  ]);

  const feeTypeOptions = resourceOptions?.[0];

  const options = useMemo(() => {
    return feeTypeOptions?.options ?? [];
  }, [feeTypeOptions]);

  return {
    options,
    isLoading,
  };
};
