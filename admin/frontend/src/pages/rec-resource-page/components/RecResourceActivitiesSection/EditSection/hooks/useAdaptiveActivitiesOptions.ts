import { useGetRecreationResourceOptions } from '@/services';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import { useMemo } from 'react';

/**
 * Custom hook for fetching accessible activity options
 */
export const useAdaptiveActivitiesOptions = () => {
  const { data: resourceOptions, isLoading } = useGetRecreationResourceOptions([
    GetOptionsByTypesTypesEnum.AccessibleActivities,
  ]);

  const adaptiveOptions = resourceOptions?.[0];

  const options = useMemo(() => {
    return adaptiveOptions?.options ?? [];
  }, [adaptiveOptions]);

  return {
    options,
    isLoading,
  };
};
