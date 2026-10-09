import * as turf from '@turf/turf';
import {
  BC_EXTENT_3005,
  MAX_FEATURE_COUNT,
  MAX_POLYGON_PART_SEPARATION_METRES,
  MAX_TOTAL_VERTEX_COUNT,
  MAX_VERTEX_COUNT_PER_FEATURE,
  ZERO_METRIC_EPSILON,
} from './spatialSubmission.constants';
import type { ValidationIssue } from './spatialSubmission.types';

interface GeometryValidationOptions {
  expectedSrsName: string;
  enforceExpectedSrsName: boolean;
  expectedGeometryType?: 'Point' | 'LineString' | 'Polygon';
}

const normalizeGeometryType = (geometryType?: string): string => {
  if (geometryType === 'MultiPolygon') return 'Polygon';
  if (geometryType === 'MultiLineString') return 'LineString';
  if (geometryType === 'MultiPoint') return 'Point';
  return geometryType ?? '';
};

const iterateCoordinatePairs = (
  coordinates: any,
  callback: (x: number, y: number) => void,
) => {
  if (typeof coordinates?.[0] === 'number') {
    callback(coordinates[0], coordinates[1]);
    return;
  }

  (coordinates ?? []).forEach((nested: any) =>
    iterateCoordinatePairs(nested, callback),
  );
};

const countVertices = (coordinates: any): number => {
  let total = 0;
  iterateCoordinatePairs(coordinates, () => {
    total += 1;
  });
  return total;
};

const hasNonFiniteCoordinates = (coordinates: any): boolean => {
  let invalid = false;
  iterateCoordinatePairs(coordinates, (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      invalid = true;
    }
  });
  return invalid;
};

const hasDuplicateConsecutiveVertices = (coordinates: any): boolean => {
  const seenPairs: Array<[number, number]> = [];
  iterateCoordinatePairs(coordinates, (x, y) => {
    seenPairs.push([x, y]);
  });

  for (let index = 1; index < seenPairs.length; index += 1) {
    const [prevX, prevY] = seenPairs[index - 1];
    const [currX, currY] = seenPairs[index];
    if (prevX === currX && prevY === currY) {
      return true;
    }
  }

  return false;
};

type Coordinate2D = [number, number];

interface PolygonPartReference {
  featureIndex: number;
  polygonIndex: number;
  feature: any;
  sourceGeometryType: 'Polygon' | 'MultiPolygon';
}

interface LinePartReference {
  featureIndex: number;
  lineIndex: number;
  feature: any;
  sourceGeometryType: 'LineString' | 'MultiLineString';
}

interface PointReference {
  featureIndex: number;
  pointIndex: number;
  coordinate: Coordinate2D;
  sourceGeometryType: 'Point' | 'MultiPoint';
}

const GEOMETRY_EPSILON = 1e-9;
const pointsEqual = (a: Coordinate2D, b: Coordinate2D): boolean =>
  Math.abs(a[0] - b[0]) <= GEOMETRY_EPSILON &&
  Math.abs(a[1] - b[1]) <= GEOMETRY_EPSILON;

const toCoordinateKey = (coordinate: Coordinate2D): string => {
  const roundedX = Math.round(coordinate[0] / GEOMETRY_EPSILON);
  const roundedY = Math.round(coordinate[1] / GEOMETRY_EPSILON);
  return `${roundedX}:${roundedY}`;
};

const formatCoordinate = (coordinate: Coordinate2D): string =>
  `${Math.round(coordinate[0] * 1000) / 1000}, ${Math.round(coordinate[1] * 1000) / 1000}`;

const pointToSegmentDistanceMetres = (
  point: Coordinate2D,
  segmentStart: Coordinate2D,
  segmentEnd: Coordinate2D,
): number => {
  const [px, py] = point;
  const [ax, ay] = segmentStart;
  const [bx, by] = segmentEnd;
  const deltaX = bx - ax;
  const deltaY = by - ay;
  const segmentLengthSquared = deltaX * deltaX + deltaY * deltaY;

  if (segmentLengthSquared <= GEOMETRY_EPSILON) {
    return Math.hypot(px - ax, py - ay);
  }

  const projection =
    ((px - ax) * deltaX + (py - ay) * deltaY) / segmentLengthSquared;
  const clampedProjection = Math.max(0, Math.min(1, projection));
  const closestX = ax + clampedProjection * deltaX;
  const closestY = ay + clampedProjection * deltaY;

  return Math.hypot(px - closestX, py - closestY);
};

