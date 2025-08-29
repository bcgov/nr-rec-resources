import { GroupedOptions } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/components';
import {
  GetOptionsByTypeTypeEnum,
  useGetRecreationResourceOptions,
} from '@/services';
import { useMemo } from 'react';

/**
 * Custom hook for managing resource options data fetching
 * Consolidates all option API calls into a single hook for reusability
 */
export const useResourceOptions = () => {
  const regionOptions = useGetRecreationResourceOptions(
    GetOptionsByTypeTypeEnum.Regions,
  );
  const maintenanceOptions = useGetRecreationResourceOptions(
    GetOptionsByTypeTypeEnum.Maintenance,
  );
  const controlAccessCodeTypeOptions = useGetRecreationResourceOptions(
    GetOptionsByTypeTypeEnum.ControlAccessCode,
    {
      // Add "None" option to unset control access code
      select: (data) => [{ id: null, label: 'None' }, ...data],
    },
  );
  const accessOptions = useGetRecreationResourceOptions(
    GetOptionsByTypeTypeEnum.Access,
  );
  const recreationStatusOptions = useGetRecreationResourceOptions(
    GetOptionsByTypeTypeEnum.RecreationStatus,
  );

  const groupedAccessOptions = useMemo(() => {
    const groups: GroupedOptions[] = [];

    accessOptions.data?.forEach((accessOption) => {
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

  return {
    regionOptions: regionOptions.data || [],
    maintenanceOptions: maintenanceOptions.data || [],
    controlAccessCodeTypeOptions: controlAccessCodeTypeOptions.data || [],
    accessOptions: accessOptions.data || [],
    recreationStatusOptions: recreationStatusOptions.data || [],
    groupedAccessOptions,
    isLoading:
      regionOptions.isLoading ||
      maintenanceOptions.isLoading ||
      controlAccessCodeTypeOptions.isLoading ||
      accessOptions.isLoading ||
      recreationStatusOptions.isLoading,
  };
};
