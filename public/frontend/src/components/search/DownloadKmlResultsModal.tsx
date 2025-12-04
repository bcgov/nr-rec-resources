import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import './DownloadKmlResultsModal.scss';
import { useRecreationResourcesWithGeometryMutation } from '@/service/queries/recreation-resource';
import {
  downloadKMLMultiple,
  getLayerStyleForRecResource,
  getMapFeaturesFromRecResource,
  StyleContext,
} from '@shared/components/recreation-resource-map';
import { Feature } from 'ol';
import { RecreationResourceMapData } from '@shared/components/recreation-resource-map/types';
import { getRecResourceDetailPageUrl } from '@/utils/recreationResourceUtils';
import { trackEvent } from '@shared/utils';

interface DownloadKmlResultsModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  searchResultsNumber: number;
  ids: string[];
  variant: 'list' | 'map';
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
  variant,
}: DownloadKmlResultsModalProps) => {
  const { mutateAsync, isPending } =
    useRecreationResourcesWithGeometryMutation();
  // swap variants to track properly on matomo
  const actualVariant = variant === 'list' ? 'map' : 'list';

  const REC_LIMIT = 400;

  const handleDownload = async () => {
    const data = await mutateAsync({ ids });
    if (data) {
      const allKmlProps: KmlProps[] = [];
      data.forEach((recResource) => {
        const features = getMapFeaturesFromRecResource(recResource);
        const layerStyle = getLayerStyleForRecResource(
          recResource,
          StyleContext.DOWNLOAD,
        );
        features.forEach((feature) => {
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
      trackEvent({
        category: `Export map`,
        action: `Export_bulk_${actualVariant}`,
        name: `Export_bulk_${actualVariant}_${searchResultsNumber}`,
      });
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
          disabled={searchResultsNumber > REC_LIMIT && !isPending}
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
