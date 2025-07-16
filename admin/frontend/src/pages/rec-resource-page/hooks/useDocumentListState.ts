import { useGetDocumentsByRecResourceId } from "@/services/hooks/recreation-resource-admin/useGetDocumentsByRecResourceId";
import { RecreationResourceDocDto } from "@/services/recreation-resource-admin";
import { useStore } from "@tanstack/react-store";
import { useEffect, useMemo } from "react";
import { MAX_DOCUMENTS_PER_REC_RESOURCE } from "../constants";
import { formatDocumentDate } from "../helpers";
import {
  recResourceFileTransferStore,
  setGalleryDocuments,
} from "../store/recResourceFileTransferStore";
import { GalleryDocument } from "../types";

/**
 * Hook to manage document list state and syncing.
 * Handles fetching documents from server and syncing with pending documents.
 */
export function useDocumentListState(rec_resource_id?: string) {
  const { pendingDocs, galleryDocuments } = useStore(
    recResourceFileTransferStore,
  );

  // fetch documents from server
  const { data: documentsFromServer = [], ...other } =
    useGetDocumentsByRecResourceId(rec_resource_id);

  // Map DTO to GalleryDocument
  const galleryDocumentsFromServer: GalleryDocument[] = useMemo(
    () =>
      documentsFromServer.map((doc: RecreationResourceDocDto) => ({
        id: doc.ref_id,
        name: doc.title,
        date: formatDocumentDate(doc.created_at),
        url: doc.url,
        extension: doc.extension,
        doc_code: doc.doc_code,
        doc_code_description: doc.doc_code_description,
        rec_resource_id: doc.rec_resource_id,
      })),
    [documentsFromServer],
  );

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
    ...other,
  };
}
