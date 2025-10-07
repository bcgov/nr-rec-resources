import { RecreationResourceMapData } from '@shared/components/recreation-resource-map/RecreationResourceMap';
import { StyleFunction } from 'ol/style/Style';
import { FeatureLike } from 'ol/Feature';
import { Style } from 'ol/style';
import {
  Geometry,
  LineString,
  MultiLineString,
  Point,
  Polygon,
  MultiPolygon,
} from 'ol/geom';
import RenderFeature from 'ol/render/Feature';
import { StyleContext } from '@shared/components/recreation-resource-map/constants';
import {
  createFillStyle,
  createImageStyle,
  createStrokeStyle,
  createTextStyle,
} from '@shared/components/recreation-resource-map/helpers/layerStyleHelpers';

const isPointGeometry = (
  geometry?: Geometry | RenderFeature,
): geometry is Point => geometry instanceof Point;

const isLineStringGeometry = (
  geometry?: Geometry | RenderFeature,
): geometry is LineString => geometry instanceof LineString;

const isMultiLineStringGeometry = (
  geometry?: Geometry | RenderFeature,
): geometry is MultiLineString => geometry instanceof MultiLineString;

const isLineOrMultiLineStringGeometry = (
  geometry?: Geometry | RenderFeature,
): geometry is LineString | MultiLineString =>
  isLineStringGeometry(geometry) || isMultiLineStringGeometry(geometry);

const isPolygonGeometry = (
  geometry?: Geometry | RenderFeature,
): geometry is Polygon => {
  return geometry instanceof Polygon;
};

const isMultiPolygonGeometry = (
  geometry?: Geometry | RenderFeature,
): geometry is MultiPolygon => geometry instanceof MultiPolygon;

const isPolygonOrMultiPolygonGeometry = (
  geometry?: Geometry | RenderFeature,
): geometry is Polygon | MultiPolygon =>
  isPolygonGeometry(geometry) || isMultiPolygonGeometry(geometry);

/**
 * Generates a style function for recreation resource features on a map layer.
 *
 * @param recResource - Optional recreation resource detail model
 * @param styleContext - The styling context (MAP_DISPLAY, DOWNLOAD, SELECTED, PREVIEW)
 * @returns StyleFunction for OpenLayers features
 */
export const getLayerStyleForRecResource = (
  recResource: RecreationResourceMapData,
  styleContext = StyleContext.DOWNLOAD,
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
      image: createImageStyle(isPoint, recResource, styleContext),
      stroke: createStrokeStyle(isLineOrMultiLineString, styleContext),
      fill: createFillStyle(isPolygonOrMultiPolygon),
      text: showText
        ? createTextStyle(label, isLineOrMultiLineString, isPoint, styleContext)
        : undefined,
    });
  };
};
