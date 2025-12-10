import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  RecreationResourceGeospatialDto,
  UpdateRecreationResourceGeospatialDto,
} from '@/services/recreation-resource-admin';
import useUpdateRecreationResourceGeospatial from '@/services/hooks/recreation-resource-admin/useUpdateRecreationResourceGeospatial';
import {
  createEditResourceGeospatialSchema,
  EditResourceGeospatialFormData,
} from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/schemas/editResourceGeospatial';
import { useNavigateWithQueryParams } from '@shared/hooks';
import { ROUTE_PATHS } from '@/constants/routes';
import { handleApiError } from '@/services/utils/errorHandler';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';

/**
 * Hook encapsulating form state and submission for the RecResource geospatial edit form.
 *
 * @param geospatialData - current geospatial DTO used to seed default values
 * @param recResourceId - id of the recreation resource to update
 */
export const useEditGeospatialForm = (
  geospatialData?: RecreationResourceGeospatialDto,
  recResourceId?: string,
) => {
  const { navigate } = useNavigateWithQueryParams();
  const updateGeospatial = useUpdateRecreationResourceGeospatial();

  const defaultValues = useMemo<EditResourceGeospatialFormData>(() => {
    const source: Partial<RecreationResourceGeospatialDto> =
      geospatialData ?? {};

    return {
      utm_zone: source.utm_zone,
      utm_easting: source.utm_easting,
      utm_northing: source.utm_northing,
    } as EditResourceGeospatialFormData;
  }, [geospatialData]);

  const schema = useMemo(() => createEditResourceGeospatialSchema(), []);

  const form = useForm<EditResourceGeospatialFormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    control,
    formState: { isDirty, errors, isSubmitting },
    reset,
  } = form;

  const onSubmit = async (
    data: EditResourceGeospatialFormData,
  ): Promise<RecreationResourceGeospatialDto | undefined> => {
    if (!recResourceId) {
      console.error('Missing rec_resource_id; cannot submit geospatial update');
      return undefined;
    }

    const dto: Partial<UpdateRecreationResourceGeospatialDto> = {};

    const toNumberOrUndefined = (n?: number) =>
      typeof n === 'number' && !Number.isNaN(n) ? n : undefined;

    const zone = toNumberOrUndefined(data.utm_zone);
    const easting = toNumberOrUndefined(data.utm_easting);
    const northing = toNumberOrUndefined(data.utm_northing);

    if (zone !== undefined) dto.utm_zone = zone;
    if (easting !== undefined) dto.utm_easting = easting;
    if (northing !== undefined) dto.utm_northing = northing;

    try {
      const returned = await updateGeospatial.mutateAsync({
        recResourceId,
        updateRecreationResourceGeospatialDto:
          dto as UpdateRecreationResourceGeospatialDto,
      });

      addSuccessNotification('Geospatial data updated successfully.');

      navigate({
        to: ROUTE_PATHS.REC_RESOURCE_GEOSPATIAL,
        params: { id: recResourceId },
      });

      return returned;
    } catch (err) {
      const { message } = await handleApiError(err);
      addErrorNotification(
        `Failed to update geospatial data: ${message}. Please try again.`,
      );
      console.error('Failed to update geospatial data', err);
      throw err;
    }
  };

  return {
    handleSubmit,
    control,
    errors,
    isDirty,
    isSubmitting,
    onSubmit,
    reset,
  } as const;
};

export default useEditGeospatialForm;
