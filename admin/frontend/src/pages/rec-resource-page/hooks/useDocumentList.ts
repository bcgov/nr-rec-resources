import { useGetDocumentsByRecResourceId } from "@/services/hooks/recreation-resource-admin/useGetDocumentsByRecResourceId";
import { RecreationResourceDocDto } from "@/services/recreation-resource-admin";
import { useMemo } from "react";
import { formatDocumentDate } from "../helpers";
import { GalleryDocument } from "../types";

/**
 * Hook to fetch documents for a resource and determine if upload is allowed.
 * Returns the documents, upload-disabled status, and loading state.
 */
export function useDocumentList(rec_resource_id?: string) {
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

  return { documents, isFetching, refetch };
}
