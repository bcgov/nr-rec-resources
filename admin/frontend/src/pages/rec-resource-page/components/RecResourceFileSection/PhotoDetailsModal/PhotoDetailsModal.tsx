import { FormLabel } from '@/components/form/FormLabel';
import { BaseFileModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/BaseFileModal';
import { useConsentDownload } from '@/pages/rec-resource-page/hooks/useConsentDownload';
import { useFileDownload } from '@/pages/rec-resource-page/hooks/useFileDownload';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import {
  hidePhotoDetails,
  recResourceFileTransferStore,
  showImageLightboxForImage,
} from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import { formatFileSize } from '@/utils/imageProcessing';
import { formatDateReadable } from '@shared/utils';
import {
  faDownload,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStore } from '@tanstack/react-store';
import { FC, useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import './PhotoDetailsModal.scss';

export const PhotoDetailsModal: FC = () => {
  const { showPhotoDetailsModal: show, selectedImageForDetails: image } =
    useStore(recResourceFileTransferStore);
  const { rec_resource_id } = useRecResource();
  const consentDownloadMutation = useConsentDownload();
  const downloadMutation = useFileDownload();

  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleConsentDownload = useCallback(() => {
    if (image && rec_resource_id) {
      consentDownloadMutation.mutate({
        recResourceId: rec_resource_id,
        imageId: image.id,
      });
    }
  }, [image, rec_resource_id, consentDownloadMutation]);

  const handleDownload = useCallback(() => {
    if (image) {
      downloadMutation.mutate({ file: image });
    }
  }, [image, downloadMutation]);

  const handleViewFullSize = useCallback(() => {
    if (image) {
      hidePhotoDetails();
      showImageLightboxForImage(image);
    }
  }, [image]);

  // Load image to get dimensions
  useEffect(() => {
    if (!image?.url) {
      setDimensions(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => {
      setDimensions(null);
    };
    img.src = image.url;
  }, [image?.url]);

  if (!image) return null;

  // Build the GalleryFile structure for BaseFileModal
  const galleryFile = {
    ...image,
    type: 'image' as const,
  };

  return (
    <BaseFileModal
      show={show}
      onHide={hidePhotoDetails}
      title="Photo details"
      galleryFile={galleryFile}
      className="photo-details-modal"
      onCancel={hidePhotoDetails}
      onImageClick={handleViewFullSize}
    >
      {/* Action buttons under preview */}
      <div className="base-file-modal__preview-actions">
        <Button
          variant="outline-primary"
          onClick={handleDownload}
          className="base-file-modal__preview-action-btn"
        >
          <FontAwesomeIcon icon={faDownload} className="me-2" />
          Download
        </Button>
        <Button
          variant="outline-primary"
          onClick={handleViewFullSize}
          className="base-file-modal__preview-action-btn"
        >
          <FontAwesomeIcon icon={faUpRightFromSquare} className="me-2" />
          View
        </Button>
      </div>
      <div className="photo-details-modal__content">
        {/* Details Section */}
        <section className="photo-details-modal__section">
          <h5 className="photo-details-modal__section-title">Details</h5>
          <dl className="photo-details-modal__list">
            <div className="photo-details-modal__item">
              <FormLabel public className="mb-0">
                Photo name
              </FormLabel>
              <dd>{image.name}</dd>
            </div>
            <div className="photo-details-modal__item">
              <dt>Date taken</dt>
              <dd>
                {formatDateReadable(image.date_taken, { timeZone: 'UTC' }) ||
                  'Not specified'}
              </dd>
            </div>
            <div className="photo-details-modal__item">
              <dt>File size</dt>
              <dd>
                {image.file_size
                  ? formatFileSize(image.file_size)
                  : 'Not specified'}
              </dd>
            </div>
            <div className="photo-details-modal__item">
              <dt>Dimensions</dt>
              <dd>
                {dimensions
                  ? `${dimensions.width} × ${dimensions.height} px`
                  : 'Loading...'}
              </dd>
            </div>
          </dl>
        </section>

        {/* Privacy & Ownership Section */}
        <section className="photo-details-modal__section">
          <h5 className="photo-details-modal__section-title">
            Privacy and ownership
          </h5>
          <dl className="photo-details-modal__list">
            <div className="photo-details-modal__item">
              <dt>Photographer type</dt>
              <dd>
                {image.photographer_type_description ||
                  image.photographer_type ||
                  'Not specified'}
              </dd>
            </div>
            <div className="photo-details-modal__item">
              <dt>Photographer name</dt>
              <dd>{image.photographer_display_name || 'Not specified'}</dd>
            </div>
            <div className="photo-details-modal__item">
              <dt>Personal identifiable information</dt>
              <dd>
                {image.contains_pii == null
                  ? 'Not specified'
                  : image.contains_pii
                    ? 'Yes'
                    : 'No'}
              </dd>
            </div>
            {image.contains_pii && (
              <div className="photo-details-modal__item">
                <dt>Consent and release</dt>
                <dd>
                  <button
                    type="button"
                    className="photo-details-modal__link-button"
                    onClick={handleConsentDownload}
                  >
                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                    Download form
                  </button>
                </dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    </BaseFileModal>
  );
};
