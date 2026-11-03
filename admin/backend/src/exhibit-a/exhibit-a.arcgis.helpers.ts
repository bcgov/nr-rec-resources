import {
  BLACK,
  HTTP_URL,
  SUBMISSION_FIELDS,
  SYMBOLS,
  WGS84,
  WHITE,
} from './exhibit-a.constants';
import type {
  EsriGeometryType,
  LabelGraphic,
  SpatialBounds,
  SubmissionGraphic,
} from './exhibit-a.types';

type Json = Record<string, unknown>;

const CLEAR = [0, 0, 0, 0];

/** Breadth-first walk over a JSON tree; returns the first non-null `pick` result. */
function findInTree<T>(root: unknown, pick: (record: Json) => T | null) {
  const queue: unknown[] = [root];
  const seen = new Set<unknown>();

  // Index pointer instead of shift(): same order, O(n) instead of O(n^2).
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    if (!node || typeof node !== 'object' || seen.has(node)) continue;
    seen.add(node);

    const hit = pick(node as Json);
    if (hit !== null) return hit;
    queue.push(...Object.values(node));
  }
  return null;
}

/** First http(s) URL found anywhere in an ArcGIS execute response. */
export const findOutputUrl = (response: Json): string | null =>
  findInTree(response, (record) =>
    typeof record.url === 'string' && HTTP_URL.test(record.url)
      ? record.url
      : (Object.values(record).find(
          (v): v is string => typeof v === 'string' && HTTP_URL.test(v),
        ) ?? null),
  );

export function extractArcGisDiagnostic(payload: Json): string {
  const error = payload.error as
    | { message?: unknown; details?: unknown }
    | undefined;
  const message =
    typeof error?.message === 'string' ? error.message.trim() : '';

  if (message) {
    const details = Array.isArray(error?.details)
      ? error.details.filter((d): d is string => typeof d === 'string')
      : [];
    return `ArcGIS error: ${message}${details.length ? ` (${details.join(' | ')})` : ''}`;
  }

  const joined = Array.isArray(payload.messages)
    ? (payload.messages as Array<{ description?: unknown } | null>)
        .map((m) => (typeof m?.description === 'string' ? m.description : ''))
        .filter(Boolean)
        .join(' | ')
    : '';
  return joined ? `ArcGIS messages: ${joined}` : '';
}

/* ------------------------------ web map JSON ------------------------------ */

const featureSet = (geometryType: string, features: unknown[]) => ({
  geometryType,
  spatialReference: WGS84,
  features,
});

/** Invisible point layer whose only job is to carry the section-id labels. */
const labelLayer = (features: LabelGraphic[]) => ({
  layerDefinition: {
    name: 'Submission Labels',
    geometryType: 'esriGeometryPoint',
    fields: [
      { name: 'text', type: 'esriFieldTypeString', alias: 'text', length: 128 },
    ],
    drawingInfo: {
      renderer: {
        type: 'simple',
        symbol: {
          type: 'esriSMS',
          style: 'esriSMSCircle',
          size: 1,
          color: CLEAR,
          outline: {
            type: 'esriSLS',
            style: 'esriSLSNull',
            color: CLEAR,
            width: 0,
          },
        },
      },
      labelingInfo: [
        {
          labelExpression: '[text]',
          labelPlacement: 'esriServerPointLabelPlacementAboveCenter',
          symbol: {
            type: 'esriTS',
            color: BLACK,
            haloColor: WHITE,
            haloSize: 2,
            font: { size: 12, family: 'Arial', weight: 'bold' },
          },
        },
      ],
    },
  },
  featureSet: featureSet('esriGeometryPoint', features),
});

/** Green / red triangles for P of C / P of T (matches the legend). */
const endpointLayer = (
  name: string,
  points: Json[],
  color: number[],
  angle: number,
) =>
  points.length === 0
    ? []
    : [
        {
          layerDefinition: {
            name,
            geometryType: 'esriGeometryPoint',
            fields: [],
            drawingInfo: {
              renderer: {
                type: 'simple',
                symbol: {
                  type: 'esriSMS',
                  style: 'esriSMSTriangle',
                  size: 10,
                  angle,
                  color,
                  outline: {
                    type: 'esriSLS',
                    style: 'esriSLSSolid',
                    color: BLACK,
                    width: 1,
                  },
                },
              },
            },
          },
          featureSet: featureSet(
            'esriGeometryPoint',
            points.map((geometry) => ({ geometry, attributes: {} })),
          ),
        },
      ];

export function buildWebMapJson(input: {
  mapServerUrl: string;
  visibleLayers: number[];
  geometryFeatures: SubmissionGraphic[];
  labelFeatures: LabelGraphic[];
  pofcPoints: Json[];
  poftPoints: Json[];
  extent: SpatialBounds;
  scale: number;
  outputSize: number[];
  dpi: number;
}): Json {
  const submissionLayers = (Object.keys(SYMBOLS) as EsriGeometryType[]).flatMap(
    (geometryType) => {
      const features = input.geometryFeatures
        .filter((f) => f.geometryType === geometryType)
        .map(({ geometry, attributes }) => ({ geometry, attributes }));
      if (features.length === 0) return [];

      return [
        {
          layerDefinition: {
            name: `Submission ${geometryType.replace('esriGeometry', '')}`,
            geometryType,
            objectIdField: 'OBJECTID',
            fields: SUBMISSION_FIELDS,
            drawingInfo: {
              renderer: { type: 'simple', symbol: SYMBOLS[geometryType] },
            },
          },
          featureSet: featureSet(geometryType, features),
        },
      ];
    },
  );

  return {
    baseMap: {
      title: 'FTA Base Map',
      baseMapLayers: [{ url: input.mapServerUrl }],
    },
    operationalLayers: [
      {
        id: 'fta-mapserver',
        title: 'FTA Layers',
        url: input.mapServerUrl,
        visibleLayers: input.visibleLayers,
        opacity: 1,
      },
      {
        id: 'submission-geometry',
        title: 'Submission Geometry',
        featureCollection: {
          layers: [
            ...submissionLayers,
            ...endpointLayer('P of C', input.pofcPoints, [0, 200, 0, 255], 270),
            ...endpointLayer('P of T', input.poftPoints, [230, 0, 0, 255], 90),
            labelLayer(input.labelFeatures),
          ],
        },
      },
    ],
    mapOptions: {
      extent: { ...input.extent, spatialReference: WGS84 },
      spatialReference: WGS84,
      scale: input.scale,
    },
    exportOptions: { outputSize: input.outputSize, dpi: input.dpi },
    layoutOptions: {
      titleText: 'Exhibit A',
      scaleBarOptions: { metricUnit: 'esriKilometers', metricLabel: 'km' },
    },
  };
}
