import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import './DownloadKmlResultsModal.scss';
import { useSearchRecreationResourcesGeometry } from '@/service/queries/recreation-resource';
import { useEffect } from 'react';

interface DownloadKmlResultsModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  searchResultsNumber: number;
  filter: string | undefined;
  district: string | undefined;
  activities: string | undefined;
  access: string | undefined;
  facilities: string | undefined;
  status: string | undefined;
  fees: string | undefined;
  lat: number | undefined;
  lon: number | undefined;
  community: string | undefined;
  type: string | undefined;
}

const DownloadKmlResultsModal = ({
  isOpen,
  setIsOpen,
  searchResultsNumber,
  filter,
  district,
  activities,
  access,
  facilities,
  status,
  fees,
  lat,
  lon,
  community,
  type,
}: DownloadKmlResultsModalProps) => {
  const { data, refetch } = useSearchRecreationResourcesGeometry(
    {
      limit: 500,
      filter,
      district,
      activities,
      access,
      facilities,
      status,
      fees,
      lat,
      lon,
      community,
      type,
      page: 1,
    },
    false,
  );

  useEffect(() => {
    if (data) {
      alert('create KML');
    }
  }, [data]);

  const handleDownload = () => {
    refetch();
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
        <div className="title">
          Download search results ({searchResultsNumber})
        </div>
        <div className="description">
          Download KML files for your search results.
        </div>
        <div className="description">
          A KML file shows maps and routes in apps like Google Earth, helping
          you visualize trails, campsites, terrain features in 3D.
        </div>
        {filter}
      </Modal.Body>
      <Modal.Footer className="d-block">
        <button
          aria-label="Show results"
          onClick={() => handleDownload()}
          className="btn btn-primary w-100 mx-0 mb-2 download-button"
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

export default DownloadKmlResultsModal;
