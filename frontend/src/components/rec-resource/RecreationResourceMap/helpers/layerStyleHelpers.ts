import { Fill, Icon, Stroke, Text } from 'ol/style';
import locationDotBCColorBlueMed from '@/images/icons/location-dot-bc-color-blue-med.svg';
import {
  MAP_STYLES,
  TEXT_STYLE,
} from '@/components/rec-resource/RecreationResourceMap/constants';

const SCALE = 1.3;

export const createImageStyle = (isPoint: boolean) =>
  isPoint
    ? new Icon({ src: locationDotBCColorBlueMed, scale: SCALE })
    : undefined;

export const createStrokeStyle = (isLineType: boolean) =>
  new Stroke({
    color: MAP_STYLES.STROKE.COLOR,
    width: MAP_STYLES.STROKE.WIDTH,
    lineDash: isLineType ? MAP_STYLES.STROKE.LINE_DASH : [],
  });

export const createFillStyle = (isPolygonType: boolean) =>
  isPolygonType ? new Fill({ color: MAP_STYLES.FILL.COLOR }) : undefined;

export const createTextStyle = (
  label: string,
  isLineType: boolean, // LineString or MultiLineString
  isPoint: boolean,
) =>
  new Text({
    text: label,
    placement: isLineType ? 'line' : 'point',
    fill: TEXT_STYLE.fill,
    stroke: TEXT_STYLE.stroke,
    textBaseline: isLineType ? 'middle' : 'bottom',
    offsetY: isPoint ? -20 : 0,
    textAlign: 'center',
    repeat: isLineType ? 300 : undefined,
    padding: [2, 5, 2, 5],
    rotateWithView: isLineType,
    declutterMode: 'declutter',
    scale: SCALE,
  });
