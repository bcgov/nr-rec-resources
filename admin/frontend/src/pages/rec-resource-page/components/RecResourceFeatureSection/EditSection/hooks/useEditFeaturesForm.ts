import { RecreationFeatureDto, useUpdateFeatures } from '@/services';
import { handleApiError } from '@/services/utils/errorHandler';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import {
  EditFeaturesFormData,
  editFeaturesSchema,
} from '@/pages/rec-resource-page/components/RecResourceFeatureSection/EditSection/schemas/editFeatures';

export const useEditFeaturesForm = (
  features: RecreationFeatureDto[],
  recResourceId: string,
) => {
  const updateMutation = useUpdateFeatures();

  const defaultValues: EditFeaturesFormData = useMemo(() => {
    return {
      feature_codes:
        features?.map((f) => f.recreation_feature_code).filter(Boolean) || [],
    };
  }, [features]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditFeaturesFormData>({
    resolver: zodResolver(editFeaturesSchema) as Resolver<EditFeaturesFormData>,
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (data: EditFeaturesFormData): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync({
        recResourceId,
        feature_codes: data.feature_codes,
      });
      addSuccessNotification('Features updated successfully.');
      return true;
    } catch (error) {
      const { message } = await handleApiError(error);
      addErrorNotification(`Failed to update features: ${message}`);
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
