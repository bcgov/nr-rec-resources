import {
  useGetRecreationResourceOptions,
  RecreationResourceOptionUIModel,
} from '@/services';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import { useMemo } from 'react';

export const useFeatureOptions = () => {
  const { data: resourceOptions, isLoading } = useGetRecreationResourceOptions([
    GetOptionsByTypesTypesEnum.FeatureCode,
  ]);

  const featureOptions = resourceOptions?.[0];

  const options = useMemo(() => {
    const raw = featureOptions?.options ?? [];
    return [...raw]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(
        (option): RecreationResourceOptionUIModel => ({
          ...option,
          label: `${option.id} - ${option.label}`,
        }),
      );
  }, [featureOptions]);

  return {
    options,
    isLoading,
  };
};
