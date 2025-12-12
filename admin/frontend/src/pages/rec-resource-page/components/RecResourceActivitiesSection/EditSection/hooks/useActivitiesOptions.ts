import { useGetRecreationResourceOptions } from '@/services';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import { useMemo } from 'react';

/**
 * Custom hook for fetching activities options
 */
export const useActivitiesOptions = () => {
  const { data: resourceOptions, isLoading } = useGetRecreationResourceOptions([
    GetOptionsByTypesTypesEnum.Activities,
  ]);

  const activitiesOptions = resourceOptions?.[0];

  const options = useMemo(() => {
    return activitiesOptions?.options ?? [];
  }, [activitiesOptions]);

  return {
    options,
    isLoading,
  };
};
