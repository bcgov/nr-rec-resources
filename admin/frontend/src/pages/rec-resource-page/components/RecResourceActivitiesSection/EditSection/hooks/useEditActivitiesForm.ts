import { RecreationActivityDto, useUpdateActivities } from '@/services';
import { handleApiError } from '@/services/utils/errorHandler';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import {
  EditActivitiesFormData,
  editActivitiesSchema,
} from '../schemas/editActivities';

/**
 * Custom hook for managing edit activities form logic
 */
export const useEditActivitiesForm = (
  activities: RecreationActivityDto[],
  recResourceId: string,
) => {
  const updateMutation = useUpdateActivities();

  // Get default values from activities data
  const defaultValues: EditActivitiesFormData = useMemo(() => {
    return {
      activity_codes:
        activities?.map((activity) => activity.recreation_activity_code) || [],
    };
  }, [activities]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditActivitiesFormData>({
    resolver: zodResolver(
      editActivitiesSchema,
    ) as Resolver<EditActivitiesFormData>,
    defaultValues,
    mode: 'onChange',
  });

  // Reset form when activities change
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (data: EditActivitiesFormData): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync({
        recResourceId,
        activity_codes: data.activity_codes,
      });
      addSuccessNotification('Activities updated successfully.');
      return true;
    } catch (error) {
      const { message } = await handleApiError(error);
      addErrorNotification(`Failed to update activities: ${message}`);
      return false;
    }
  };

  return {
    control,
    handleSubmit,
    errors,
    isDirty,
    updateMutation,
    onSubmit,
  };
};
