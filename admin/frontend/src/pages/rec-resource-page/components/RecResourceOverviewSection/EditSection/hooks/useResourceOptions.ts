import { GroupedOptions } from '@/components/form/GroupedMultiSelectField';
import {
  RecreationResourceOptionUIModel,
  useGetRecreationResourceOptions,
} from '@/services';
import { useMemo } from 'react';

export interface UseResourceOptionsParams {
  /**
   * The currently selected district code (if any). Used to determine which archived options to show.
   */
  currentDistrictCode?: string | null;
}

/**
 * Custom hook for managing resource options data fetching
 * Consolidates all option API calls into a single hook for reusability
 * @param options - Configuration options for filtering and formatting resource options
 */
export const useResourceOptions = (options?: UseResourceOptionsParams) => {
  const { currentDistrictCode } = options || {};
  const { data: resourceOptions, isLoading } = useGetRecreationResourceOptions([
    'access',
    'controlAccessCode',
    'maintenance',
    'recreationStatus',
    'riskRatingCode',
    'district',
  ]);

  const [
    accessOptions,
    controlAccessCodeOptions,
    maintenanceOptions,
    recreationStatusOptions,
    riskRatingCodeOptions,
    districtOptions,
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

  const districtOptionsWithNoneOption = useMemo(() => {
    const noneOption: RecreationResourceOptionUIModel = {
      id: '',
      label: 'None',
    };

    // Filter options: show archived only if it's the current value, otherwise filter them out
    const filteredDistrictOptions: RecreationResourceOptionUIModel[] = (
      districtOptions?.options ?? []
    ).filter((option) => {
      // Always show non-archived options
      if (!option.is_archived) {
        return true;
      }
      // Show archived option only if it matches the current value
      return option.id === currentDistrictCode;
    });

    // Format labels: add asterisk to archived options and disable them (unless it's the current value)
    const formattedDistrictOptions = filteredDistrictOptions.map((option) => {
      const isOptionArchived = Boolean(option.is_archived);
      return {
        ...option,
        label: isOptionArchived ? `${option.label} (Archived**)` : option.label,
        disabled: isOptionArchived,
      };
    });

    return [noneOption, ...formattedDistrictOptions];
  }, [districtOptions, currentDistrictCode]);

  return {
    districtOptions: districtOptionsWithNoneOption,
    maintenanceOptions: maintenanceOptions?.options ?? [],
    controlAccessCodeTypeOptions,
    riskRatingCodeTypeOptions,
    accessOptions: accessOptions?.options ?? [],
    recreationStatusOptions: recreationStatusOptions?.options ?? [],
    groupedAccessOptions,
    isLoading,
  };
};
