import { CSSProperties, useCallback, useMemo, useState } from 'react';
import { Col, Row, Stack } from 'react-bootstrap';
import {
  RecreationResourceMap as SharedRecreationResourceMap,
  MATOMO_TRACKING_CATEGORY_MAP,
  DownloadMapModal,
  getMapFeaturesFromRecResource,
  getSitePointFeatureFromRecResource,
  webMercatorXToLon,
  webMercatorYToLat,
} from '@/components/rec-resource/RecreationResourceMap/helpers';
  getLayerStyleForRecResource,
  StyleContext,
} from '@shared/components/recreation-resource-map';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import { trackEvent } from '@shared/utils';
import { IconButton } from '@shared/components/icon-button';
import { SearchMapFocusModes } from '@/components/search-map/constants';
import { ROUTE_PATHS } from '@/routes/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink, faMap } from '@fortawesome/free-solid-svg-icons';
import { getRecResourceDetailPageUrl } from '@/utils/recreationResourceUtils';
import { Link } from 'react-router-dom';
import DownloadIcon from '@shared/assets/icons/download.svg';

interface RecreationResourceMapProps {
  recResource: RecreationResourceDetailModel;
  mapComponentCssStyles?: CSSProperties;
  className?: string;
}

const DOWNLOAD_ICON_CONFIG = {
  WIDTH: 16,
  HEIGHT: 16,
  ALT: 'Download map',
} as const;

const TRACKING_ACTIONS = {
  VIEW_IN_MAIN_MAP: 'View in main map',
  EXPORT_MAP_FILE: 'Export map file',
  OPEN_GOOGLE_MAPS: 'Open in Google Maps',
} as const;

/**
 * Recreation Resource Map Component
 *
 * Displays a map with recreation resource features and provides functionality
 * to view in main map and export map files.
 */
export const RecreationResourceMap = ({
  recResource,
  mapComponentCssStyles,
  className,
}: RecreationResourceMapProps) => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const mainMapUrl = useMemo(
    () => ({
      pathname: ROUTE_PATHS.SEARCH,
      search: `view=map&focus=${SearchMapFocusModes.REC_RESOURCE_ID}:${recResource.rec_resource_id}`,
    }),
    [recResource.rec_resource_id],
  );

  const recResourceName = useMemo(
    () => recResource?.name || 'Unnamed Resource',
    [recResource?.name],
  );

  const downloadStyledFeatures = useMemo(() => {
    const features = getMapFeaturesFromRecResource(recResource);

    if (!features?.length) {
      return [];
    }

    const layerStyle = getLayerStyleForRecResource(
      recResource,
      StyleContext.DOWNLOAD,
    );

    return features.map((feature) => {
      feature.setStyle(layerStyle);
      return feature;
    });
  }, [recResource]);

  const handleViewInMainMapClick = useCallback(() => {
    trackEvent({
      category: MATOMO_TRACKING_CATEGORY_MAP,
      action: TRACKING_ACTIONS.VIEW_IN_MAIN_MAP,
      name: `${recResourceName}-${recResource?.rec_resource_id}-${TRACKING_ACTIONS.VIEW_IN_MAIN_MAP}`,
    });
  }, [recResourceName, recResource?.rec_resource_id]);

  const handleDownloadClick = useCallback(() => {
    trackEvent({
      category: MATOMO_TRACKING_CATEGORY_MAP,
      action: TRACKING_ACTIONS.EXPORT_MAP_FILE,
      name: `${recResourceName}-${recResource?.rec_resource_id}-${TRACKING_ACTIONS.EXPORT_MAP_FILE}`,
    });
    setIsDownloadModalOpen(true);
  }, [recResourceName, recResource?.rec_resource_id]);

  const handleGoogleMapsLink = useCallback(() => {
    trackEvent({
      category: MATOMO_TRACKING_CATEGORY_MAP,
      action: TRACKING_ACTIONS.OPEN_GOOGLE_MAPS,

      name: `${recResourceName}-${recResource?.rec_resource_id}-${TRACKING_ACTIONS.OPEN_GOOGLE_MAPS}`,
    });
    const map = getSitePointFeatureFromRecResource(recResource);
    if (map) {
      const geometry = map.getGeometry();
      const coordinates = geometry?.getCoordinates();
      if (coordinates) {
        const lat = webMercatorYToLat(coordinates[1]);
        const lon = webMercatorXToLon(coordinates[0]);
        console.log(lat, lon);
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
          '_blank',
        );
      }
    }
  }, [recResource, recResourceName]);

  if (!mapStyledFeatures.length || !downloadStyledFeatures.length) {
    return null;
  }

  return (
    <div className={className}>
      <Stack direction="vertical" gap={3}>
        <SharedRecreationResourceMap
          recResource={recResource}
          mapComponentCssStyles={mapComponentCssStyles}
        />

        <Row className="g-md-2 g-2">
          <Col xs={12} md="auto">
            <Link
              onClick={handleViewInMainMapClick}
              aria-label={`View ${recResourceName} in main map`}
              to={mainMapUrl}
            >
              <IconButton
                data-testid="view-main-map-button"
                variant="outline"
                leftIcon={<FontAwesomeIcon icon={faMap} />}
              >
                Full map
              </IconButton>
            </Link>
          </Col>

          <Col xs={12} md="auto">
            <IconButton
              data-testid="google-maps"
              variant="outline"
              onClick={handleGoogleMapsLink}
              aria-label={`Google maps view for ${recResourceName}`}
              leftIcon={<FontAwesomeIcon icon={faExternalLink} />}
            >
              Google Maps
            </IconButton>
          </Col>

          <Col xs={12} md="auto">
            <IconButton
              data-testid="download-button"
              variant="outline"
              onClick={handleDownloadClick}
              aria-label={`Export map file for ${recResourceName}`}
              leftIcon={
                <img
                  src={DownloadIcon}
                  alt={DOWNLOAD_ICON_CONFIG.ALT}
                  width={DOWNLOAD_ICON_CONFIG.WIDTH}
                  height={DOWNLOAD_ICON_CONFIG.HEIGHT}
                />
              }
            >
              Export map file
            </IconButton>
          </Col>
        </Row>

        <DownloadMapModal
          isOpen={isDownloadModalOpen}
          setIsOpen={setIsDownloadModalOpen}
          styledFeatures={downloadStyledFeatures}
          recResource={recResource}
          getResourceDetailUrl={getRecResourceDetailPageUrl}
        />
      </Stack>
    </div>
  );
};

export default RecreationResourceMap;
