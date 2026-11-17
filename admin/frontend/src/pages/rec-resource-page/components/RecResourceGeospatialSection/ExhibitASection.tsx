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
import { useDeleteExhibitADoc } from '@/services/hooks/recreation-resource-admin/useExhibitADocsHooks';
import { useFileDownload } from '@/pages/rec-resource-page/hooks/useFileDownload';
import { DeleteFileModal } from '@/components/delete-confirmation-modal/DeleteFileModal';
import { DocumentUploadModal } from '@/components/file/DocumentUploadModal';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { ExhibitADocDto } from '@/services/recreation-resource-admin';
import { formatDateTimeReadable } from '@shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import { useExhibitAFileUpload } from '../hooks/useExhibitAFileUpload';
import { useExhibitAUploadModal } from '../hooks/useExhibitAUploadModal';
import './ExhibitASection.scss';

interface ExhibitASectionProps {
  recResourceId: string;
  applicationGuid?: string;
}

interface PendingUpload {
  id: string;
  name: string;
  isUploading: boolean;
  uploadFailed: boolean;
}

const MAX_EXHIBIT_A_FILES = 50;
const ACCEPTED_FILE_TYPES = 'application/pdf';

const toOptionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined;

export const ExhibitASection = ({
  recResourceId,
  applicationGuid,
}: ExhibitASectionProps) => {
  const { isSuperAdmin } = useAuthorizations();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: exhibitADocs = [], isFetching } =
    useGetExhibitADocs(recResourceId);

  const deleteMutation = useDeleteExhibitADoc();
  const downloadMutation = useFileDownload();
  const { upload, isPending: isUploadPending } =
    useExhibitAFileUpload(recResourceId);
  const uploadModal = useExhibitAUploadModal();
  const { selectFile, hide: hideUploadModal } = uploadModal;

  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [docToDelete, setDocToDelete] = useState<ExhibitADocDto | null>(null);

  const isMaxReached =
    exhibitADocs.length + pendingUploads.length >= MAX_EXHIBIT_A_FILES;
  const resolvedApplicationGuid =
    toOptionalString(applicationGuid) ??
    toOptionalString(
      exhibitADocs.find((doc) => typeof doc.application_guid === 'string')
        ?.application_guid,
    );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) selectFile(file);
      e.target.value = '';
    },
    [selectFile],
  );

  const handleUploadConfirm = useCallback(async () => {
    const { file, fileName } = uploadModal.state;
    if (!file?.pendingFile || !fileName) return;
    if (!resolvedApplicationGuid) {
      addErrorNotification(
        'Cannot upload Exhibit A without an application GUID.',
      );
      return;
    }

    const pendingId = file.id;
    hideUploadModal();

    setPendingUploads((prev) => [
      { id: pendingId, name: fileName, isUploading: true, uploadFailed: false },
      ...prev,
    ]);

    try {
      await upload({
        file: file.pendingFile,
        fileName,
        extension: file.extension,
        applicationGuid: resolvedApplicationGuid,
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
    hideUploadModal,
    queryClient,
    recResourceId,
    resolvedApplicationGuid,
    upload,
    uploadModal.state,
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

  const deleteGalleryFile: GalleryFile | null = docToDelete
    ? {
        id: docToDelete.document_id,
        name: docToDelete.file_name,
        url: docToDelete.url,
        extension: docToDelete.extension,
        date: docToDelete.created_at ? String(docToDelete.created_at) : '',
        type: 'document',
      }
    : null;

  return (
    <div className="exhibit-a-section">
      <div className="exhibit-a-section__header">
        <h2 className="exhibit-a-section__title">Exhibit A</h2>
        {isSuperAdmin && !isMaxReached && (
          <>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadPending}
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
                              date: doc.created_at
                                ? String(doc.created_at)
                                : '',
                              type: 'document',
                            },
                          })
                        }
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </Button>
                      {isSuperAdmin && (
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

      <DocumentUploadModal
        show={uploadModal.state.show}
        file={uploadModal.state.file}
        fileName={uploadModal.state.fileName}
        showAlert={false}
        fileNameError={uploadModal.state.fileNameError}
        onFileNameChange={uploadModal.setFileName}
        onCancel={hideUploadModal}
        onConfirm={handleUploadConfirm}
        title="Upload Exhibit A document"
      />

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
