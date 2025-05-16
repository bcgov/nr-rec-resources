import { RecreationResourceDetailModel } from '@/service/custom-models';
import { StyleFunction } from 'ol/style/Style';
import { FeatureLike } from 'ol/Feature';
import { Style } from 'ol/style';
import {
  isLineOrMultiLineStringGeometry,
  isPointGeometry,
  isPolygonOrMultiPolygonGeometry,
} from '@/utils/map';
import {
  createFillStyle,
  createImageStyle,
  createStrokeStyle,
  createTextStyle,
} from '@/components/rec-resource/RecreationResourceMap/helpers/layerStyleHelpers';

/**
 * Generates a style function for recreation resource features on a map layer.
 *
 * @param recResource - Optional recreation resource detail model
 * @returns StyleFunction for OpenLayers features
 */
export const getLayerStyleForRecResource = (
  recResource?: RecreationResourceDetailModel,
): StyleFunction => {
  const label = recResource?.name ?? '';
  const hasSitePoint = Boolean(recResource?.site_point_geometry);

  return (feature: FeatureLike): Style => {
    const geometry = feature.getGeometry();
    const isPoint = isPointGeometry(geometry);
    const isLineOrMultiLineString = isLineOrMultiLineStringGeometry(geometry);
    const isPolygonOrMultiPolygon = isPolygonOrMultiPolygonGeometry(geometry);

    // Skip polygon text if site point exists to avoid duplicate labels
    const showText = isPolygonOrMultiPolygon ? !hasSitePoint : true;

    return new Style({
      image: createImageStyle(isPoint),
      stroke: createStrokeStyle(isLineOrMultiLineString),
      fill: createFillStyle(isPolygonOrMultiPolygon),
      text: showText
        ? createTextStyle(label, isLineOrMultiLineString, isPoint)
        : undefined,
    });
  };
};
