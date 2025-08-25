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

  // Create validator only when existing file names change
  const validator = useMemo(() => {
    return createFileUploadValidator(existingFileNames);
  }, [existingFileNames]);

  // Calculate validation result only when filename or validator changes
  const validationResult = useMemo(() => {
    // if (!uploadFileName.trim()) return null;
    return validator.safeParse({ fileName: uploadFileName });
  }, [uploadFileName, validator]);

  // Calculate derived values only when validation result changes
  const { fileNameError, hasError } = useMemo(() => {
    const error = validationResult.success
      ? undefined
      : validationResult.error.issues[0]?.message;

    return {
      fileNameError: error,
      hasError: !!error,
    };
  }, [validationResult]);

  // Validation function for imperative use
  const validateFileName = useMemo(() => {
    return (fileName: string) => {
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
