import { useMemo } from "react";
import { useGetDocumentsByRecResourceId } from "@/services/hooks/recreation-resource-admin/useGetDocumentsByRecResourceId";
import { MAX_DOCUMENTS_PER_REC_RESOURCE } from "../constants";
import { GalleryDocument } from "../types";
import { RecreationResourceDocDto } from "@/services/recreation-resource-admin";
import { formatDocumentDate } from "../helpers";

/**
 * Hook to fetch documents for a resource and determine if upload is allowed.
 * Returns the documents, upload-disabled status, and loading state.
 */
export function useDocumentList(rec_resource_id: string) {
  const {
    data: documentsFromServer = [],
    isFetching,
    refetch,
  } = useGetDocumentsByRecResourceId(rec_resource_id);

  // Map DTO to GalleryDocument
  const documents: GalleryDocument[] = useMemo(
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

  const isDocumentUploadDisabled =
    documents.length >= MAX_DOCUMENTS_PER_REC_RESOURCE;
  return { documents, isDocumentUploadDisabled, isFetching, refetch };
}
