import { Fill, Icon, Stroke, Text } from 'ol/style';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import {
  ICON_SCALE,
  MAP_ICONS,
  MAP_STYLES,
  StyleContext,
  TEXT_STYLE,
} from '@/components/rec-resource/RecreationResourceMap/constants';
import { isRecreationTrail } from '@/utils/recreationResourceUtils';
import locationDotOrange from '@/assets/location-dot-orange.png';

const TEXT_SCALE = 1.3;

/**
 * Returns the appropriate icon URL for a given recreation resource.
 * Checks the resource type using utility functions and selects the icon accordingly.
 * @param recResource The recreation resource detail model.
 * @param styleContext The styling context (MAP_DISPLAY, DOWNLOAD, etc.).
 * @returns The icon URL string.
 */
export function getRecResourceIcon(
  recResource: RecreationResourceDetailModel,
  styleContext = StyleContext.DOWNLOAD,
): string {
  if (styleContext === StyleContext.MAP_DISPLAY) {
    return locationDotOrange;
  }
  if (isRecreationTrail(recResource)) return MAP_ICONS.RECREATION_TRAIL_HEAD;
  return MAP_ICONS.LOCATION_PIN;
}

/**
 * Creates an OpenLayers Icon style for point features.
 * @param isPoint Whether the feature is a point.
 * @param recResource The recreation resource detail model.
 * @param styleContext The styling context (MAP_DISPLAY, DOWNLOAD, etc.).
 */
export const createImageStyle = (
  isPoint: boolean,
  recResource: RecreationResourceDetailModel,
  styleContext = StyleContext.DOWNLOAD,
): Icon | undefined =>
  isPoint
    ? new Icon({
        src: getRecResourceIcon(recResource, styleContext),
        scale: ICON_SCALE[styleContext],
      })
    : undefined;

/**
 * Creates an OpenLayers Stroke style for line or polygon features.
 * @param isLineType Whether the feature is a line.
 * @param styleContext The styling context (MAP_DISPLAY, DOWNLOAD, etc.).
 */
export const createStrokeStyle = (
  isLineType: boolean,
  styleContext = StyleContext.DOWNLOAD,
): Stroke => {
  const strokeStyle = isLineType
    ? MAP_STYLES.STROKE[styleContext].line
    : MAP_STYLES.STROKE[styleContext].polygon;

  return new Stroke({
    color: strokeStyle.COLOR,
    width: strokeStyle.WIDTH,
    lineDash: strokeStyle.LINE_DASH,
  });
};

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
 * @param styleContext The styling context (MAP_DISPLAY, DOWNLOAD, etc.).
 */
export const createTextStyle = (
  label: string,
  isLineType: boolean, // LineString or MultiLineString feature
  isPoint: boolean,
  styleContext = StyleContext.DOWNLOAD,
): Text => {
  const textStyle = TEXT_STYLE[styleContext];
  return new Text({
    text: label,
    placement: isLineType ? 'line' : 'point',
    fill: textStyle.fill,
    backgroundFill: textStyle.backgroundFill,
    stroke: textStyle.stroke,
    textBaseline: isLineType ? 'middle' : 'bottom',
    offsetY: isPoint ? -25 : 0, // Offset label above point
    textAlign: 'center',
    repeat: isLineType ? 300 : undefined, // Repeat label along line
    padding: [2, 5, 2, 5],
    rotateWithView: isLineType,
    declutterMode: 'declutter',
    scale: TEXT_SCALE,
  });
};
