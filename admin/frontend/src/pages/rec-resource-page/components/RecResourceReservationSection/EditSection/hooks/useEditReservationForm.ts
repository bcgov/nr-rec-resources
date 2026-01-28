import { ROUTE_PATHS } from '@/constants/routes';
import {
  RecreationResourceReservationInfoDto,
  UpdateRecreationResourceReservationDto,
} from '@/services';
import { handleApiError } from '@/services/utils/errorHandler';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigateWithQueryParams } from '@shared/hooks';
import { useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import {
  EditReservationFormData,
  createEditReservationSchema,
} from '../schemas';
import useUpdateRecreationResourceReservation from '@/services/hooks/recreation-resource-admin/useUpdateRecreationResourceReservation';

/**
 * Custom hook for managing edit resource form logic
 * Handles form state, validation, submission, and complex interactions
 * @param recResourceReservationInfo - The recreation resource data
 */
export const useEditReservationForm = (
  recResourceId: string,
  recResourceReservationInfo: RecreationResourceReservationInfoDto | null,
) => {
  const { navigate } = useNavigateWithQueryParams();
  const updateMutation = useUpdateRecreationResourceReservation();

  // Create schema with district options for validation
  const editReservationSchema = useMemo(
    () => createEditReservationSchema(),
    [],
  );

  // Get default values from resource data
  const defaultValues: EditReservationFormData = useMemo(() => {
    return {
      has_reservation: false,
      reservation_email: recResourceReservationInfo?.reservation_email || '',
      reservation_website:
        recResourceReservationInfo?.reservation_website || '',
      reservation_phone_number:
        recResourceReservationInfo?.reservation_phone_number || '',
    };
  }, [recResourceReservationInfo]);

  // React Hook Form setup
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    resetField,
    getValues,
  } = useForm<EditReservationFormData>({
    resolver: zodResolver(
      editReservationSchema,
    ) as Resolver<EditReservationFormData>,
    defaultValues,
    mode: 'onSubmit', // Validate on every change for real-time feedback
    reValidateMode: 'onChange', // Re-validate on change to clear errors when fixed
  });

  const onSubmit = async (data: EditReservationFormData) => {
    // Prepare update data with proper type conversion
    const updateData: UpdateRecreationResourceReservationDto = {
      reservation_email: data.reservation_email || undefined,
      reservation_website: data.reservation_website || undefined,
      reservation_phone_number: data.reservation_phone_number || undefined,
    };

    if (
      data.has_reservation &&
      (!data.reservation_email || data.reservation_email === '') &&
      (!data.reservation_website || data.reservation_website === '') &&
      (!data.reservation_phone_number || data.reservation_phone_number === '')
    ) {
      addErrorNotification(
        `Failed to update recreation resource: at least one contact form must exist.`,
      );
      return;
    }

    // Submit the update using mutateAsync for cleaner async handling
    try {
      await updateMutation.mutateAsync({
        recResourceId,
        updateRecreationResourceReservationDto: updateData,
      });

      addSuccessNotification(
        'Recreation resource reservation updated successfully.',
      );
      navigate({
        to: ROUTE_PATHS.REC_RESOURCE_RESERVATION,
        params: {
          id: recResourceId,
        },
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
    register,
    handleSubmit,
    errors,
    isDirty,
    setValue,
    resetField,
    getValues,
    updateMutation,
    onSubmit,
  };
};
