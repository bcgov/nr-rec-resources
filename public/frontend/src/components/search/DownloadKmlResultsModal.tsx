import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import './DownloadKmlResultsModal.scss';
import DownloadKmlResults from './DownloadKmlResults';

interface DownloadKmlResultsModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  searchResultsNumber: number;
  ids: string[];
  trackingView: 'list' | 'map';
}

const DownloadKmlResultsModal = ({
  isOpen,
  setIsOpen,
  searchResultsNumber,
  ids,
  trackingView,
}: DownloadKmlResultsModalProps) => {
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
          <h2 className="fs-4 mb-4">Download KML</h2>
          <button
            aria-label="close"
            className="btn close-filter-btn"
            onClick={handleCloseModal}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <DownloadKmlResults
          searchResultsNumber={searchResultsNumber}
          ids={ids}
          trackingView={trackingView}
          handleCloseModal={handleCloseModal}
        />
      </Modal.Body>
    </Modal>
  );
};

export default DownloadKmlResultsModal;
