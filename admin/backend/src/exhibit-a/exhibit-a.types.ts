import {
  ExhibitAPageOrientation,
  ExhibitAPageSize,
} from './dto/generate-exhibit-a.dto';
import { ExhibitAPdfHeader } from '@/exhibit-a/exhibit-a-pdf-builder';

export type ExhibitAResult = {
  submissionId: string;
  pdfBuffer?: Buffer;
  pdfUrl?: string;
  pdfKey?: string;
  mapImageUrl: string;
  pageSize: ExhibitAPageSize;
  pageOrientation: ExhibitAPageOrientation;
  scale: number;
};

export type SubmissionLookupRow = {
  application_guid: string;
  submission_id: string;
  tenure_id: string;
};

export type ExhibitADocLookupRow = {
  submission_id: string;
  s3_key: string;
  page_size: string | null;
  page_orientation: string | null;
  scale: number | null;
};

export type HeaderRow = ExhibitAPdfHeader & {
  submission_id: string;
  tenure_id: string;
  submission_date: Date | null;
  utm_easting?: number | null;
  utm_northing?: number | null;
  area_ha?: number | null;
  width_m?: number | null;
  project_type?: string | null;
};

export type FeatureRow = {
  section_id: string | null;
  geojson: string;
  label_geojson: string;
};

export type SpatialBounds = {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
};
export type GeoJsonGeometry = { type?: string; coordinates?: unknown };
export type LayersPayload = { layers?: Array<{ id?: unknown } | null> };
export type LonLat = [number, number];
export type LineInfo = {
  startLL: LonLat;
  endLL: LonLat;
  pofc: [number, number];
  poft: [number, number];
  lengthKm: number;
};

export type EsriGeometryType =
  | 'esriGeometryPolygon'
  | 'esriGeometryPolyline'
  | 'esriGeometryPoint';

export type SubmissionGraphic = {
  geometryType: EsriGeometryType;
  geometry: Record<string, unknown>;
  attributes: { OBJECTID: number; section_id: string };
};

export type LabelGraphic = {
  geometry: Record<string, unknown>;
  attributes: { text: string };
};
