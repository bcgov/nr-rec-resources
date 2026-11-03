import { BadGatewayException } from '@nestjs/common';
import {
  EsriGeometryType,
  GeoJsonGeometry,
  LineInfo,
  LonLat,
  SpatialBounds,
} from './exhibit-a.types';
import { WGS84 } from './exhibit-a.constants';

export function parseGeoJsonGeometry(
  raw: string,
  fieldName: string,
): GeoJsonGeometry {
  let parsed: GeoJsonGeometry;
  try {
    parsed = JSON.parse(raw) as GeoJsonGeometry;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    throw new BadGatewayException(
      `Invalid ${fieldName} geometry payload: ${message}`,
    );
  }

  if (!parsed || typeof parsed !== 'object' || !parsed.type) {
    throw new BadGatewayException(
      `Invalid ${fieldName} geometry payload: missing GeoJSON type`,
    );
  }
  return parsed;
}

export function toCoordinatePair(node: unknown): [number, number] | null {
  if (!Array.isArray(node) || node.length < 2) return null;
  const x = Number(node[0]);
  const y = Number(node[1]);
  return Number.isFinite(x) && Number.isFinite(y) ? [x, y] : null;
}

export function toCoordinatePath(
  node: unknown,
  minimumVertices: number,
): number[][] | null {
  if (!Array.isArray(node)) return null;
  const points = node
    .map((entry) => toCoordinatePair(entry))
    .filter((pair): pair is [number, number] => pair !== null);
  return points.length >= minimumVertices ? points : null;
}

export function toEsriGeometry(g: GeoJsonGeometry): {
  geometryType: EsriGeometryType;
  geometry: Record<string, unknown>;
} | null {
  const c = g.coordinates;
  const list = Array.isArray(c) ? (c as unknown[]) : [];

  const paths = (nodes: unknown[], min: number) =>
    nodes
      .map((n) => toCoordinatePath(n, min))
      .filter((p): p is number[][] => p !== null);

  const build = (
    geometryType: EsriGeometryType,
    key: 'paths' | 'rings',
    parts: number[][][],
  ) =>
    parts.length > 0
      ? { geometryType, geometry: { [key]: parts, spatialReference: WGS84 } }
      : null;

  switch (g.type) {
    case 'Point': {
      const p = toCoordinatePair(c);
      return p
        ? {
            geometryType: 'esriGeometryPoint',
            geometry: { x: p[0], y: p[1], spatialReference: WGS84 },
          }
        : null;
    }
    case 'LineString':
      return build('esriGeometryPolyline', 'paths', paths([c], 2));
    case 'MultiLineString':
      return build('esriGeometryPolyline', 'paths', paths(list, 2));
    case 'Polygon':
      return build('esriGeometryPolygon', 'rings', paths(list, 3));
    case 'MultiPolygon':
      return build(
        'esriGeometryPolygon',
        'rings',
        paths(
          list.flatMap((polygon) => (Array.isArray(polygon) ? polygon : [])),
          3,
        ),
      );
    default:
      return null;
  }
}

export function calculateExtent(geometries: GeoJsonGeometry[]): SpatialBounds {
  let xmin = Infinity;
  let ymin = Infinity;
  let xmax = -Infinity;
  let ymax = -Infinity;

  const visit = (node: unknown): void => {
    if (!Array.isArray(node)) return;

    if (
      node.length >= 2 &&
      typeof node[0] === 'number' &&
      typeof node[1] === 'number'
    ) {
      const [x, y] = node as [number, number];
      if (Number.isFinite(x) && Number.isFinite(y)) {
        if (x < xmin) xmin = x;
        if (x > xmax) xmax = x;
        if (y < ymin) ymin = y;
        if (y > ymax) ymax = y;
      }
      return;
    }
    node.forEach(visit);
  };

  geometries.forEach((g) => visit(g.coordinates));

  if (![xmin, ymin, xmax, ymax].every(Number.isFinite)) {
    throw new BadGatewayException(
      'Failed to calculate map extent from geometry.',
    );
  }

  const padX = Math.max(0.0008, (xmax - xmin) * 0.08);
  const padY = Math.max(0.0008, (ymax - ymin) * 0.08);

  return {
    xmin: xmin - padX,
    ymin: ymin - padY,
    xmax: xmax + padX,
    ymax: ymax + padY,
  };
}

export function lineInfo(
  g: GeoJsonGeometry,
  toUtm: (p: LonLat) => [number, number],
): LineInfo | null {
  const raw =
    g.type === 'LineString'
      ? [g.coordinates]
      : g.type === 'MultiLineString' && Array.isArray(g.coordinates)
        ? (g.coordinates as unknown[])
        : [];
  const lines = raw
    .map((l) => toCoordinatePath(l, 2))
    .filter((p): p is number[][] => p !== null);
  if (lines.length === 0) return null;

  const startLL = lines[0]![0] as LonLat;
  const lastLine = lines[lines.length - 1]!;
  const endLL = lastLine[lastLine.length - 1] as LonLat;

  let metres = 0;
  for (const l of lines) {
    const u = l.map((p) => toUtm(p as LonLat));
    for (let i = 1; i < u.length; i++) {
      metres += Math.hypot(u[i]![0] - u[i - 1]![0], u[i]![1] - u[i - 1]![1]);
    }
  }
  return {
    startLL,
    endLL,
    pofc: toUtm(startLL),
    poft: toUtm(endLL),
    lengthKm: metres / 1000,
  };
}