const getOrientation = (
  pointA: Coordinate2D,
  pointB: Coordinate2D,
  pointC: Coordinate2D,
): number => {
  const orientationValue =
    (pointB[1] - pointA[1]) * (pointC[0] - pointB[0]) -
    (pointB[0] - pointA[0]) * (pointC[1] - pointB[1]);

  if (Math.abs(orientationValue) <= GEOMETRY_EPSILON) {
    return 0;
  }

  return orientationValue > 0 ? 1 : 2;
};

const isPointOnSegment = (
  point: Coordinate2D,
  segmentStart: Coordinate2D,
  segmentEnd: Coordinate2D,
): boolean => {
  return (
    point[0] <= Math.max(segmentStart[0], segmentEnd[0]) + GEOMETRY_EPSILON &&
    point[0] >= Math.min(segmentStart[0], segmentEnd[0]) - GEOMETRY_EPSILON &&
    point[1] <= Math.max(segmentStart[1], segmentEnd[1]) + GEOMETRY_EPSILON &&
    point[1] >= Math.min(segmentStart[1], segmentEnd[1]) - GEOMETRY_EPSILON
  );
};

const doSegmentsIntersect = (
  firstStart: Coordinate2D,
  firstEnd: Coordinate2D,
  secondStart: Coordinate2D,
  secondEnd: Coordinate2D,
): boolean => {
  const firstOrientation = getOrientation(firstStart, firstEnd, secondStart);
  const secondOrientation = getOrientation(firstStart, firstEnd, secondEnd);
  const thirdOrientation = getOrientation(secondStart, secondEnd, firstStart);
  const fourthOrientation = getOrientation(secondStart, secondEnd, firstEnd);

  if (
    firstOrientation !== secondOrientation &&
    thirdOrientation !== fourthOrientation
  ) {
    return true;
  }

  if (
    firstOrientation === 0 &&
    isPointOnSegment(secondStart, firstStart, firstEnd)
  ) {
    return true;
  }

  if (
    secondOrientation === 0 &&
    isPointOnSegment(secondEnd, firstStart, firstEnd)
  ) {
    return true;
  }

  if (
    thirdOrientation === 0 &&
    isPointOnSegment(firstStart, secondStart, secondEnd)
  ) {
    return true;
  }

  return (
    fourthOrientation === 0 &&
    isPointOnSegment(firstEnd, secondStart, secondEnd)
  );
};

const getSegmentDistanceMetres = (
  firstStart: Coordinate2D,
  firstEnd: Coordinate2D,
  secondStart: Coordinate2D,
  secondEnd: Coordinate2D,
): number => {
  if (
    pointsEqual(firstStart, secondStart) ||
    pointsEqual(firstStart, secondEnd) ||
    pointsEqual(firstEnd, secondStart) ||
    pointsEqual(firstEnd, secondEnd) ||
    doSegmentsIntersect(firstStart, firstEnd, secondStart, secondEnd)
  ) {
    return 0;
  }

  return Math.min(
    pointToSegmentDistanceMetres(firstStart, secondStart, secondEnd),
    pointToSegmentDistanceMetres(firstEnd, secondStart, secondEnd),
    pointToSegmentDistanceMetres(secondStart, firstStart, firstEnd),
    pointToSegmentDistanceMetres(secondEnd, firstStart, firstEnd),
  );
};

const getPolygonSegments = (
  polygonCoordinates: number[][][],
): Array<[Coordinate2D, Coordinate2D]> => {
  const segments: Array<[Coordinate2D, Coordinate2D]> = [];

  polygonCoordinates.forEach((ring) => {
    for (let index = 1; index < ring.length; index += 1) {
      segments.push([
        ring[index - 1] as Coordinate2D,
        ring[index] as Coordinate2D,
      ]);
    }
  });

  return segments;
};

