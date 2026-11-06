import {
  addErrorNotification,
  addSpinnerNotification,
  addSuccessNotification,
  removeNotification,
} from '@/store/notificationStore';
import { buildDownloadFileName, downloadUrlAsFile } from '@shared/utils';
import { useMutation } from '@tanstack/react-query';
import { updateGalleryDocument } from '../store/recResourceFileTransferStore';
import { GalleryFile } from '../types';

type FileDownloadVariables = {
  file: GalleryFile;
  recResourceId?: string;
  // extra part between the rec id and the file name, e.g. 'exhibit-a'
  docType?: string;
};

/**
 * React hook for downloading a file and showing notifications for success or error.
 *
 * This hook provides a mutation that downloads a file from a given URL,
 * saves it as e.g. `images.sitesandtrailsbc.REC1234.lake-view.webp`,
 * and displays a success or error notification based on the result.
 */
export function useFileDownload() {
  return useMutation<void, unknown, FileDownloadVariables>({
    mutationFn: async ({ file, recResourceId, docType }) => {
      addSpinnerNotification(`Downloading file "${file.name}"...`, file.id);
      updateGalleryDocument(file.id, { isDownloading: true });
      const fileName = buildDownloadFileName({
        kind: file.type === 'image' ? 'images' : 'docs',
        recResourceId,
        parts: [docType, file.name],
        extension: file.extension || (file.type === 'image' ? 'webp' : 'pdf'),
      });
      await downloadUrlAsFile(file.url, fileName);
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
