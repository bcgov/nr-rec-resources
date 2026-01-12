import { handleApiError } from '@/services/utils/errorHandler';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { useCallback } from 'react';
import { FileType, GalleryFile } from '../../types';
import { formatDeleteError } from './fileErrorMessages';

interface FileDeleteConfig<T extends GalleryFile> {
  recResourceId: string | undefined;
  file: GalleryFile | undefined;
  expectedType: FileType;
  deleteMutation: {
    mutateAsync: (params: any) => Promise<any>;
  };
  updateGalleryFile: (id: string, updates: Partial<T>) => void;
  setFileToDelete: (file?: GalleryFile) => void;
  getMutationParams: (recResourceId: string, fileId: string) => any;
  successMessage: (fileName: string) => string;
  errorMessage: string;
  onSuccess?: () => void;
}

export function useFileDelete<T extends GalleryFile>() {
  const executeDelete = useCallback(
    async ({
      recResourceId,
      file,
      expectedType,
      deleteMutation,
      updateGalleryFile,
      setFileToDelete,
      getMutationParams,
      successMessage,
      errorMessage,
      onSuccess,
    }: FileDeleteConfig<T>) => {
      if (!recResourceId || !file?.id || file.type !== expectedType) {
        addErrorNotification(errorMessage);
        return;
      }

      try {
        updateGalleryFile(file.id, { isDeleting: true } as Partial<T>);
        await deleteMutation.mutateAsync(
          getMutationParams(recResourceId, file.id),
        );
        addSuccessNotification(successMessage(file.name));
        setFileToDelete(undefined);
        onSuccess?.();
      } catch (error: unknown) {
        const errorInfo = await handleApiError(error);
        addErrorNotification(formatDeleteError(file.name, errorInfo));
        updateGalleryFile(file.id, {
          isDeleting: false,
          deleteFailed: true,
        } as Partial<T>);
      }
    },
    [],
  );

  return { executeDelete };
}
