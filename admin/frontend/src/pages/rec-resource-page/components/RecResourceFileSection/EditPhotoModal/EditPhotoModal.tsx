import { BaseFileModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/BaseFileModal';
import { ImageUploadForm } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/sections';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FC } from 'react';
import { useEditPhoto } from './hooks/useEditPhoto';

export const EditPhotoModal: FC = () => {
  const {
    showEditPhotoModal,
    image,
    isFormValid,
    isFormDirty,
    handleFormReady,
    handleCancel,
    handleSave,
    handleEditSubmit,
    initialValues,
  } = useEditPhoto();

  if (!showEditPhotoModal || !image || !initialValues) {
    return null;
  }

  const alerts = [
    {
      variant: 'info' as const,
      icon: faInfoCircle,
      text: 'Saving this photo will publish to the public website.',
    },
  ];

  return (
    <BaseFileModal
      show={showEditPhotoModal}
      onHide={handleCancel}
      title="Edit photo"
      galleryFile={{ ...image, type: 'image' }}
      className="edit-photo-modal"
      onCancel={handleCancel}
      onConfirm={handleSave}
      confirmButtonText="Save"
      confirmButtonDisabled={!isFormValid || !isFormDirty}
      alerts={alerts}
    >
      <ImageUploadForm
        key={image.id}
        fileName={image.name}
        onUpload={() => {}}
        onSubmitForm={handleEditSubmit}
        mode="edit"
        initialValues={initialValues}
        disableConsentFields={!!image.has_consent_metadata}
        showConsentSection
        onFormReady={handleFormReady}
      />
    </BaseFileModal>
  );
};
