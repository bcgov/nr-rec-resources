import { isLowMobilityActivity } from '@/pages/rec-resource-page/constants';
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

  // Get default values from activities data, split by is_accessible flag
  // and low mobility codes
  const defaultValues: EditActivitiesFormData = useMemo(() => {
    const codesWhere = (predicate: (a: RecreationActivityDto) => boolean) =>
      activities?.filter(predicate).map((a) => a.recreation_activity_code) ||
      [];
    return {
      activity_codes: codesWhere((a) => !a.is_accessible),
      adaptive_activity_codes: codesWhere(
        (a) =>
          !!a.is_accessible &&
          !isLowMobilityActivity(a.recreation_activity_code),
      ),
      low_mobility_activity_codes: codesWhere((a) =>
        isLowMobilityActivity(a.recreation_activity_code),
      ),
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
        activity_codes: [
          ...data.activity_codes,
          ...data.adaptive_activity_codes,
          ...data.low_mobility_activity_codes,
        ],
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
