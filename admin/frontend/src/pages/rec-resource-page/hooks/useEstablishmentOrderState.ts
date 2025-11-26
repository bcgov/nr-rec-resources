import {
  useDeleteEstablishmentOrderDoc,
  useGetEstablishmentOrderDocs,
  useUploadEstablishmentOrderDoc,
} from '@/services';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { useCallback, useMemo, useState } from 'react';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import {
  buildFileNameWithExtension,
  downloadUrlAsFile,
  getFileNameWithoutExtension,
  formatDateReadable,
  buildFileTooLargeMessage,
  isFileTooLarge,
  megabytesToBytes,
} from '@shared/utils';
import { ACTION_TYPES } from '@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard/constants';
import { handleApiError } from '@/services/utils/errorHandler';
import { createFileUploadValidator } from '@/pages/rec-resource-page/validation';

const MAX_FILE_SIZE_MB = 9.5;
const MAX_FILE_SIZE_BYTES = megabytesToBytes(MAX_FILE_SIZE_MB);

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
  const [pendingDocs, setPendingDocs] = useState<GalleryFile[]>([]);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GalleryFile | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<GalleryFile | null>(null);

  const addPendingDoc = useCallback((doc: GalleryFile) => {
    setPendingDocs((prev) => [...prev, doc]);
  }, []);

  const removePendingDoc = useCallback((id: string) => {
    setPendingDocs((prev) => prev.filter((doc) => doc.id !== id));
  }, []);

  const updatePendingDoc = useCallback(
    (id: string, updates: Partial<GalleryFile>) => {
      setPendingDocs((prev) => {
        const idx = prev.findIndex((d) => d.id === id);
        if (idx === -1) return prev;
        const updatedDocs = [...prev];
        updatedDocs[idx] = { ...updatedDocs[idx], ...updates };
        return updatedDocs;
      });
    },
    [],
  );

  const existingFileNames = useMemo(() => docs.map((doc) => doc.title), [docs]);
  const validator = useMemo(
    () => createFileUploadValidator(existingFileNames),
    [existingFileNames],
  );
  const fileNameError = useMemo(() => {
    const result = validator.safeParse({ fileName: uploadFileName });
    return result.success ? undefined : result.error.issues[0]?.message;
  }, [uploadFileName, validator]);

  const galleryFiles: GalleryFile[] = useMemo(() => {
    const serverDocs = docs.map((doc) => ({
      id: doc.s3_key,
      name: doc.title,
      date: formatDateReadable(doc.created_at) ?? '-',
      url: doc.url,
      extension: doc.extension || 'pdf',
      type: 'document' as const,
      isDownloading: downloadingDocs.has(doc.s3_key),
      isDeleting: deletingDocs.has(doc.s3_key),
    }));
    return [...serverDocs, ...pendingDocs];
  }, [docs, downloadingDocs, deletingDocs, pendingDocs]);

  const isUploadDisabled = useMemo(() => {
    return galleryFiles.some((file) => file.isUploading);
  }, [galleryFiles]);

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

          // Validate file size
          if (isFileTooLarge(file, MAX_FILE_SIZE_BYTES)) {
            addErrorNotification(
              buildFileTooLargeMessage(file.name, MAX_FILE_SIZE_MB),
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

    const pendingFile = selectedFile.pendingFile;
    const tempId = selectedFile.id;
    const fileName = uploadFileName;

    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadFileName('');

    // Create temporary pending doc with isUploading state
    const tempDoc: GalleryFile = {
      ...selectedFile,
      name: fileName,
      isUploading: true,
      pendingFile,
      type: 'document',
    };
    addPendingDoc(tempDoc);

    try {
      await uploadMutation.mutateAsync({
        recResourceId,
        file: pendingFile,
        title: fileName,
      });
      addSuccessNotification(
        `Establishment order "${fileName}" uploaded successfully.`,
      );
      removePendingDoc(tempId);
      refetch();
    } catch (error: unknown) {
      const errorInfo = await handleApiError(error);
      addErrorNotification(
        `${errorInfo.statusCode} - Failed to upload establishment order "${fileName}": ${errorInfo.message}. Please try again.`,
      );
      updatePendingDoc(tempId, {
        isUploading: false,
        uploadFailed: true,
      });
    }
  }, [
    selectedFile,
    uploadFileName,
    fileNameError,
    uploadMutation,
    recResourceId,
    refetch,
    addPendingDoc,
    removePendingDoc,
    updatePendingDoc,
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
    isUploadDisabled,
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
