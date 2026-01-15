import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useDeleteResourceImage } from '@/services/hooks/recreation-resource-admin/useDeleteResourceImage';
import { useStore } from '@tanstack/react-store';
import { useCallback } from 'react';
import {
  recResourceFileTransferStore,
  setFileToDelete,
  updateGalleryImage,
} from '../store/recResourceFileTransferStore';
import { GalleryImage } from '../types';
import { useFileDelete } from './utils/useFileDelete';

export function useImageDelete() {
  const { recResource } = useRecResource();
  const { fileToDelete } = useStore(recResourceFileTransferStore);
  const deleteResourceImageMutation = useDeleteResourceImage();
  const { executeDelete } = useFileDelete<GalleryImage>();

  const handleDelete = useCallback(
    async (onSuccess?: () => void) => {
      await executeDelete({
        recResourceId: recResource?.rec_resource_id,
        file: fileToDelete,
        expectedType: 'image',
        deleteMutation: deleteResourceImageMutation,
        updateGalleryFile: updateGalleryImage,
        setFileToDelete,
        getMutationParams: (recResourceId, fileId) => ({
          recResourceId,
          imageId: fileId,
        }),
        successMessage: (fileName) =>
          `Image "${fileName}" deleted successfully.`,
        errorMessage: 'Unable to delete image: missing required information.',
        onSuccess,
      });
    },
    [executeDelete, deleteResourceImageMutation, recResource, fileToDelete],
  );

  return {
    handleDelete,
    isDeleting: deleteResourceImageMutation.isPending,
  };
}
