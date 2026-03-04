import { useGetRecreationResourceOptions } from '@/services';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';

const EXPORT_FILTER_OPTION_TYPES = [
  GetOptionsByTypesTypesEnum.District,
  GetOptionsByTypesTypesEnum.ResourceType,
] as const;

export const useExportFilterOptions = () => {
  const { data: resourceOptions, isLoading } = useGetRecreationResourceOptions([
    ...EXPORT_FILTER_OPTION_TYPES,
  ]);

  const [districtOptions, resourceTypeOptions] = resourceOptions ?? [];

  return {
    districtOptions: districtOptions?.options ?? [],
    resourceTypeOptions: resourceTypeOptions?.options ?? [],
    isLoading,
  };
};