const getRingArea = (ring: number[][]): number => {
  let area = 0;

  for (let index = 0; index < ring.length - 1; index += 1) {
    const [currentX, currentY] = ring[index];
    const [nextX, nextY] = ring[index + 1];
    area += currentX * nextY - nextX * currentY;
  }

  return Math.abs(area / 2);
};

const isRingContainedWithinRing = (
  innerRing: number[][],
  outerRing: number[][],
): boolean => {
  try {
    return turf.booleanPointInPolygon(turf.point(innerRing[0]), {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [outerRing],
      },
    } as any);
  } catch {
    return false;
  }
};

const splitPolygonCoordinatesIntoParts = (
  polygonCoordinates: number[][][],
): number[][][][] => {
  if (polygonCoordinates.length <= 1) {
    return [polygonCoordinates];
  }

  const sortedRings = [...polygonCoordinates]
    .map((ring) => ({ ring, area: getRingArea(ring) }))
    .sort((first, second) => second.area - first.area);

  const polygonParts: Array<{
    outerRing: number[][];
    holes: number[][][];
  }> = [];

  sortedRings.forEach(({ ring }) => {
    const containingPart = polygonParts.find((polygonPart) =>
      isRingContainedWithinRing(ring, polygonPart.outerRing),
    );

    if (containingPart) {
      containingPart.holes.push(ring);
      return;
    }

    polygonParts.push({ outerRing: ring, holes: [] });
  });

  return polygonParts.map((polygonPart) => [
    polygonPart.outerRing,
    ...polygonPart.holes,
  ]);
};

const getPolygonPartReferences = (
  feature: any,
  featureIndex: number,
): PolygonPartReference[] => {
  const geometry = feature?.geometry;

  if (geometry?.type === 'Polygon') {
    return splitPolygonCoordinatesIntoParts(
      geometry.coordinates as number[][][],
    ).map((polygonCoordinates, polygonIndex) => ({
      featureIndex,
      polygonIndex: polygonIndex + 1,
      sourceGeometryType: 'Polygon',
      feature: {
        ...feature,
        geometry: {
          type: 'Polygon',
          coordinates: polygonCoordinates,
        },
      },
    }));
  }

  if (geometry?.type === 'MultiPolygon') {
    return (geometry.coordinates as number[][][][]).map(
      (polygonCoordinates, polygonIndex) => ({
        featureIndex,
        polygonIndex: polygonIndex + 1,
        sourceGeometryType: 'MultiPolygon',
        feature: {
          ...feature,
          geometry: {
            type: 'Polygon',
            coordinates: polygonCoordinates,
          },
        },
      }),
    );
  }

  return [];
};

const formatPolygonPartLabel = (polygonPart: PolygonPartReference): string => {
  const isSinglePolygonFeature =
    polygonPart.sourceGeometryType === 'Polygon' &&
    polygonPart.polygonIndex === 1;

  return isSinglePolygonFeature
    ? `Feature #${polygonPart.featureIndex + 1}`
    : `Feature #${polygonPart.featureIndex + 1} polygon #${polygonPart.polygonIndex}`;
};

const getLinePartReferences = (
  feature: any,
  featureIndex: number,
): LinePartReference[] => {
  const geometry = feature?.geometry;

  if (geometry?.type === 'LineString') {
    return [
      {
        featureIndex,
        lineIndex: 1,
        sourceGeometryType: 'LineString',
        feature,
      },
    ];
  }

  if (geometry?.type === 'MultiLineString') {
    return (geometry.coordinates as number[][][]).map(
      (lineCoordinates, lineIndex) => ({
        featureIndex,
        lineIndex: lineIndex + 1,
        sourceGeometryType: 'MultiLineString',
        feature: {
          ...feature,
          geometry: {
            type: 'LineString',
            coordinates: lineCoordinates,
          },
        },
      }),
    );
  }

  return [];
};

const formatLinePartLabel = (linePart: LinePartReference): string => {
  const isSingleLineFeature =
    linePart.sourceGeometryType === 'LineString' && linePart.lineIndex === 1;

  return isSingleLineFeature
    ? `Feature #${linePart.featureIndex + 1}`
    : `Feature #${linePart.featureIndex + 1} line #${linePart.lineIndex}`;
};

