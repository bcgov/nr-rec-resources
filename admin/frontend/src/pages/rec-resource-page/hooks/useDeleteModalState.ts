import { useStore } from "@tanstack/react-store";
import { useCallback } from "react";
import {
  recResourceFileTransferStore,
  setDocToDelete,
  setShowDeleteModal,
} from "../store/recResourceFileTransferStore";
import { GalleryFile } from "../types";

/**
 * Hook to manage delete modal state.
 * Handles showing/hiding the delete confirmation modal and tracking which document to delete.
 */
export function useDeleteModalState() {
  const { showDeleteModal, docToDelete } = useStore(
    recResourceFileTransferStore,
  );

  const showDeleteModalForDoc = useCallback((doc: GalleryFile) => {
    setDocToDelete(doc);
    setShowDeleteModal(true);
  }, []);

  const hideDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setDocToDelete(undefined);
  }, []);

  return {
    showDeleteModal,
    docToDelete,
    showDeleteModalForDoc,
    hideDeleteModal,
    setShowDeleteModal,
    setDocToDelete,
  };
}
