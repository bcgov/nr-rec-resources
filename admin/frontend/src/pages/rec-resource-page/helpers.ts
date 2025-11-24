import { getFileNameWithoutExtension } from '@/utils/fileUtils';
import { FILE_TYPE_CONFIGS } from './constants';
import {
  setSelectedFile,
  setShowUploadOverlay,
  setUploadFileName,
} from './store/recResourceFileTransferStore';
import { FileType, GalleryFile } from './types';
import { addErrorNotification } from '@/store/notificationStore';
import { buildFileTooLargeMessage, isFileTooLarge } from './validation';

/**
 * Formats the date string for display.
 */
export function formatGalleryFileDate(date: string): string {
  return new Date(date).toLocaleString('en-CA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Creates a temporary GalleryFile object from a File for upload purposes.
 */
export function createTempGalleryFile(file: File, type: FileType): GalleryFile {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const now = new Date();

  return {
    id: `temp-${now.getTime()}-${crypto.randomUUID()}`,
    name: file.name,
    date: formatGalleryFileDate(now.toISOString()),
    url: URL.createObjectURL(file),
    extension,
    pendingFile: file,
    type,
  };
}

/**
 * Get the accepted MIME types for a specific file type.
 *
 * @param fileType - The file type to get MIME types for
 * @returns The accepted MIME types string
 */
export function getAcceptedMimeTypes(fileType: FileType): string {
  return FILE_TYPE_CONFIGS[fileType].accept;
}

/**
 * Get the maximum number of files allowed for a specific file type.
 *
 * @param fileType - The file type to get the limit for
 * @returns The maximum number of files allowed
 */
export function getMaxFilesByFileType(fileType: FileType): number {
  return FILE_TYPE_CONFIGS[fileType].maxFiles;
}

/**
 * Handles the click event for adding a file (both PDF and image files).
 *
 * Creates a file input element, prompts the user to select a file,
 * and stores the selected file in the application state.
 *
 * @param accept - MIME type string to restrict file selection (e.g., "application/pdf").
 * @param type - The type of file being uploaded ("document" or "image").
 */
export function handleAddFileClick(accept: string, type: FileType): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.style.display = 'none';

  const cleanup = () => {
    document.body.removeChild(input);
  };

  input.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    try {
      const file = target.files?.[0];
      if (file) {
        // Validate file size
        if (isFileTooLarge(file)) {
          addErrorNotification(buildFileTooLargeMessage(file.name));
          return;
        }
        const galleryFile = createTempGalleryFile(file, type);
        setSelectedFile(galleryFile);
        setShowUploadOverlay(true);
        setUploadFileName(getFileNameWithoutExtension(file));
      }
    } finally {
      cleanup();
    }
  };

  // Cleanup if user cancels file selection
  input.oncancel = cleanup;

  document.body.appendChild(input);
  input.click();
}

/**
 * Generic file picker handler that uses predefined file type configurations.
 *
 * @param fileType - The file type configuration to use.
 */
export function handleAddFileByType(fileType: FileType): void {
  const acceptTypes = getAcceptedMimeTypes(fileType);
  handleAddFileClick(acceptTypes, fileType);
}