const normalizeLineSignature = (coordinates: number[][]): string => {
  const toPathKey = (path: number[][]): string =>
    path
      .map((coordinate) => toCoordinateKey(coordinate as Coordinate2D))
      .join('|');

  const forwardKey = toPathKey(coordinates);
  const reverseKey = toPathKey([...coordinates].reverse());

  return forwardKey < reverseKey ? forwardKey : reverseKey;
};

const cleanLineFeature = (lineFeature: any): any => {
  try {
    return turf.cleanCoords(lineFeature as any);
  } catch {
    return lineFeature;
  }
};

const getPointReferences = (
  feature: any,
  featureIndex: number,
): PointReference[] => {
  const geometry = feature?.geometry;

  if (geometry?.type === 'Point') {
    return [
      {
        featureIndex,
        pointIndex: 1,
        sourceGeometryType: 'Point',
        coordinate: geometry.coordinates as Coordinate2D,
      },
    ];
  }

  if (geometry?.type === 'MultiPoint') {
    return (geometry.coordinates as number[][]).map(
      (coordinate, pointIndex) => ({
        featureIndex,
        pointIndex: pointIndex + 1,
        sourceGeometryType: 'MultiPoint',
        coordinate: coordinate as Coordinate2D,
      }),
    );
  }

  return [];
};

const formatPointLabel = (pointReference: PointReference): string => {
  const isSinglePointFeature =
    pointReference.sourceGeometryType === 'Point' &&
    pointReference.pointIndex === 1;

  return isSinglePointFeature
    ? `Feature #${pointReference.featureIndex + 1}`
    : `Feature #${pointReference.featureIndex + 1} point #${pointReference.pointIndex}`;
};

const polygonsOverlap = (firstPolygon: any, secondPolygon: any): boolean => {
  return (
    turf.booleanOverlap(firstPolygon, secondPolygon) ||
    turf.booleanContains(firstPolygon, secondPolygon) ||
    turf.booleanWithin(firstPolygon, secondPolygon) ||
    turf.booleanEqual(firstPolygon, secondPolygon)
  );
};

const getPolygonPartDistanceMetres = (
  firstPolygon: any,
  secondPolygon: any,
): number => {
  const firstSegments = getPolygonSegments(firstPolygon.geometry.coordinates);
  const secondSegments = getPolygonSegments(secondPolygon.geometry.coordinates);
  let minimumDistance = Number.POSITIVE_INFINITY;

  firstSegments.forEach(([firstStart, firstEnd]) => {
    secondSegments.forEach(([secondStart, secondEnd]) => {
      minimumDistance = Math.min(
        minimumDistance,
        getSegmentDistanceMetres(firstStart, firstEnd, secondStart, secondEnd),
      );
    });
  });

  return Number.isFinite(minimumDistance) ? minimumDistance : 0;
};

const ensureRingClosure = (ring: number[][]): boolean => {
  if (!ring.length) return false;
  const first = ring[0];
  const last = ring[ring.length - 1];
  return first[0] === last[0] && first[1] === last[1];
};

const pushGeometryError = (issues: ValidationIssue[], message: string) => {
  issues.push({
    type: 'GEOMETRY',
    severity: 'ERROR',
    message,
  });
};

const validatePolygonLikeGeometry = (
  feature: any,
  geometry: any,
  featureIndex: number,
  issues: ValidationIssue[],
) => {
  const areaSqMetres = turf.area(feature as any);
  if (areaSqMetres <= ZERO_METRIC_EPSILON) {
    pushGeometryError(
      issues,
      `Feature #${featureIndex + 1} has zero or near-zero polygon area.`,
    );
  }

  if (geometry.type === 'Polygon') {
    (geometry.coordinates as number[][][]).forEach((ring, ringIndex) => {
      if (!ensureRingClosure(ring)) {
        pushGeometryError(
          issues,
          `Feature #${featureIndex + 1} ring #${ringIndex + 1}: LinearRing is not closed.`,
        );
      }
    });
    return;
  }

  if (geometry.type === 'MultiPolygon') {
    (geometry.coordinates as number[][][][]).forEach((poly, polyIndex) => {
      poly.forEach((ring, ringIndex) => {
        if (!ensureRingClosure(ring)) {
          pushGeometryError(
            issues,
            `Feature #${featureIndex + 1} polygon #${polyIndex + 1} ring #${ringIndex + 1}: LinearRing is not closed.`,
          );
        }
      });
    });
  }
};

