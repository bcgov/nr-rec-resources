import { useStore } from "@tanstack/react-store";
import { recResourceDetailStore } from "../store/recResourceDetailStore";
import { useDeleteModalState } from "./useDeleteModalState";
import { useDocumentListState } from "./useDocumentListState";
import { useGalleryActions } from "./useGalleryActions";

/**
 * Custom React hook to manage file transfer state for recreation resource pages.
 * Provides gallery actions, document list state, and file picker functionality.
 * @returns Object containing essential state and handlers for file operations.
 */
export function useRecResourceFileTransferState() {
  const { recResource } = useStore(recResourceDetailStore);

  // Document list state and syncing
  const { galleryDocuments, isDocumentUploadDisabled, isFetching, refetch } =
    useDocumentListState(recResource?.rec_resource_id);

  // Gallery actions (includes upload modal state)
  const { getActionHandler, uploadModalState } = useGalleryActions();

  // Delete modal state
  const { showDeleteModal, docToDelete, setShowDeleteModal, setDocToDelete } =
    useDeleteModalState();

  // Return only the essential exports
  return {
    // Gallery actions and upload modal
    getActionHandler,
    uploadModalState,

    // Document list
    galleryDocuments,
    isDocumentUploadDisabled,
    isFetching,
    refetch,

    // Delete modal
    showDeleteModal,
    docToDelete,
    setShowDeleteModal,
    setDocToDelete,
  };
}
