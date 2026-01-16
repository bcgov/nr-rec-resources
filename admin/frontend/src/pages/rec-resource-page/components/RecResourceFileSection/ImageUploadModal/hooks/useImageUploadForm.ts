import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  imageUploadSchema,
  ImageUploadFormData,
  getUploadState,
  UploadState,
} from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/schemas';
import { setUploadFileName } from '@/pages/rec-resource-page/store/recResourceFileTransferStore';

export const useImageUploadForm = (initialDisplayName?: string) => {
  const displayNameWithoutExtension = initialDisplayName?.replace(
    /\.[^/.]+$/,
    '',
  );

  const form = useForm<ImageUploadFormData>({
    resolver: zodResolver(imageUploadSchema),
    defaultValues: {
      displayName: displayNameWithoutExtension,
      takenDuringWorkingHours: undefined,
      containsPersonalInfo: undefined,
      confirmNoPersonalInfo: false,
    },
    mode: 'onChange',
  });

  const formValues = useWatch({ control: form.control });

  useEffect(() => {
    form.reset({
      displayName: displayNameWithoutExtension,
      takenDuringWorkingHours: undefined,
      containsPersonalInfo: undefined,
      confirmNoPersonalInfo: false,
    });
    // ensure the global uploadFileName is initialized to the incoming display name
    setUploadFileName(displayNameWithoutExtension ?? '');
    // eslint-disable-next-line
  }, [initialDisplayName]);

  // Live sync moved to Controller's onChange in ImageUploadForm.tsx

  const uploadState: UploadState = getUploadState(
    formValues as ImageUploadFormData,
  );

  const isUploadEnabled = uploadState === 'ready';

  const resetForm = () => {
    form.reset({
      displayName: displayNameWithoutExtension,
      takenDuringWorkingHours: undefined,
      containsPersonalInfo: undefined,
      confirmNoPersonalInfo: false,
    });
    setUploadFileName(displayNameWithoutExtension ?? '');
  };

  return {
    control: form.control,
    setValue: form.setValue,
    resetForm,
    uploadState,
    isUploadEnabled,
  };
};
