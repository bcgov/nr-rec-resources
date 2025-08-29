import {
  addErrorNotification,
  addSpinnerNotification,
  addSuccessNotification,
  removeNotification,
} from '@/store/notificationStore';
import { downloadUrlAsFile } from '@/utils/fileUtils';
import { useMutation } from '@tanstack/react-query';
import { updateGalleryDocument } from '../store/recResourceFileTransferStore';
import { GalleryFile } from '../types';

/**
 * React hook for downloading a file and showing notifications for success or error.
 *
 * This hook provides a mutation that downloads a file from a given URL and filename,
 * and displays a success or error notification based on the result.
 */
export function useFileDownload() {
  return useMutation<void, unknown, { file: GalleryFile }>({
    mutationFn: async ({ file }) => {
      addSpinnerNotification(`Downloading file "${file.name}"...`, file.id);
      updateGalleryDocument(file.id, { isDownloading: true });
      await downloadUrlAsFile(file.url, file.name);
    },
    onSuccess: (_data, variables) => {
      addSuccessNotification(
        `File "${variables.file.name}" downloaded successfully.`,
      );
    },
    onError: (_error, variables) => {
      addErrorNotification(`Failed to download file "${variables.file.name}".`);
    },
    onSettled: (_data, _error, variables) => {
      updateGalleryDocument(variables.file.id, { isDownloading: false });
      removeNotification(variables.file.id);
    },
  });
}
