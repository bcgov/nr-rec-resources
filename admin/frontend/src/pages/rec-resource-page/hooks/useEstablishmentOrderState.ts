import {
  useGetEstablishmentOrderDocs,
  useUploadEstablishmentOrderDoc,
  useDeleteEstablishmentOrderDoc,
} from '@/services';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { useCallback, useMemo, useState } from 'react';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import {
  downloadUrlAsFile,
  buildFileNameWithExtension,
  getFileNameWithoutExtension,
} from '@/utils/fileUtils';
import { ACTION_TYPES } from '@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard/constants';
import { formatDateReadable } from '@shared/utils';
import { handleApiError } from '@/services/utils/errorHandler';
import { createFileUploadValidator } from '@/pages/rec-resource-page/validation';

export function useEstablishmentOrderState(recResourceId: string) {
  const {
    data: docs = [],
    isLoading,
    refetch,
  } = useGetEstablishmentOrderDocs(recResourceId);
  const uploadMutation = useUploadEstablishmentOrderDoc();
  const deleteMutation = useDeleteEstablishmentOrderDoc();

  // State for file operations
  const [downloadingDocs, setDownloadingDocs] = useState<Set<string>>(
    new Set(),
  );
  const [deletingDocs, setDeletingDocs] = useState<Set<string>>(new Set());

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GalleryFile | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<GalleryFile | null>(null);

  // File name validation
  const existingFileNames = useMemo(() => docs.map((doc) => doc.title), [docs]);
  const validator = useMemo(
    () => createFileUploadValidator(existingFileNames),
    [existingFileNames],
  );
  const fileNameError = useMemo(() => {
    const result = validator.safeParse({ fileName: uploadFileName });
    return result.success ? undefined : result.error.issues[0]?.message;
  }, [uploadFileName, validator]);

  const galleryFiles: GalleryFile[] = useMemo(
    () =>
      docs.map((doc) => ({
        id: doc.s3_key,
        name: doc.title,
        date: formatDateReadable(doc.created_at) ?? '-',
        url: doc.url,
        extension: doc.extension || 'pdf',
        type: 'document' as const,
        isDownloading: downloadingDocs.has(doc.s3_key),
        isDeleting: deletingDocs.has(doc.s3_key),
      })),
    [docs, downloadingDocs, deletingDocs],
  );

  const handleUploadClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.style.display = 'none';

    const cleanup = () => {
      document.body.removeChild(input);
    };

    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      try {
        const file = target.files?.[0];
        if (file) {
          // Validate file type
          if (file.type !== 'application/pdf') {
            addErrorNotification(
              'Invalid file type. Only PDF files are allowed.',
            );
            return;
          }

          const extension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
          const now = new Date();
          const tempGalleryFile: GalleryFile = {
            id: `temp-${now.getTime()}-${crypto.randomUUID()}`,
            name: file.name,
            date: formatDateReadable(now.toISOString()) ?? '-',
            url: URL.createObjectURL(file),
            extension,
            pendingFile: file,
            type: 'document',
          };

          setSelectedFile(tempGalleryFile);
          setUploadFileName(getFileNameWithoutExtension(file));
          setShowUploadModal(true);
        }
      } finally {
        cleanup();
      }
    };

    input.oncancel = cleanup;
    document.body.appendChild(input);
    input.click();
  }, []);

  const handleUploadConfirm = useCallback(async () => {
    if (!selectedFile?.pendingFile || !uploadFileName || fileNameError) return;

    setShowUploadModal(false);
    setSelectedFile(null);

    try {
      await uploadMutation.mutateAsync({
        recResourceId,
        file: selectedFile.pendingFile,
        title: uploadFileName,
      });
      addSuccessNotification(
        `Establishment order "${uploadFileName}" uploaded successfully.`,
      );
      refetch();
    } catch (error: unknown) {
      const errorInfo = await handleApiError(error);
      addErrorNotification(
        `${errorInfo.statusCode} - Failed to upload establishment order "${uploadFileName}": ${errorInfo.message}. Please try again.`,
      );
    } finally {
      setUploadFileName('');
    }
  }, [
    selectedFile,
    uploadFileName,
    fileNameError,
    uploadMutation,
    recResourceId,
    refetch,
  ]);

  const handleUploadCancel = useCallback(() => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadFileName('');
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!fileToDelete) return;

    setShowDeleteModal(false);
    setDeletingDocs((prev) => new Set(prev).add(fileToDelete.id));

    try {
      await deleteMutation.mutateAsync({
        recResourceId,
        s3Key: fileToDelete.id,
      });
      addSuccessNotification(
        `Establishment order "${fileToDelete.name}" deleted successfully.`,
      );
      refetch();
    } catch (error: unknown) {
      const errorInfo = await handleApiError(error);
      addErrorNotification(
        `${errorInfo.statusCode} - Failed to delete establishment order "${fileToDelete.name}": ${errorInfo.message}. Please try again.`,
      );
    } finally {
      setDeletingDocs((prev) => {
        const next = new Set(prev);
        next.delete(fileToDelete.id);
        return next;
      });
      setFileToDelete(null);
    }
  }, [fileToDelete, deleteMutation, recResourceId, refetch]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false);
    setFileToDelete(null);
  }, []);

  const handleFileAction = useCallback(
    (action: string, file: GalleryFile) => () => {
      const doc = docs.find((d) => d.s3_key === file.id);
      if (!doc) return;

      if (action === ACTION_TYPES.VIEW) {
        window.open(doc.url, '_blank');
      } else if (action === ACTION_TYPES.DOWNLOAD) {
        setDownloadingDocs((prev) => new Set(prev).add(doc.s3_key));

        const fileName = buildFileNameWithExtension(
          doc.title,
          doc.extension ?? 'pdf',
        );

        addSuccessNotification(`Downloading "${fileName}"...`);
        return downloadUrlAsFile(doc.url, fileName)
          .catch((error) => {
            console.error('Download failed:', error);
            addErrorNotification(
              `Failed to download "${fileName}". Please try again.`,
            );
          })
          .finally(() => {
            setDownloadingDocs((prev) => {
              const next = new Set(prev);
              next.delete(doc.s3_key);
              return next;
            });
          });
      } else if (action === ACTION_TYPES.DELETE) {
        setFileToDelete(file);
        setShowDeleteModal(true);
      }
    },
    [docs],
  );

  return {
    galleryFiles,
    isLoading,
    uploadModalState: {
      show: showUploadModal,
      file: selectedFile,
      fileName: uploadFileName,
      fileNameError,
    },
    deleteModalState: {
      show: showDeleteModal,
      file: fileToDelete,
    },
    handleUploadClick,
    handleUploadConfirm,
    handleUploadCancel,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleFileAction,
    setUploadFileName,
  };
}
