import { useCallback, useRef, useState } from 'react';
import { Button, Col, Row, Spinner } from 'react-bootstrap';
import {
  faFilePdf,
  faTrash,
  faDownload,
  faEye,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuthorizations } from '@/hooks/useAuthorizations';
import { useGetExhibitADocs } from '@/services/hooks/recreation-resource-admin/useGetExhibitADocs';
import {
  usePresignExhibitAUpload,
  useFinalizeExhibitAUpload,
  useDeleteExhibitADoc,
} from '@/services/hooks/recreation-resource-admin/useExhibitADocsHooks';
import { useFileDownload } from '@/pages/rec-resource-page/hooks/useFileDownload';
import { DeleteFileModal } from '@/components/delete-confirmation-modal/DeleteFileModal';
import { DocumentUploadModal } from '@/components/file/DocumentUploadModal';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { RecreationResourceDocDto } from '@/services/recreation-resource-admin';
import { formatDateTimeReadable } from '@shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import './ExhibitASection.scss';

interface ExhibitASectionProps {
  recResourceId: string;
}

interface PendingUpload {
  id: string;
  name: string;
  isUploading: boolean;
  uploadFailed: boolean;
}

const MAX_EXHIBIT_A_FILES = 50;
const ACCEPTED_FILE_TYPES = 'application/pdf';

