import { GroupedOptions } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/components';
import { useGetRecreationResourceOptions } from '@/services';
import { useMemo } from 'react';

/**
 * Custom hook for managing resource options data fetching
 * Consolidates all option API calls into a single hook for reusability
 */
export const useResourceOptions = () => {
  const { data: resourceOptions, isLoading } = useGetRecreationResourceOptions([
    'access',
    'controlAccessCode',
    'maintenance',
    'recreationStatus',
    'regions',
    'riskRatingCode',
  ]);

  const [
    accessOptions,
    controlAccessCodeOptions,
    maintenanceOptions,
    recreationStatusOptions,
    regionOptions,
    riskRatingCodeOptions,
  ] = resourceOptions || [];

  const groupedAccessOptions = useMemo(() => {
    const groups: GroupedOptions[] = [];

    accessOptions?.options.forEach((accessOption) => {
      const groupedOptions: GroupedOptions = {
        label: accessOption.label,
        options: [],
      };

      accessOption.children?.forEach((child) => {
        groupedOptions.options.push({
          label: child.label || '',
          value: child.id || '',
          group: accessOption.id || '',
          groupLabel: accessOption.label || '',
        });
      });

      groups.push(groupedOptions);
    });

    return groups;
  }, [accessOptions]);

  const controlAccessCodeTypeOptions = useMemo(() => {
    const noneOption = { id: null, label: 'None' } as const;

    return [noneOption, ...(controlAccessCodeOptions?.options ?? [])];
  }, [controlAccessCodeOptions]);

  const riskRatingCodeTypeOptions = useMemo(() => {
    const noneOption = { id: null, label: 'None' } as const;

    return [noneOption, ...(riskRatingCodeOptions?.options ?? [])];
  }, [riskRatingCodeOptions]);

  return {
    regionOptions: regionOptions?.options ?? [],
    maintenanceOptions: maintenanceOptions?.options ?? [],
    controlAccessCodeTypeOptions,
    riskRatingCodeTypeOptions,
    accessOptions: accessOptions?.options ?? [],
    recreationStatusOptions: recreationStatusOptions?.options ?? [],
    groupedAccessOptions,
    isLoading,
  };
};
