import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import {
  downloadGPX,
  downloadKML,
} from '@/components/rec-resource/RecreationResourceMap/helpers';
import '@/components/rec-resource/RecreationResourceMap/DownloadMapModal.scss';
import { Feature } from '~/ol';
import { Geometry } from '~/ol/geom';
import { RecreationResourceDetailDto } from '@/service/recreation-resource';

interface DownloadMapModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  styledFeatures: Feature<Geometry>[];
  recResource: RecreationResourceDetailDto;
}

const DownloadMapModal = ({
  isOpen,
  setIsOpen,
  styledFeatures,
  recResource,
}: DownloadMapModalProps) => {
  const [isKml, setIsKml] = useState(false);
  const [isGpx, setIsGpx] = useState(false);

  const handleSelect = (type: string) => {
    switch (type) {
      case 'kml':
        if (!isKml) {
          setIsKml(true);
          setIsGpx(false);
        } else {
          setIsKml(false);
        }
        break;
      case 'gpx':
        if (!isGpx) {
          setIsGpx(true);
          setIsKml(false);
        } else {
          setIsGpx(false);
        }
        break;
    }
  };

  const handleDownload = () => {
    if (isGpx) {
      downloadGPX(styledFeatures, recResource?.name || 'map');
    }
    if (isKml) {
      downloadKML(styledFeatures, recResource);
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };
  return (
    <Modal
      show={isOpen}
      onHide={handleCloseModal}
      aria-labelledby="map-download-modal"
      className="map-download-modal d-block"
      scrollable
    >
      <Modal.Body className="map-download-modal-content">
        <div className="map-download-modal-content--header">
          <h2 className="fs-4 mb-4">Export map file</h2>
          <button
            aria-label="close"
            className="btn close-filter-btn"
            onClick={handleCloseModal}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="content-options">
          <div className="content-option">
            <label className="container">
              <div className="check-box-container">
                <input
                  type="checkbox"
                  className="map-option"
                  checked={isKml}
                  onChange={() => handleSelect('kml')}
                />
              </div>
              <div className="option-label">
                <div className="header">KML File</div>
                <div className="description">
                  Keyhole Markup Language: A KML file shows maps and routes in
                  apps like Google Earth, helping you visualize trails,
                  campsites, terrain features in 3D.
                </div>
              </div>
            </label>
          </div>
          <div className="content-option">
            <label className="container">
              <div className="check-box-container">
                <input
                  type="checkbox"
                  className="map-option"
                  checked={isGpx}
                  onChange={() => handleSelect('gpx')}
                />
              </div>
              <div className="option-label">
                <div className="header">GPX File</div>
                <div className="description">
                  GPS Exchange Format: A GPX file contains GPS data like tracks,
                  waypoints, and routes, which you can load into GPS devices or
                  apps to follow a trail offline.
                </div>
              </div>
            </label>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-block">
        <button
          aria-label="Show results"
          onClick={() => handleDownload()}
          className="btn btn-primary w-100 mx-0 mb-2 download-button"
          disabled={!isGpx && !isKml}
        >
          Download
        </button>
        <button className="btn w-100 mx-0 mb-2" onClick={handleCloseModal}>
          Cancel
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default DownloadMapModal;
