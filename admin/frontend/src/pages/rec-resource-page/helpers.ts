import { addErrorNotification } from '@/store/notificationStore';
import {
  getFileNameWithoutExtension,
  validateFileMimeType,
  validateFileSize,
} from '@shared/utils';
import { FILE_TYPE_CONFIGS, MAX_FILE_SIZE_MB } from './constants';
import {
  setSelectedFile,
  setShowUploadOverlay,
  setUploadFileName,
} from './store/recResourceFileTransferStore';
import { FileType, GalleryFile } from './types';
import heic2any from 'heic2any';

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

async function heicToResizedWebp(file: File): Promise<File> {
  const decoded = await heic2any({
    blob: file,
    toType: 'image/webp',
  });

  const blob = Array.isArray(decoded) ? decoded[0] : decoded;

  const img = await createImageBitmap(blob);

  const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);

  const webpBlob = await canvas.convertToBlob({
    type: 'image/webp',
    quality: 0.7,
  });

  const newName = file.name.replace(/\.heic$/i, '.webp');
  return new File([webpBlob], newName, { type: 'image/webp' });
}

/**
 * Creates a temporary GalleryFile object from a File for upload purposes.
 */
export function createTempGalleryFile(
  file: File,
  type: FileType,
): Promise<GalleryFile> {
  let extension = file.name.split('.').pop()?.toLowerCase() || '';
  const now = new Date();

  const filePromise =
    extension === 'heic'
      ? heicToResizedWebp(file).then((f) => {
          extension = 'webp';
          return f;
        })
      : Promise.resolve(file);

  return filePromise.then((tempFile) => ({
    id: `temp-${now.getTime()}-${crypto.randomUUID()}`,
    name: tempFile.name,
    date: formatGalleryFileDate(now.toISOString()),
    url: URL.createObjectURL(tempFile),
    extension,
    pendingFile: tempFile,
    type,
  }));
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

  input.onchange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    try {
      const file = target.files?.[0];
      if (file) {
        // Validate file immediately after selection
        const fileError = validateFile(file, type);
        if (fileError) {
          // Show error in notification and prevent modal from opening
          addErrorNotification(fileError);
          return;
        }
        // File is valid, proceed to open modal
        const galleryFile = await createTempGalleryFile(file, type);
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

/**
 * Validates file object (size and format) separately
 * Returns error message if invalid, null if valid
 */
export function validateFile(
  file: File | null | undefined,
  fileType: FileType,
): string | null {
  if (!file) {
    return 'File is required';
  }

  // Validate file format
  const allowedTypes = FILE_TYPE_CONFIGS[fileType].accept;
  if (!validateFileMimeType(file, allowedTypes)) {
    return `Invalid file format. Only ${allowedTypes} files are allowed.`;
  }

  // Validate file size using shared utility
  const maxSizeMB = MAX_FILE_SIZE_MB[fileType];
  const sizeError = validateFileSize(file, maxSizeMB);
  if (sizeError) {
    return sizeError;
  }

  return null;
}
