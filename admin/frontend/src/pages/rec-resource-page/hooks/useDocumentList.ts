import { useGetDocumentsByRecResourceId } from '@/services/hooks/recreation-resource-admin/useGetDocumentsByRecResourceId';
import { RecreationResourceDocDto } from '@/services/recreation-resource-admin';
import { useMemo } from 'react';
import { formatGalleryFileDate } from '../helpers';
import { GalleryDocument } from '../types';

/**
 * Hook to manage document list state and syncing.
 * Handles fetching documents from server and syncing with pending documents.
 */
export function useDocumentList(rec_resource_id?: string) {
  // fetch documents from server
  const { data: documentsFromServer = [], ...other } =
    useGetDocumentsByRecResourceId(rec_resource_id);

  // Map DTO to GalleryDocument
  const galleryDocumentsFromServer: GalleryDocument[] = useMemo(
    () =>
      documentsFromServer.map((doc: RecreationResourceDocDto) => ({
        id: doc.document_id,
        name: doc.file_name,
        date: formatGalleryFileDate(doc.created_at),
        url: doc.url,
        extension: doc.extension,
        doc_code: doc.doc_code,
        doc_code_description: doc.doc_code_description,
        rec_resource_id: doc.rec_resource_id,
        type: 'document',
      })),
    [documentsFromServer],
  );

  return {
    galleryDocumentsFromServer,
    ...other,
  };
}
