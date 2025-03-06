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

interface MapControlsProps {
  /** Center coordinate for the map */
  center?: Coordinate;
  /** Extent boundaries for the map */
  extent?: Coordinate;
  /** Zoom level for the map */
  zoom?: number;
}

/**
 * MapControls component that renders zoom and extent controls
 * @param props - Component properties
 */
export const MapControls: React.FC<MapControlsProps> = ({
  center,
  extent,
  zoom,
}) => (
  <div className="map-btn zoom-control">
    <ZoomToExtentButton center={center} zoom={zoom} extent={extent}>
      <FontAwesomeIcon icon={faLocationCrosshairs} />
    </ZoomToExtentButton>
    <ZoomButton className="zoom-in-btn">
      <FontAwesomeIcon icon={faPlus} />
    </ZoomButton>
    <ZoomButton delta={-1} className="zoom-out-btn">
      <FontAwesomeIcon icon={faMinus} />
    </ZoomButton>
  </div>
);