function detectSourceCrs(featureCollection: any, fallback: string): string {
  const crsName = featureCollection?.crs?.properties?.name;
  if (typeof crsName === 'string') {
    return crsName.replace(/^urn:ogc:def:crs:/i, '').replaceAll('::', ':');
  }

  return fallback;
}

function checkExtentWithinBc(feature: any): boolean {
  const bounds = turf.bbox(feature);
  const [minX, minY, maxX, maxY] = bounds;
  return (
    minX >= BC_EXTENT_3005.minX &&
    maxX <= BC_EXTENT_3005.maxX &&
    minY >= BC_EXTENT_3005.minY &&
    maxY <= BC_EXTENT_3005.maxY
  );
}

function validateFeatureGeometry(
  feature: any,
  index: number,
  options: GeometryValidationOptions,
  issues: ValidationIssue[],
): number {
  const geometry = feature?.geometry;
  if (!geometry) {
    issues.push({
      type: 'GEOMETRY',
      severity: 'ERROR',
      message: `Feature #${index + 1} has no geometry.`,
    });
    return 0;
  }

  if (hasNonFiniteCoordinates(geometry.coordinates)) {
    issues.push({
      type: 'GEOMETRY',
      severity: 'ERROR',
      message: `Feature #${index + 1} contains NaN or Infinity coordinate values.`,
    });
    return 0;
  }

  const vertexCount = countVertices(geometry.coordinates);
  if (vertexCount > MAX_VERTEX_COUNT_PER_FEATURE) {
    issues.push({
      type: 'GEOMETRY',
      severity: 'ERROR',
      message: `Feature #${index + 1} vertex count (${vertexCount}) exceeds per-feature limit (${MAX_VERTEX_COUNT_PER_FEATURE}).`,
    });
  }

  if (hasDuplicateConsecutiveVertices(geometry.coordinates)) {
    issues.push({
      type: 'GEOMETRY',
      severity: 'ERROR',
      message: `Feature #${index + 1} contains duplicate consecutive vertices.`,
    });
  }

  try {
    const kinks = turf.kinks(feature as any);
    if (kinks.features.length > 0) {
      issues.push({
        type: 'GEOMETRY',
        severity: 'ERROR',
        message: `Feature #${index + 1}: self-intersections/bow-tie detected.`,
      });
    }
  } catch {
    // Turf may not process all geometry kinds for kink checks.
  }

  if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
    validatePolygonLikeGeometry(feature, geometry, index, issues);
  }

  if (geometry.type === 'LineString' || geometry.type === 'MultiLineString') {
    const lineLengthMetres = turf.length(feature as any, { units: 'meters' });
    if (lineLengthMetres <= ZERO_METRIC_EPSILON) {
      issues.push({
        type: 'GEOMETRY',
        severity: 'ERROR',
        message: `Feature #${index + 1} has zero or near-zero line length.`,
      });
    }
  }

  if (!checkExtentWithinBc(feature)) {
    issues.push({
      type: 'EXTENT',
      severity: 'WARNING',
      message: `Feature #${index + 1} coordinates appear to be outside typical BC bounds. Verify the coordinate system is EPSG:3005.`,
      code: 'EXTENT_VERIFICATION_RECOMMENDED',
    });
  }

  return vertexCount;
}