export const ExhibitASection = ({ recResourceId }: ExhibitASectionProps) => {
  const { canSuperAdmin } = useAuthorizations();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: exhibitADocs = [], isFetching } =
    useGetExhibitADocs(recResourceId);

  const deleteMutation = useDeleteExhibitADoc();
  const presignMutation = usePresignExhibitAUpload();
  const finalizeMutation = useFinalizeExhibitAUpload();
  const downloadMutation = useFileDownload();

  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [docToDelete, setDocToDelete] =
    useState<RecreationResourceDocDto | null>(null);

  // Upload modal state
  const [uploadModalState, setUploadModalState] = useState<{
    show: boolean;
    file: GalleryFile | null;
    fileName: string;
    fileNameError: string;
  }>({ show: false, file: null, fileName: '', fileNameError: '' });

  const isMaxReached =
    exhibitADocs.length + pendingUploads.length >= MAX_EXHIBIT_A_FILES;

  const handleFileSelected = useCallback((file: File) => {
    const tempId = crypto.randomUUID();
    const extension = file.name.split('.').pop() || 'pdf';
    const galleryFile: GalleryFile = {
      id: tempId,
      name: file.name.replace(/\.[^/.]+$/, ''),
      date: '',
      url: '',
      extension,
      type: 'document',
      pendingFile: file,
    };

    setUploadModalState({
      show: true,
      file: galleryFile,
      fileName: galleryFile.name,
      fileNameError: '',
    });
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelected(file);
      e.target.value = '';
    },
    [handleFileSelected],
  );

  const handleUploadConfirm = useCallback(async () => {
    const { file, fileName } = uploadModalState;
    if (!file?.pendingFile || !fileName) return;

    const pendingId = file.id;
    setUploadModalState((prev) => ({ ...prev, show: false }));

    setPendingUploads((prev) => [
      { id: pendingId, name: fileName, isUploading: true, uploadFailed: false },
      ...prev,
    ]);

    try {
      const rawName = `${fileName}.${file.extension}`;

      // Step 1: Get presigned URL
      const presigned = await presignMutation.mutateAsync({
        recResourceId,
        fileName: rawName,
      });

      // Step 2: Upload to S3
      const s3Response = await fetch(presigned.url, {
        method: 'PUT',
        body: file.pendingFile,
        headers: { 'Content-Type': 'application/pdf' },
      });
      if (!s3Response.ok) {
        throw new Error(
          `S3 upload failed: ${s3Response.status} ${s3Response.statusText}`,
        );
      }

      // Step 3: Finalize
      await finalizeMutation.mutateAsync({
        recResourceId,
        document_id: presigned.document_id,
        file_name: fileName,
        extension: file.extension,
        file_size: file.pendingFile.size,
      });

      setPendingUploads((prev) => prev.filter((p) => p.id !== pendingId));
      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.exhibitADocs(recResourceId),
      });
      addSuccessNotification(`File "${fileName}" uploaded successfully.`);
    } catch (error) {
      console.error('Exhibit A upload failed:', error);
      setPendingUploads((prev) =>
        prev.map((p) =>
          p.id === pendingId
            ? { ...p, isUploading: false, uploadFailed: true }
            : p,
        ),
      );
      addErrorNotification(`Failed to upload "${fileName}". Please try again.`);
    }
  }, [
    uploadModalState,
    recResourceId,
    presignMutation,
    finalizeMutation,
    queryClient,
  ]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!docToDelete) return;
    const name = docToDelete.file_name;
    setDocToDelete(null);
    try {
      await deleteMutation.mutateAsync({
        recResourceId,
        documentId: docToDelete.document_id,
      });
      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.exhibitADocs(recResourceId),
      });
      addSuccessNotification(`Document "${name}" deleted.`);
    } catch {
      addErrorNotification('Failed to delete document. Please try again.');
    }
  }, [docToDelete, recResourceId, deleteMutation, queryClient]);

  // Build a GalleryFile for the DeleteFileModal
  const deleteGalleryFile: GalleryFile | null = docToDelete
    ? {
        id: docToDelete.document_id,
        name: docToDelete.file_name,
        url: docToDelete.url,
        extension: docToDelete.extension,
        date: docToDelete.created_at || '',
        type: 'document',
      }
    : null;

  return (
    <div className="exhibit-a-section">
      <div className="exhibit-a-section__header">
        <h2 className="exhibit-a-section__title">Exhibit A</h2>
        {canSuperAdmin && !isMaxReached && (
          <>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={presignMutation.isPending || finalizeMutation.isPending}
            >
              <FontAwesomeIcon icon={faUpload} className="me-2" />
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              className="d-none"
              onChange={handleFileInputChange}
              aria-label="Upload Exhibit A document"
            />
          </>
        )}
      </div>

      {isFetching ? (
        <div className="d-flex justify-content-center p-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Row className="g-3 exhibit-a-section__grid">
          {/* Pending uploads */}
          {pendingUploads.map((pending) => (
            <Col key={pending.id} xs={12} md={4}>
              <div className="exhibit-a-card exhibit-a-card--pending">
                <div className="exhibit-a-card__preview">
                  {pending.uploadFailed ? (
                    <span className="text-danger small">Upload failed</span>
                  ) : (
                    <Spinner animation="border" size="sm" />
                  )}
                </div>
                <div className="exhibit-a-card__body">
                  <span className="exhibit-a-card__name fw-bold">
                    {pending.name}
                  </span>
                </div>
              </div>
            </Col>
          ))}

          {/* Server documents */}
          {exhibitADocs.map((doc) => (
            <Col key={doc.document_id} xs={12} md={4}>
              <div className="exhibit-a-card">
                <div className="exhibit-a-card__preview">
                  <FontAwesomeIcon
                    icon={faFilePdf}
                    size="2x"
                    className="text-danger"
                  />
                </div>
                <div className="exhibit-a-card__body">
                  <div className="exhibit-a-card__row">
                    <span className="exhibit-a-card__name fw-bold">
                      {doc.file_name}
                    </span>
                    <div className="exhibit-a-card__actions">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-1"
                        title="View"
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-1"
                        title="Download"
                        onClick={() =>
                          downloadMutation.mutate({
                            file: {
                              id: doc.document_id,
                              name: doc.file_name,
                              url: doc.url,
                              extension: doc.extension,
                              date: doc.created_at || '',
                              type: 'document',
                            },
                          })
                        }
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </Button>
                      {canSuperAdmin && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-1 text-danger"
                          title="Delete"
                          onClick={() => setDocToDelete(doc)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="exhibit-a-card__date text-muted">
                    {formatDateTimeReadable(doc.created_at) || '-'}
                  </div>
                </div>
              </div>
            </Col>
          ))}

          {exhibitADocs.length === 0 && pendingUploads.length === 0 && (
            <Col xs={12}>
              <p className="text-muted mb-0">
                No Exhibit A documents uploaded yet.
              </p>
            </Col>
          )}
        </Row>
      )}

      {/* Upload modal */}
      <DocumentUploadModal
        show={uploadModalState.show}
        file={uploadModalState.file}
        fileName={uploadModalState.fileName}
        fileNameError={uploadModalState.fileNameError}
        onFileNameChange={(name) =>
          setUploadModalState((prev) => ({
            ...prev,
            fileName: name,
            fileNameError: '',
          }))
        }
        onCancel={() =>
          setUploadModalState((prev) => ({ ...prev, show: false }))
        }
        onConfirm={handleUploadConfirm}
        title="Upload Exhibit A document"
      />

      {/* Delete modal */}
      <DeleteFileModal
        show={!!docToDelete}
        file={deleteGalleryFile}
        onCancel={() => setDocToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Exhibit A document"
        alertText="Deleting this file will remove it permanently. This action cannot be undone."
      />
    </div>
  );
};
