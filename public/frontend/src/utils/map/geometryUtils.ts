import {
  Geometry,
  LineString,
  MultiLineString,
  MultiPolygon,
  Point,
  Polygon,
} from 'ol/geom';
import RenderFeature from 'ol/render/Feature';

export const isPointGeometry = (
  geometry?: Geometry | RenderFeature,
): geometry is Point => geometry instanceof Point;

export const isLineStringGeometry = (
  geometry?: Geometry | RenderFeature,
): geometry is LineString => geometry instanceof LineString;

export const isMultiLineStringGeometry = (
  geometry?: Geometry | RenderFeature,
): geometry is MultiLineString => geometry instanceof MultiLineString;

export const isLineOrMultiLineStringGeometry = (
  geometry?: Geometry | RenderFeature,
): geometry is LineString | MultiLineString =>
  isLineStringGeometry(geometry) || isMultiLineStringGeometry(geometry);

export const isPolygonGeometry = (
  geometry?: Geometry | RenderFeature,
): geometry is Polygon => {
  return geometry instanceof Polygon;
};

export const isMultiPolygonGeometry = (
  geometry?: Geometry | RenderFeature,
): geometry is MultiPolygon => geometry instanceof MultiPolygon;

export const isPolygonOrMultiPolygonGeometry = (
  geometry?: Geometry | RenderFeature,
): geometry is Polygon | MultiPolygon =>
  isPolygonGeometry(geometry) || isMultiPolygonGeometry(geometry);
