import { useStore } from '@tanstack/react-store';
import { useMemo } from 'react';
import { recResourceFileTransferStore } from '../store/recResourceFileTransferStore';
import { createFileUploadValidator } from '../validation';

/**
 * Custom hook for managing file name validation logic.
 * Provides optimized validation and error handling for file uploads.
 */
export function useFileNameValidation() {
  const {
    galleryDocuments,
    galleryImages,
    selectedFileForUpload,
    uploadFileName,
  } = useStore(recResourceFileTransferStore);

  // Memoize the list of existing file names based on file type
  const existingFileNames = useMemo(() => {
    if (!selectedFileForUpload) return [];

    return selectedFileForUpload.type === 'image'
      ? galleryImages.map((img) => img.name)
      : galleryDocuments.map((doc) => doc.name);
  }, [selectedFileForUpload?.type, galleryImages, galleryDocuments]);

  // Get file type from selected file
  const fileType = selectedFileForUpload?.type;

  // Create validator only when existing file names or file type changes
  const validator = useMemo(() => {
    if (!fileType) return null;
    return createFileUploadValidator(existingFileNames, fileType);
  }, [existingFileNames, fileType]);

  // Calculate file name validation result only when filename or validator changes
  const fileNameValidationResult = useMemo(() => {
    if (!validator || uploadFileName === undefined || uploadFileName === null) {
      return null;
    }
    return validator.safeParse({ fileName: uploadFileName });
  }, [uploadFileName, validator]);

  // Calculate derived values only when validation result changes
  const { fileNameError, hasError } = useMemo(() => {
    const nameError =
      fileNameValidationResult && !fileNameValidationResult.success
        ? fileNameValidationResult.error.issues[0]?.message
        : undefined;

    return {
      fileNameError: nameError,
      hasError: !!nameError,
    };
  }, [fileNameValidationResult]);

  // Validation function for imperative use
  const validateFileName = useMemo(() => {
    return (fileName: string) => {
      if (!validator) return { success: false as const, error: { issues: [] } };
      return validator.safeParse({ fileName });
    };
  }, [validator]);

  return {
    fileNameError,
    validateFileName,
    hasError,
    isValid: !!selectedFileForUpload && !hasError && !!uploadFileName.trim(),
  };
}
