import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImages } from '@fortawesome/free-solid-svg-icons';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import '@/styles/components/PhotoGallery.scss';

import Photo from './Photo';

interface Photo {
  caption?: string;
  imageUrl: string;
}

interface ShowPhotosProps {
  text: string | number;
  setShowPhotos: React.Dispatch<React.SetStateAction<boolean>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ShowPhotosBtn: React.FC<ShowPhotosProps> = ({
  text,
  setShowPhotos,
  setOpen,
}) => {
  return (
    <button
      aria-label="Show photos"
      className="btn show-photo-button"
      onClick={() => {
        setShowPhotos(true);
        setOpen(true);
      }}
    >
      <FontAwesomeIcon icon={faImages} className="photo-icon" />
      {text}
    </button>
  );
};

interface PhotoGalleryProps {
  photos: Photo[];
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos }) => {
  const [showPhoto, setShowPhoto] = useState(false);
  const [open, setOpen] = useState(false);

  const photoSlides = photos.map((photo) => ({
    src: photo.imageUrl,
    description: (
      <div dangerouslySetInnerHTML={{ __html: photo.caption || '' }} />
    ),
  }));

  const parkPhotos = photos.map((photo, index) => ({
    index,
    caption: photo?.caption || '',
    altText: (photo?.caption || '').replace(/(<([^>]+)>)/gi, ''),
    imageUrl: photo.imageUrl,
  }));

  const isGalleryMed =
    parkPhotos.length === 2 ||
    parkPhotos.length === 3 ||
    parkPhotos.length === 4;

  return (
    <>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={photoSlides}
        carousel={{ finite: false }}
        captions={{ descriptionTextAlign: 'center', descriptionMaxLines: 5 }}
        thumbnails={{ border: 0 }}
        plugins={[Captions, Thumbnails, Zoom, Slideshow, Fullscreen]}
      />
      {/* Photo gallery for Desktop */}
      <div className="park-photo-gallery d-none d-md-block">
        {parkPhotos.length > 0 && (
          <div
            id="park-photo-gallery-container"
            role="button"
            tabIndex={0}
            className="gallery-container"
            onClick={() => {
              if (!showPhoto) {
                setShowPhoto(true);
              }
            }}
            onKeyDown={(e) => {
              if (!showPhoto && (e.key === 'Enter' || e.key === ' ')) {
                setShowPhoto(true);
              }
            }}
          >
            {parkPhotos.length === 1 && (
              <div className="photo-row" onClick={() => setOpen(true)}>
                <div className="photo-col">
                  <Photo
                    type="big"
                    src={parkPhotos[0].imageUrl}
                    alt={parkPhotos[0].altText}
                  />
                  <div className="show-photos">
                    <ShowPhotosBtn
                      text="Show photo"
                      setShowPhotos={setShowPhoto}
                      setOpen={setOpen}
                    />
                  </div>
                </div>
              </div>
            )}

            {isGalleryMed && (
              <div className="photo-row" onClick={() => setOpen(true)}>
                <div className="photo-col">
                  <Photo
                    type="big"
                    src={parkPhotos[0].imageUrl}
                    alt={parkPhotos[0].altText}
                  />
                </div>
                <div className="photo-col">
                  <Photo
                    type="big"
                    src={parkPhotos[1].imageUrl}
                    alt={parkPhotos[1].altText}
                  />
                  <div className="show-photos">
                    <ShowPhotosBtn
                      text="Show photos"
                      setShowPhotos={setShowPhoto}
                      setOpen={setOpen}
                    />
                  </div>
                </div>
              </div>
            )}

            {parkPhotos.length > 4 && (
              <div className="photo-row" onClick={() => setOpen(true)}>
                <div className="photo-col">
                  {parkPhotos
                    .filter((f) => f.index === 0)
                    .map((photo, index) => (
                      <Photo
                        type="big"
                        src={photo.imageUrl}
                        alt={photo.altText}
                        key={index}
                      />
                    ))}
                </div>
                <div className="photo-col">
                  <div className="photo-grid">
                    {parkPhotos
                      .filter((photo) => photo.index > 0 && photo.index <= 4)
                      .map((photo, index) => (
                        <Photo
                          type="small"
                          src={photo.imageUrl}
                          alt={photo.altText}
                          key={index}
                        />
                      ))}
                  </div>
                  <div className="show-photos">
                    <ShowPhotosBtn
                      text="Show photos"
                      setShowPhotos={setShowPhoto}
                      setOpen={setOpen}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile photo gallery */}
      <div className="park-photo-gallery d-block d-md-none">
        {parkPhotos.length > 0 && (
          <div
            id="park-photo-gallery-container-mobile"
            role="button"
            tabIndex={0}
            className="gallery-container"
            onClick={() => {
              if (!showPhoto) {
                setShowPhoto(true);
              }
            }}
            onKeyDown={(e) => {
              if (!showPhoto && (e.key === 'Enter' || e.key === ' ')) {
                setShowPhoto(true);
              }
            }}
          >
            <div className="photo-row" onClick={() => setOpen(true)}>
              <div className="photo-col">
                <Photo
                  type="big"
                  src={parkPhotos[0].imageUrl}
                  alt={parkPhotos[0].altText}
                />
                <div className="show-photos">
                  <ShowPhotosBtn
                    text={parkPhotos.length}
                    setOpen={setOpen}
                    setShowPhotos={setShowPhoto}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PhotoGallery;
