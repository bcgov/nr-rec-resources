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
import {
  getReservationContact,
  getReservationMethod,
} from '@/pages/rec-resource-page/components/RecResourceReservationSection/helpers';
import {
  EditReservationFormData,
  createEditReservationSchema,
} from '@/pages/rec-resource-page/components/RecResourceReservationSection/EditSection/schemas';
import { useNavigateWithQueryParams } from '@shared/hooks';
import { useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import useUpdateRecreationResourceReservation from '@/services/hooks/recreation-resource-admin/useUpdateRecreationResourceReservation';
import { ReservationMethod } from '../constants';

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
    const reservationMethod = getReservationMethod(recResourceReservationInfo);

    return {
      has_reservation: Boolean(reservationMethod),
      reservation_method: reservationMethod,
      reservation_contact: getReservationContact(
        recResourceReservationInfo,
        reservationMethod,
      ),
    };
  }, [recResourceReservationInfo]);

  // React Hook Form setup
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
  } = useForm<EditReservationFormData>({
    resolver: zodResolver(
      editReservationSchema,
    ) as Resolver<EditReservationFormData>,
    defaultValues,
    mode: 'onSubmit', // Validate on every change for real-time feedback
    reValidateMode: 'onChange', // Re-validate on change to clear errors when fixed
  });

  const handleHasReservationChange = (value: boolean) => {
    setValue('has_reservation', value, {
      shouldDirty: true,
    });

    if (!value) {
      setValue('reservation_method', undefined, {
        shouldDirty: true,
      });
      setValue('reservation_contact', '', {
        shouldDirty: true,
      });
    }
  };

  const handleReservationMethodChange = (value?: ReservationMethod | '') => {
    setValue('reservation_method', value || undefined, {
      shouldDirty: true,
    });
    setValue('reservation_contact', '', {
      shouldDirty: true,
    });
  };

  const onSubmit = async (data: EditReservationFormData) => {
    if (data.has_reservation && !data.reservation_method) {
      addErrorNotification(`Please select a Reservation Method.`);
      return;
    }

    const updateData: UpdateRecreationResourceReservationDto = {
      reservation_email: undefined,
      reservation_website: undefined,
      reservation_phone_number: undefined,
    };

    if (data.has_reservation && data.reservation_method) {
      updateData[data.reservation_method] =
        data.reservation_contact || undefined;
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
        `Failed to update reservation info:\n${message}. Try again.`,
      );
    }
  };

  return {
    control,
    register,
    handleSubmit,
    errors,
    isDirty,
    updateMutation,
    onSubmit,
    handleHasReservationChange,
    handleReservationMethodChange,
  };
};
