import { Fill, Icon, Stroke, Text } from 'ol/style';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import {
  MAP_ICONS,
  MAP_STYLES,
  TEXT_STYLE,
} from '@/components/rec-resource/RecreationResourceMap/constants';
import { isRecreationTrail } from '@/utils/recreationResourceUtils';

const ICON_SCALE = 0.3;
const TEXT_SCALE = 1.3;

/**
 * Returns the appropriate icon URL for a given recreation resource.
 * Checks the resource type using utility functions and selects the icon accordingly.
 * @param recResource The recreation resource detail model.
 * @returns The icon URL string.
 */
export function getRecResourceIcon(
  recResource: RecreationResourceDetailModel,
): string {
  if (isRecreationTrail(recResource)) return MAP_ICONS.RECREATION_TRAIL_HEAD;
  return MAP_ICONS.LOCATION_PIN;
}

/**
 * Creates an OpenLayers Icon style for point features.
 * @param isPoint Whether the feature is a point.
 * @param recResource The recreation resource detail model.
 */
export const createImageStyle = (
  isPoint: boolean,
  recResource: RecreationResourceDetailModel,
): Icon | undefined =>
  isPoint
    ? new Icon({
        src: getRecResourceIcon(recResource),
        scale: ICON_SCALE,
      })
    : undefined;

/**
 * Creates an OpenLayers Stroke style for line or polygon features.
 * @param isLineType Whether the feature is a line.
 */
export const createStrokeStyle = (isLineType: boolean): Stroke =>
  new Stroke({
    color: isLineType
      ? MAP_STYLES.STROKE.TRAIL_COLOR
      : MAP_STYLES.STROKE.POLYGON_COLOR,
    width: MAP_STYLES.STROKE.WIDTH,
    lineDash: isLineType ? MAP_STYLES.STROKE.LINE_DASH : [],
  });

/**
 * Creates an OpenLayers Fill style for polygon features.
 * @param isPolygonType Whether the feature is a polygon.
 */
export const createFillStyle = (isPolygonType: boolean): Fill | undefined =>
  isPolygonType ? new Fill({ color: MAP_STYLES.FILL.COLOR }) : undefined;

/**
 * Creates an OpenLayers Text style for labeling features.
 * @param label The text label.
 * @param isLineType Whether the feature is a line.
 * @param isPoint Whether the feature is a point.
 */
export const createTextStyle = (
  label: string,
  isLineType: boolean, // LineString or MultiLineString feature
  isPoint: boolean,
): Text =>
  new Text({
    text: label,
    placement: isLineType ? 'line' : 'point',
    fill: TEXT_STYLE.fill,
    backgroundFill: TEXT_STYLE.backgroundFill,
    stroke: TEXT_STYLE.stroke,
    textBaseline: isLineType ? 'middle' : 'bottom',
    offsetY: isPoint ? -25 : 0, // Offset label above point
    textAlign: 'center',
    repeat: isLineType ? 300 : undefined, // Repeat label along line
    padding: [2, 5, 2, 5],
    rotateWithView: isLineType,
    declutterMode: 'declutter',
    scale: TEXT_SCALE,
  });