function validatePolygonRelationships(
  polygonParts: PolygonPartReference[],
  hasMultiplePolygonRecords: boolean,
  issues: ValidationIssue[],
) {
  if (polygonParts.length <= 1 || hasMultiplePolygonRecords) {
    return;
  }

  for (let firstIndex = 0; firstIndex < polygonParts.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < polygonParts.length;
      secondIndex += 1
    ) {
      const firstPolygonPart = polygonParts[firstIndex];
      const secondPolygonPart = polygonParts[secondIndex];

      if (firstPolygonPart.featureIndex === secondPolygonPart.featureIndex) {
        continue;
      }

      const firstLabel = formatPolygonPartLabel(firstPolygonPart);
      const secondLabel = formatPolygonPartLabel(secondPolygonPart);

      if (
        polygonsOverlap(firstPolygonPart.feature, secondPolygonPart.feature)
      ) {
        console.info('[SPATIAL VALIDATION]', {
          kind: 'polygon-pair-check',
          first: firstLabel,
          second: secondLabel,
          overlap: true,
          distanceMetres: 0,
          maxAllowedDistanceMetres: MAX_POLYGON_PART_SEPARATION_METRES,
        });

        issues.push({
          type: 'TOPOLOGY',
          severity: 'ERROR',
          message: `${firstLabel} overlaps ${secondLabel}. Polygon areas must not overlap.`,
          code: 'POLYGON_OVERLAP',
        });
        continue;
      }

      const distanceMetres = getPolygonPartDistanceMetres(
        firstPolygonPart.feature,
        secondPolygonPart.feature,
      );

      console.info('[SPATIAL VALIDATION]', {
        kind: 'polygon-pair-check',
        first: firstLabel,
        second: secondLabel,
        overlap: false,
        distanceMetres: Math.round(distanceMetres * 100) / 100,
        maxAllowedDistanceMetres: MAX_POLYGON_PART_SEPARATION_METRES,
      });

      if (distanceMetres > MAX_POLYGON_PART_SEPARATION_METRES) {
        issues.push({
          type: 'TOPOLOGY',
          severity: 'ERROR',
          message: `Distance between ${firstLabel} and ${secondLabel} (${Math.round(distanceMetres)}m) exceeds ${MAX_POLYGON_PART_SEPARATION_METRES}m.`,
          code: 'POLYGON_SEPARATION_EXCEEDED',
        });
      }
    }
  }
}

function validateLineRelationships(
  lineParts: LinePartReference[],
  issues: ValidationIssue[],
) {
  if (lineParts.length <= 1) {
    return;
  }

  for (let firstIndex = 0; firstIndex < lineParts.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < lineParts.length;
      secondIndex += 1
    ) {
      const firstLine = lineParts[firstIndex];
      const secondLine = lineParts[secondIndex];
      const cleanedFirstLine = cleanLineFeature(firstLine.feature);
      const cleanedSecondLine = cleanLineFeature(secondLine.feature);
      const firstCoordinates = cleanedFirstLine?.geometry
        ?.coordinates as number[][];
      const secondCoordinates = cleanedSecondLine?.geometry
        ?.coordinates as number[][];
      const signaturesMatch =
        normalizeLineSignature(firstCoordinates) ===
        normalizeLineSignature(secondCoordinates);

      if (
        signaturesMatch ||
        turf.booleanEqual(cleanedFirstLine as any, cleanedSecondLine as any)
      ) {
        issues.push({
          type: 'TOPOLOGY',
          severity: 'ERROR',
          message: `${formatLinePartLabel(secondLine)} duplicates ${formatLinePartLabel(firstLine)}.`,
          code: 'LINE_DUPLICATE',
        });
      }
    }
  }
}

function validateOverlappingNodes(
  pointReferences: PointReference[],
  issues: ValidationIssue[],
) {
  if (pointReferences.length <= 1) {
    return;
  }

  const referencesByCoordinate = new Map<string, PointReference[]>();

  pointReferences.forEach((pointReference) => {
    const coordinateKey = toCoordinateKey(pointReference.coordinate);
    const referencesAtCoordinate =
      referencesByCoordinate.get(coordinateKey) ?? [];
    referencesAtCoordinate.push(pointReference);
    referencesByCoordinate.set(coordinateKey, referencesAtCoordinate);
  });

  referencesByCoordinate.forEach((referencesAtCoordinate) => {
    if (referencesAtCoordinate.length <= 1) {
      return;
    }

    const labels = referencesAtCoordinate.map(formatPointLabel);
    const [firstReference] = referencesAtCoordinate;

    issues.push({
      type: 'TOPOLOGY',
      severity: 'ERROR',
      message: `Overlapping nodes detected at (${formatCoordinate(firstReference.coordinate)}): ${labels.join(', ')}.`,
      code: 'NODE_OVERLAP',
    });
  });
}

