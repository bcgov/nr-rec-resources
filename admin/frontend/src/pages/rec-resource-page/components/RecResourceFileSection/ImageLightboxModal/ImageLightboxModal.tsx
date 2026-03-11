import { FC } from 'react';
import { findImageVariant } from '@/pages/rec-resource-page/hooks/utils/findImageVariant';
import { GalleryImage } from '@/pages/rec-resource-page/types';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './ImageLightboxModal.scss';

interface ImageLightboxModalProps {
  show: boolean;
  onHide: () => void;
  image: GalleryImage | null;
}

export const ImageLightboxModal: FC<ImageLightboxModalProps> = ({
  show,
  onHide,
  image,
}) => {
  if (!show || !image) return null;

  const screenVariant = findImageVariant(image.variants, 'scr');
  const imageUrl = screenVariant?.url || image.url;

  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onHide();
      }}
    >
      {/* Backdrop - click to close */}
      <div
        className="image-lightbox__backdrop"
        onClick={onHide}
        aria-hidden="true"
      />

      {/* Close button */}
      <button
        type="button"
        className="image-lightbox__close-btn"
        onClick={onHide}
        aria-label="Close image viewer"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>

      {/* Image content */}
      <div className="image-lightbox__content">
        <img
          src={imageUrl}
          alt={image.name || 'Image'}
          className="image-lightbox__image"
        />
      </div>
    </div>
  );
};
