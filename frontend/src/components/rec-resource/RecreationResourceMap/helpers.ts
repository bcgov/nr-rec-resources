import { StyleFunction } from 'ol/style/Style';
import { FeatureLike } from 'ol/Feature';
import { Fill, Stroke, Style, Text } from 'ol/style';
import {
  FILL_COLOR,
  STROKE_COLOR,
  TEXT_COLOR,
  TEXT_STROKE_COLOR,
} from '@/components/rec-resource/RecreationResourceMap/constants';

/**
 * Creates a style function for vector features with customizable appearance
 * @param label - Text label to display on map feature
 * @returns Style function for OpenLayers features
 */
export const getLayerStyle = (label: string): StyleFunction => {
  // Cache common styles
  const textFill = new Fill({ color: TEXT_COLOR });
  const textStroke = new Stroke({
    color: TEXT_STROKE_COLOR,
    width: 2,
  });

  return (feature: FeatureLike) => {
    const geometry = feature.getGeometry();
    const type = geometry?.getType();
    const isLineString = type === 'LineString';
    const isPolygon = type === 'Polygon';

    return new Style({
      stroke: new Stroke({
        color: STROKE_COLOR,
        width: 3,
        lineDash: isLineString ? [6, 6] : [],
      }),
      fill: type !== 'LineString' ? new Fill({ color: FILL_COLOR }) : undefined,
      text: new Text({
        text: label,
        placement: isLineString ? 'line' : 'point',
        fill: textFill,
        stroke: textStroke,
        textBaseline: isPolygon ? 'middle' : 'bottom',
        textAlign: 'center',
      }),
    });
  };
};
