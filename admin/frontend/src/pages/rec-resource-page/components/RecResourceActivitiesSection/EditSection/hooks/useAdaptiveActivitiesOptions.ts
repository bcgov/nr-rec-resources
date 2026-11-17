import { isLowMobilityActivity } from '@/pages/rec-resource-page/constants';
import { useGetRecreationResourceOptions } from '@/services';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import { useMemo } from 'react';

/**
 * Custom hook for fetching accessible activity options, split into
 * accessible activities and low mobility access
 */
export const useAdaptiveActivitiesOptions = () => {
  const { data: resourceOptions, isLoading } = useGetRecreationResourceOptions([
    GetOptionsByTypesTypesEnum.AccessibleActivities,
  ]);

  const adaptiveOptions = resourceOptions?.[0];

  const { options, lowMobilityOptions } = useMemo(() => {
    const all = adaptiveOptions?.options ?? [];
    const isLowMobility = (id: string | null) =>
      id !== null && isLowMobilityActivity(Number(id));
    return {
      options: all.filter((o) => !isLowMobility(o.id)),
      lowMobilityOptions: all.filter((o) => isLowMobility(o.id)),
    };
  }, [adaptiveOptions]);

  return {
    options,
    lowMobilityOptions,
    isLoading,
  };
};
