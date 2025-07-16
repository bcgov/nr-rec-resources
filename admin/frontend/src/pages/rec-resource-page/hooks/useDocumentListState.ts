import { useStore } from "@tanstack/react-store";
import { useEffect, useMemo } from "react";
import { MAX_DOCUMENTS_PER_REC_RESOURCE } from "../constants";
import {
  recResourceFileTransferStore,
  setGalleryDocuments,
} from "../store/recResourceFileTransferStore";
import { useDocumentList } from "./useDocumentList";

/**
 * Hook to manage document list state and syncing.
 * Handles fetching documents from server and syncing with pending documents.
 */
export function useDocumentListState(rec_resource_id?: string) {
  const { pendingDocs, galleryDocuments } = useStore(
    recResourceFileTransferStore,
  );

  // fetch documents
  const {
    documents: galleryDocumentsFromServer,
    isFetching,
    refetch,
  } = useDocumentList(rec_resource_id);

  // Calculate upload disabled state based on total documents (server + pending)
  const isDocumentUploadDisabled = useMemo(() => {
    const totalDocCount =
      (galleryDocumentsFromServer?.length || 0) + pendingDocs.length;
    return totalDocCount >= MAX_DOCUMENTS_PER_REC_RESOURCE;
  }, [galleryDocumentsFromServer, pendingDocs]);

  // Sync galleryDocumentsFromServer to store
  useEffect(() => {
    setGalleryDocuments([...pendingDocs, ...galleryDocumentsFromServer]);
  }, [pendingDocs, galleryDocumentsFromServer]);

  return {
    pendingDocs,
    galleryDocuments,
    isDocumentUploadDisabled,
    isFetching,
    refetch,
  };
}
