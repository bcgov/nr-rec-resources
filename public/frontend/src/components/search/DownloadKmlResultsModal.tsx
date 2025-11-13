import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import './DownloadKmlResultsModal.scss';
import { useRecreationResourcesWithGeometry } from '@/service/queries/recreation-resource';
import { useEffect } from 'react';
import {
  downloadKMLMultiple,
  getLayerStyleForRecResource,
  getMapFeaturesFromRecResource,
  StyleContext,
} from '@shared/components/recreation-resource-map';
import { Feature } from 'ol';
import { RecreationResourceMapData } from '@shared/components/recreation-resource-map/types';
import { getRecResourceDetailPageUrl } from '@/utils/recreationResourceUtils';

interface DownloadKmlResultsModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  searchResultsNumber: number;
  ids: string[];
}

interface KmlProps {
  features: Feature[];
  recResource: RecreationResourceMapData;
  getResourceDetailUrl?: (recResourceId: string) => string;
}

const DownloadKmlResultsModal = ({
  isOpen,
  setIsOpen,
  searchResultsNumber,
  ids,
}: DownloadKmlResultsModalProps) => {
  const { data, refetch } = useRecreationResourcesWithGeometry(
    {
      ids,
    },
    false,
  );

  const REC_LIMIT = 400;

  useEffect(() => {
    if (data) {
      const allKmlProps: KmlProps[] = [];
      data.forEach((recResource) => {
        const features = getMapFeaturesFromRecResource(recResource);
        const layerStyle = getLayerStyleForRecResource(
          recResource,
          StyleContext.DOWNLOAD,
        );
        features.map((feature) => {
          feature.setStyle(layerStyle);
        });
        const props: KmlProps = {
          features,
          recResource,
          getResourceDetailUrl: getRecResourceDetailPageUrl,
        };
        allKmlProps.push(props);
      });
      downloadKMLMultiple(allKmlProps);
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
        {searchResultsNumber > REC_LIMIT && (
          <div className="description alert-msg" data-testid="msg-alert">
            There's a limit of {REC_LIMIT} resources for downloading KML files,
            please refine your search filters.
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="d-block">
        <button
          aria-label="Download"
          onClick={() => handleDownload()}
          disabled={searchResultsNumber > REC_LIMIT}
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
