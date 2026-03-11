import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import {
  hideEditPhoto,
  recResourceFileTransferStore,
} from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import { GalleryImage } from '@/pages/rec-resource-page/types';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { useCreateImageConsent, useUpdateImageConsent } from '@/services/hooks';
import { useStore } from '@tanstack/react-store';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ImageUploadFormHandlers } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/sections';

export function useEditPhoto() {
  const { showEditPhotoModal, selectedImageForEdit } = useStore(
    recResourceFileTransferStore,
  );
  const { rec_resource_id } = useRecResource();
  const updateImageConsentMutation = useUpdateImageConsent();
  const createImageConsentMutation = useCreateImageConsent();
  const [isFormValid, setIsFormValid] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const resetFormRef = useRef<() => void>(() => {});
  const submitFormRef = useRef<() => void>(() => {});

  const image = selectedImageForEdit as GalleryImage | null;

  const handleFormReady = useCallback((handlers: ImageUploadFormHandlers) => {
    resetFormRef.current = handlers.resetForm;
    submitFormRef.current = handlers.submitForm;
    setIsFormValid(handlers.isValid);
    setIsFormDirty(handlers.isDirty);
  }, []);

  const handleCancel = useCallback(() => {
    resetFormRef.current();
    hideEditPhoto();
  }, []);

  const handleSave = useCallback(() => {
    submitFormRef.current();
  }, []);

  const initialValues = useMemo(() => {
    if (!image) return null;

    return {
      displayName: image.name ?? '',
      dateCreated: image.date_taken ? new Date(image.date_taken) : null,
      didYouTakePhoto: image.photographer_type === 'STAFF' ? true : null,
      containsIdentifiableInfo: image.has_consent_metadata
        ? (image.contains_pii ?? null)
        : null,
      photographerName: image.photographer_name ?? '',
      photographerType: image.photographer_type ?? 'STAFF',
      confirmationChecked: Boolean(image.has_consent_metadata),
    };
  }, [image]);

  const handleEditSubmit = useCallback(
    async (values: any) => {
      if (!rec_resource_id || !image?.id) {
        addErrorNotification(
          'Unable to update photo: missing required context.',
        );
        return;
      }

      try {
        const dateTaken = values.dateCreated
          ? values.dateCreated.toISOString().split('T')[0]
          : undefined;

        if (image.has_consent_metadata) {
          await updateImageConsentMutation.mutateAsync({
            recResourceId: rec_resource_id,
            imageId: image.id,
            fileName: values.displayName || undefined,
            dateTaken,
          });
        } else {
          await createImageConsentMutation.mutateAsync({
            recResourceId: rec_resource_id,
            imageId: image.id,
            fileName: values.displayName || undefined,
            dateTaken,
            containsPii:
              values.containsIdentifiableInfo === null
                ? undefined
                : values.containsIdentifiableInfo,
            photographerType: values.photographerType || undefined,
            photographerName: values.photographerName || undefined,
            consentForm: values.consentFormFile || undefined,
          });
        }

        addSuccessNotification(`Photo "${image.name}" updated successfully.`);
        hideEditPhoto();
      } catch {
        addErrorNotification('Failed to update photo.');
      }
    },
    [
      rec_resource_id,
      image,
      updateImageConsentMutation,
      createImageConsentMutation,
    ],
  );

  return {
    showEditPhotoModal,
    image,
    isFormValid,
    isFormDirty,
    handleFormReady,
    handleCancel,
    handleSave,
    handleEditSubmit,
    initialValues,
  };
}
