import { Alert, Col, Container, Modal, Row, Stack } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faInfoCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
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
import {
  MATOMO_ACTION_EXPORT_FILTERED_RESULTS,
  MATOMO_CATEGORY_EXPORT_MAP,
} from '@/constants/analytics';

interface DownloadKmlResultsModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  searchResultsNumber: number;
  ids: string[];
  trackingView: 'list' | 'map';
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
  trackingView,
}: DownloadKmlResultsModalProps) => {
  const { mutateAsync, isPending } =
    useRecreationResourcesWithGeometryMutation();

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
        category: MATOMO_CATEGORY_EXPORT_MAP,
        action: MATOMO_ACTION_EXPORT_FILTERED_RESULTS,
        name: `Export ${searchResultsNumber} from ${trackingView}`,
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
          <h2 className="fs-4 mb-4">Download KML</h2>
          <button
            aria-label="close"
            className="btn close-filter-btn"
            onClick={handleCloseModal}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        {searchResultsNumber > REC_LIMIT ? (
          <Alert
            variant="danger"
            className="rec-resource-page__info-banner"
            data-testid="msg-alert"
          >
            <Stack direction="horizontal" gap={2}>
              <FontAwesomeIcon
                className="rec-resource-page__info-banner-icon"
                icon={faInfoCircle}
                aria-label="Information"
              />
              <span className="rec-resource-page__info-banner-text alert-msg">
                There's a limit of {REC_LIMIT} resources for downloading KML
                files, please refine your search filters.
              </span>
            </Stack>
          </Alert>
        ) : (
          <Alert
            variant="warning"
            className="rec-resource-page__info-banner"
            data-testid="msg-alert"
          >
            <Stack direction="horizontal" gap={2}>
              <FontAwesomeIcon
                className="rec-resource-page__info-banner-icon"
                icon={faExclamationTriangle}
                aria-label="Information"
              />
              <span className="rec-resource-page__info-banner-text alert-msg">
                Download may be slow on limited bandwidth or unstable
                connections.
              </span>
            </Stack>
          </Alert>
        )}
        <div>
          Download KML files for your <strong>{searchResultsNumber}</strong>{' '}
          search results.
        </div>
        <div className="description">
          A KML file shows maps and routes in apps like Google Earth, helping
          you visualize trails, campsites, terrain features in 3D.
        </div>
      </Modal.Body>
      <Modal.Footer className="d-block">
        <Container>
          <Row>
            <Col>
              {searchResultsNumber > REC_LIMIT ? (
                <button
                  aria-label="Refine your search"
                  onClick={handleCloseModal}
                  className="btn btn-primary w-100 mx-0 mb-2 download-button"
                >
                  {'< '}Refine your search
                </button>
              ) : (
                <button
                  aria-label="Download"
                  onClick={() => handleDownload()}
                  disabled={searchResultsNumber > REC_LIMIT && !isPending}
                  className="btn btn-primary w-100 mx-0 mb-2 download-button"
                >
                  Download
                </button>
              )}
            </Col>
            <Col>
              <button
                className="btn w-100 mx-0 mb-2 cancel-button"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
            </Col>
          </Row>
        </Container>
      </Modal.Footer>
    </Modal>
  );
};

export default DownloadKmlResultsModal;