export function validateGeometry(
  featureCollection: any,
  options: GeometryValidationOptions,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const features: any[] = featureCollection?.features ?? [];
  const sourceCrs = detectSourceCrs(featureCollection, options.expectedSrsName);
  let totalVertices = 0;
  let geometryTypeMismatchCount = 0;
  const mismatchedGeometryTypes = new Set<string>();

  if (!features.length) {
    return [
      {
        type: 'GEOMETRY',
        severity: 'ERROR',
        message: 'Shapefile contains no feature geometries.',
      },
    ];
  }

  if (options.enforceExpectedSrsName && sourceCrs !== options.expectedSrsName) {
    issues.push({
      type: 'CRS',
      severity: 'WARNING',
      message: `Source CRS (${sourceCrs}) does not match expected ${options.expectedSrsName}. Reprojection may be required.`,
      code: 'CRS_MISMATCH',
    });
  }

  if (features.length > MAX_FEATURE_COUNT) {
    issues.push({
      type: 'GEOMETRY',
      severity: 'ERROR',
      message: `Feature count (${features.length}) exceeds limit (${MAX_FEATURE_COUNT}).`,
    });
  }

  features.forEach((feature, index) => {
    const geometry = feature?.geometry;
    const normalizedGeometryType = normalizeGeometryType(geometry?.type);

    if (
      geometry &&
      options.expectedGeometryType &&
      normalizedGeometryType !== options.expectedGeometryType
    ) {
      geometryTypeMismatchCount += 1;
      mismatchedGeometryTypes.add(geometry.type ?? 'Unknown');
    }

    totalVertices += validateFeatureGeometry(feature, index, options, issues);
  });

  const polygonParts = features.flatMap((feature, index) =>
    getPolygonPartReferences(feature, index),
  );
  const lineParts = features.flatMap((feature, index) =>
    getLinePartReferences(feature, index),
  );
  const pointReferences = features.flatMap((feature, index) =>
    getPointReferences(feature, index),
  );

  features.forEach((feature, index) => {
    if (
      feature?.geometry?.type === 'Polygon' &&
      getPolygonPartReferences(feature, index).length > 1
    ) {
      issues.push({
        type: 'TOPOLOGY',
        severity: 'ERROR',
        message: `Feature #${index + 1} is a Polygon with multiple disjoint parts. Use MultiPolygon instead.`,
        code: 'POLYGON_REQUIRES_MULTIPOLYGON',
      });
    }
  });

  const polygonRecordCount = features.filter((feature) =>
    ['Polygon', 'MultiPolygon'].includes(feature?.geometry?.type),
  ).length;
  const hasMultiplePolygonRecords =
    polygonRecordCount > 1 &&
    (!options.expectedGeometryType ||
      options.expectedGeometryType === 'Polygon');

  if (hasMultiplePolygonRecords) {
    issues.push({
      type: 'TOPOLOGY',
      severity: 'ERROR',
      message: `The file contains ${polygonRecordCount} separate polygon records. Combine them into a single MultiPolygon record (one record per REC).`,
      code: 'MULTIPLE_POLYGON_FEATURES',
    });
  }

  validatePolygonRelationships(polygonParts, hasMultiplePolygonRecords, issues);
  validateLineRelationships(lineParts, issues);
  validateOverlappingNodes(pointReferences, issues);

  if (totalVertices > MAX_TOTAL_VERTEX_COUNT) {
    issues.push({
      type: 'GEOMETRY',
      severity: 'ERROR',
      message: `Total vertex count (${totalVertices}) exceeds file limit (${MAX_TOTAL_VERTEX_COUNT}).`,
    });
  }

  if (geometryTypeMismatchCount > 0 && options.expectedGeometryType) {
    const actualTypes = Array.from(mismatchedGeometryTypes).join(', ');
    issues.push({
      type: 'GEOMETRY',
      severity: 'ERROR',
      message: `${geometryTypeMismatchCount} feature(s) have geometry type (${actualTypes}) but expected ${options.expectedGeometryType}.`,
    });
  }

  return issues;
}
