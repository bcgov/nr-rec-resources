import { Coordinate } from 'ol/coordinate';
import { ZoomButton, ZoomToExtentButton } from '@terrestris/react-geo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationCrosshairs,
  faMinus,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import './MapControls.scss';
import React from 'react';
import { Stack } from 'react-bootstrap';

interface MapControlsProps {
  /** Extent boundaries for the map */
  extent?: Coordinate;
  /** Zoom level for the map */
  zoom?: number;
}

/**
 * MapControls component that renders zoom and extent controls
 * @param props - Component properties
 */
export const MapControls: React.FC<MapControlsProps> = ({ extent, zoom }) => (
  <Stack gap={1} direction={'vertical'} className="zoom-control rounded-1">
    <ZoomToExtentButton
      zoom={zoom}
      extent={extent}
      aria-label="Center map to full extent"
    >
      <FontAwesomeIcon icon={faLocationCrosshairs} />
    </ZoomToExtentButton>
    <ZoomButton className="zoom-in-btn" aria-label="Zoom in">
      <FontAwesomeIcon icon={faPlus} />
    </ZoomButton>
    <ZoomButton delta={-1} className="zoom-out-btn" aria-label="Zoom out">
      <FontAwesomeIcon icon={faMinus} />
    </ZoomButton>
  </Stack>
);
