import { ROUTE_PATHS } from '@/constants/routes';
import {
  RecreationResourceDetailUIModel,
  UpdateRecreationResourceDto,
  useUpdateRecreationResource,
} from '@/services';
import { handleApiError } from '@/services/utils/errorHandler';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigateWithQueryParams } from '@shared/hooks';
import { useMemo } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import type { GroupedOption } from '../components/GroupedMultiSelectField';
import { EditResourceFormData, editResourceSchema } from '../schemas';

/**
 * Custom hook for managing edit resource form logic
 * Handles form state, validation, submission, and complex interactions
 */
export const useEditResourceForm = (
  recResource: RecreationResourceDetailUIModel,
) => {
  const { navigate } = useNavigateWithQueryParams();
  const updateMutation = useUpdateRecreationResource();

  // Get default values from resource data
  const defaultValues: EditResourceFormData = useMemo(() => {
    const selectedAccessOptions: GroupedOption[] = [];

    if (recResource.access_codes && Array.isArray(recResource.access_codes)) {
      recResource.access_codes.forEach((accessCode) => {
        accessCode.sub_access_codes.forEach((subAccessCode) => {
          selectedAccessOptions.push({
            label: subAccessCode.description,
            value: subAccessCode.code,
            group: accessCode.code,
            groupLabel: accessCode.description,
          });
        });
      });
    }

    return {
      maintenance_standard_code: recResource.maintenance_standard_code || '',
      control_access_code: recResource.control_access_code || null,
      selected_access_options: selectedAccessOptions,
      status_code: recResource.recreation_status_code?.toString() || '',
    };
  }, [recResource]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditResourceFormData>({
    resolver: zodResolver(editResourceSchema) as Resolver<EditResourceFormData>,
    defaultValues,
    mode: 'onChange',
  });

  // Watch form values
  const selectedAccessOptions =
    useWatch({ control, name: 'selected_access_options' }) || [];

  const onSubmit = async (data: EditResourceFormData) => {
    // Build access codes structure from selected sub-access options
    const accessCodesMap: Record<
      string,
      {
        access_code: string;
        sub_access_codes: Array<string>;
      }
    > = {};

    // Process each selected sub-access option
    data.selected_access_options.forEach((option: GroupedOption) => {
      const parentId = option.group;

      // Initialize parent access code if not exists
      if (!accessCodesMap[parentId]) {
        accessCodesMap[parentId] = {
          access_code: parentId,
          sub_access_codes: [],
        };
      }

      // Add the sub-access code
      accessCodesMap[parentId].sub_access_codes.push(option.value);
    });

    // Prepare update data with proper type conversion
    const updateData: UpdateRecreationResourceDto = {
      maintenance_standard_code: data.maintenance_standard_code || undefined,
      control_access_code: data.control_access_code ?? null,
      status_code: data.status_code ? Number(data.status_code) : undefined,
      access_codes: Object.values(accessCodesMap),
    };

    // Submit the update using mutateAsync for cleaner async handling
    try {
      await updateMutation.mutateAsync({
        recResourceId: recResource.rec_resource_id.toString(),
        updateRecreationResourceDto: updateData,
      });

      addSuccessNotification('Recreation resource updated successfully.');
      navigate({
        to: ROUTE_PATHS.REC_RESOURCE_OVERVIEW,
        params: { id: recResource.rec_resource_id.toString() },
      });
    } catch (error) {
      const { message } = await handleApiError(error);
      addErrorNotification(
        `Failed to update recreation resource: ${message}. Please try again.`,
      );
    }
  };

  return {
    control,
    handleSubmit,
    errors,
    isDirty,
    selectedAccessOptions,
    updateMutation,
    onSubmit,
  };
};
