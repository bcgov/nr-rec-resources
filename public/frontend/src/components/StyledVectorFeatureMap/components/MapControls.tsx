import { Button, ButtonGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { trackEvent } from '@/utils/matomo';
import {
  faLocationCrosshairs,
  faMinus,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import './MapControls.scss';
import { FC, memo, useCallback } from 'react';
import OlMap from 'ol/Map';
import { Coordinate } from 'ol/coordinate';
import { DEFAULT_MAP_ZOOM } from '@/components/StyledVectorFeatureMap/constants';

interface MapControlsProps {
  map: OlMap;
  extent?: Coordinate;
}

/**
 * Provides zoom and center controls for an OpenLayers map
 *
 * @component
 * @param {Object} props - Component props
 * @param {OlMap} props.map - OpenLayers Map instance to control
 * @param {Coordinate} [props.extent] - Optional coordinate extent to center the map on
 */
export const MapControls: FC<MapControlsProps> = memo(({ map, extent }) => {
  const view = map.getView();

  const onZoomIn = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const zoom = view.getZoom() ?? 0;
      view.animate({ zoom: zoom + 1, duration: 250 });
      trackEvent({
        category: 'Map Controls',
        action: 'Click',
        name: 'Zoom In',
      });
    },
    [view],
  );

  const onZoomOut = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const zoom = view.getZoom() ?? 0;
      view.animate({ zoom: zoom - 1, duration: 250 });
      trackEvent({
        category: 'Map Controls',
        action: 'Click',
        name: 'Zoom Out',
      });
    },
    [view],
  );

  const onCenter = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      view.fit(extent ?? view.getProjection().getExtent());
      view.setZoom(DEFAULT_MAP_ZOOM);
      trackEvent({
        category: 'Map Controls',
        action: 'Click',
        name: 'Center Map',
      });
    },
    [view, extent],
  );

  return (
    <ButtonGroup vertical className="zoom-control rounded-1">
      <Button
        variant="light"
        onClick={onCenter}
        aria-label="Center map to full extent"
      >
        <FontAwesomeIcon icon={faLocationCrosshairs} />
      </Button>
      <Button
        variant="light"
        onClick={onZoomIn}
        className="zoom-in-btn"
        aria-label="Zoom in"
      >
        <FontAwesomeIcon icon={faPlus} />
      </Button>
      <Button
        variant="light"
        onClick={onZoomOut}
        className="zoom-out-btn"
        aria-label="Zoom out"
      >
        <FontAwesomeIcon icon={faMinus} />
      </Button>
    </ButtonGroup>
  );
});
