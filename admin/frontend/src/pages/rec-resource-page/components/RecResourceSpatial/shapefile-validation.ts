import * as shapefile from 'shapefile';
import * as turf from '@turf/turf';
import shp from 'shpjs';

export const ACTION_CODES = ['I', 'U'] as const;
export const ACCURACY_CODES = ['1', '5', '10', '100', '1000'] as const;
export const CAPTURE_METHODS = ['GPS', 'DIGITIZE', 'Ortho', 'Mono'] as const;
export const DATA_SOURCES = [
  'AirPhoto',
  'TRIM',
  'Satellite',
  'Survey',
  'Unknown',
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9]{10}$/;
const ALPHANUMERIC_PATTERN = /^[A-Za-z0-9 ._\-#/]*$/;
const BC_EXTENT_3005 = {
  // Expanded to accommodate various coordinate systems including WGS84 variations
  minX: -180,
  maxX: 3000000,
  minY: -90,
  maxY: 3000000,
};

export type ValidationType = 'METADATA' | 'ATTRIBUTE' | 'GEOMETRY';
export type ValidationSeverity = 'ERROR' | 'WARNING';

export interface ValidationIssue {
  type: ValidationType;
  severity: ValidationSeverity;
  message: string;
}

export interface SubmissionMetadata {
  email: string;
  telephone: string;
  contactName: string;
  districtCode: string;
  recreationDistrict: string;
  licenseRecNumber: string;
  rootNamespace: string;
  businessNamespace: string;
  actionCode: string;
  accuracyCode: string;
  captureMethod: string;
  dataSource: string;
}

interface GeometryValidationOptions {
  expectedSrsName: string;
  enforceExpectedSrsName: boolean;
  expectedGeometryType?: 'Point' | 'LineString' | 'Polygon';
}

const SHAPEFILE_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_FEATURE_COUNT = 5000;
const MAX_TOTAL_VERTEX_COUNT = 200000;
const MAX_VERTEX_COUNT_PER_FEATURE = 50000;
const MAX_POLYGON_PART_SEPARATION_METRES = 500;
const ZERO_METRIC_EPSILON = 0.0001;
const SHAPEFILE_ALLOWED_EXTENSIONS = ['shp', 'dbf', 'zip'] as const;
const REQUIRED_SHP_FILE_MESSAGE = 'A .shp file is required.';
const SHAPEFILE_BASENAME_MISMATCH_MESSAGE =
  'The .dbf filename must match the uploaded .shp filename.';
const SECTION_ID_FIELD_CANDIDATES = [
  'sectionid',
  'section_id',
  'section',
  'segmentid',
  'segment_id',
  'segment',
] as const;
const MAP_LABEL_FIELD_CANDIDATES = ['maplabel', 'map_label'] as const;

const normalizeSelectedFiles = (input: File | File[] | FileList): File[] => {
  if (input instanceof File) {
    return [input];
  }

  if (typeof FileList !== 'undefined' && input instanceof FileList) {
    return Array.from(input);
  }

  return Array.from(input);
};

const validateSelectedShapefilePart = (file: File): string => {
  const normalizedFileName = file.name.trim().toLowerCase();
  const extension = normalizedFileName.split('.').pop()?.toLowerCase();

  if (
    !extension ||
    !SHAPEFILE_ALLOWED_EXTENSIONS.includes(
      extension as (typeof SHAPEFILE_ALLOWED_EXTENSIONS)[number],
    ) ||
    normalizedFileName.includes('.shp.') ||
    normalizedFileName.endsWith('.shp.exe')
  ) {
    throw new Error(
      'Upload either one .zip shapefile bundle or .shp with an optional matching .dbf.',
    );
  }

  if (file.size > SHAPEFILE_MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `Spatial file exceeds ${Math.round(SHAPEFILE_MAX_FILE_SIZE_BYTES / (1024 * 1024))}MB limit.`,
    );
  }

  return extension;
};

const getNormalizedExtension = (file: File): string | null => {
  const normalizedFileName = file.name.trim().toLowerCase();
  return normalizedFileName.split('.').pop()?.toLowerCase() ?? null;
};

const getNormalizedStem = (fileName: string): string =>
  fileName
    .trim()
    .toLowerCase()
    .replace(/\.[^.]+$/, '');

const normalizeFieldKey = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

interface ParsedFeatureCollection {
  type: 'FeatureCollection';
  crs?: any;
  bbox?: any;
  features: any[];
}

const isFeatureCollection = (value: any): value is ParsedFeatureCollection =>
  value?.type === 'FeatureCollection' && Array.isArray(value?.features);

const normalizeParsedFeatureCollection = (featureCollection: any): any => {
  if (!isFeatureCollection(featureCollection)) {
    throw new Error(
      'Uploaded archive did not contain a valid shapefile layer.',
    );
  }

  return {
    type: 'FeatureCollection',
    crs: featureCollection.crs ?? {
      type: 'name',
      properties: { name: 'EPSG:3005' },
    },
    bbox: featureCollection.bbox,
    features: featureCollection.features,
  };
};

const normalizeZipSpatialData = (zipParsedData: any): any => {
  if (isFeatureCollection(zipParsedData)) {
    return normalizeParsedFeatureCollection(zipParsedData);
  }

  if (Array.isArray(zipParsedData)) {
    const featureCollections = zipParsedData.filter(
      (entry): entry is ParsedFeatureCollection => isFeatureCollection(entry),
    );
    if (!featureCollections.length) {
      throw new Error(
        'No shapefile layers were found in the uploaded .zip file.',
      );
    }

    return {
      type: 'FeatureCollection',
      crs: featureCollections[0]?.crs ?? {
        type: 'name',
        properties: { name: 'EPSG:3005' },
      },
      features: featureCollections.flatMap(
        (entry: ParsedFeatureCollection) => entry.features ?? [],
      ),
    };
  }

  if (zipParsedData && typeof zipParsedData === 'object') {
    const featureCollections = Object.values(
      zipParsedData as Record<string, unknown>,
    ).filter((entry): entry is ParsedFeatureCollection =>
      isFeatureCollection(entry),
    );
    if (!featureCollections.length) {
      throw new Error(
        'No shapefile layers were found in the uploaded .zip file.',
      );
    }

    return {
      type: 'FeatureCollection',
      crs: featureCollections[0]?.crs ?? {
        type: 'name',
        properties: { name: 'EPSG:3005' },
      },
      features: featureCollections.flatMap(
        (entry: ParsedFeatureCollection) => entry.features ?? [],
      ),
    };
  }

  throw new Error('Unable to parse uploaded .zip shapefile bundle.');
};

const pickSectionIdFieldName = (features: any[]): string | null => {
  const allPropertyKeys = Array.from(
    new Set(
      features.flatMap((feature) =>
        Object.keys(feature?.properties ?? {}).filter((key) => key.trim()),
      ),
    ),
  );

  if (!allPropertyKeys.length) {
    return null;
  }

  for (const candidate of SECTION_ID_FIELD_CANDIDATES) {
    const matchedKey = allPropertyKeys.find(
      (propertyKey) => normalizeFieldKey(propertyKey) === candidate,
    );
    if (matchedKey) {
      return matchedKey;
    }
  }

  return (
    allPropertyKeys.find((propertyKey) => {
      const normalizedKey = normalizeFieldKey(propertyKey);
      return (
        (normalizedKey.includes('section') && normalizedKey.includes('id')) ||
        (normalizedKey.includes('segment') && normalizedKey.includes('id'))
      );
    }) ?? null
  );
};

const pickMapLabelFieldName = (features: any[]): string | null => {
  const allPropertyKeys = Array.from(
    new Set(
      features.flatMap((feature) =>
        Object.keys(feature?.properties ?? {}).filter((key) => key.trim()),
      ),
    ),
  );

  for (const candidate of MAP_LABEL_FIELD_CANDIDATES) {
    const matchedKey = allPropertyKeys.find(
      (propertyKey) => normalizeFieldKey(propertyKey) === candidate,
    );
    if (matchedKey) {
      return matchedKey;
    }
  }

  return null;
};

export interface SectionIdExtractionResult {
  fieldName: string | null;
  sectionIds: string[];
}

export const extractSectionIdDetails = (
  featureCollection: any,
): SectionIdExtractionResult => {
  const features: any[] = featureCollection?.features ?? [];
  const fieldName = pickSectionIdFieldName(features);

  if (!fieldName) {
    const mapLabelFieldName = pickMapLabelFieldName(features);
    if (mapLabelFieldName) {
      const sectionIdsFromMapLabel = Array.from(
        new Set(
          features
            .map((feature) => feature?.properties?.[mapLabelFieldName])
            .filter((value) => value !== null && value !== undefined)
            .map((value) => String(value).trim())
            .map((value) => value.split(/\s+/).pop() ?? '')
            .filter(Boolean),
        ),
      ).sort((first, second) =>
        first.localeCompare(second, undefined, { numeric: true }),
      );

      if (sectionIdsFromMapLabel.length > 0) {
        return {
          fieldName: mapLabelFieldName,
          sectionIds: sectionIdsFromMapLabel,
        };
      }
    }

    return {
      fieldName: null,
      sectionIds: [],
    };
  }

  const sectionIds = Array.from(
    new Set(
      features
        .map((feature) => feature?.properties?.[fieldName])
        .filter((value) => value !== null && value !== undefined)
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  ).sort((first, second) =>
    first.localeCompare(second, undefined, { numeric: true }),
  );

  return {
    fieldName,
    sectionIds,
  };
};

export async function readSpatialFile(
  input: File | File[] | FileList,
): Promise<any> {
  const selectedFiles = normalizeSelectedFiles(input);

  if (selectedFiles.length === 0) {
    throw new Error(REQUIRED_SHP_FILE_MESSAGE);
  }

  selectedFiles.forEach((file) => {
    validateSelectedShapefilePart(file);
  });

  const filesByExtension = selectedFiles.reduce<Record<string, File[]>>(
    (accumulator, file) => {
      const extension = getNormalizedExtension(file);
      if (!extension) {
        return accumulator;
      }

      accumulator[extension] ??= [];
      accumulator[extension].push(file);
      return accumulator;
    },
    {},
  );

  const shpFiles = filesByExtension.shp ?? [];
  const dbfFiles = filesByExtension.dbf ?? [];
  const zipFiles = filesByExtension.zip ?? [];
  if (zipFiles.length > 1) {
    throw new Error('Please upload only one .zip file at a time.');
  }
  if (zipFiles.length === 1 && selectedFiles.length > 1) {
    throw new Error(
      'Upload either one .zip file or .shp/.dbf files, not both.',
    );
  }

  if (zipFiles.length === 1) {
    const [zipFile] = zipFiles;
    const zipArrayBuffer = await zipFile.arrayBuffer();
    const zipParsedData = await shp(zipArrayBuffer);
    const normalizedFeatureCollection = normalizeZipSpatialData(zipParsedData);

    if (!normalizedFeatureCollection.features?.length) {
      throw new Error('No features found in uploaded .zip shapefile bundle.');
    }

    const hasAttributeProperties = normalizedFeatureCollection.features.some(
      (feature: any) => Object.keys(feature?.properties ?? {}).length > 0,
    );
    if (!hasAttributeProperties) {
      throw new Error(
        'Zip parsed geometry but no attributes were found. Ensure the .zip contains a matching .dbf (and optional .cpg) with the same basename as the .shp.',
      );
    }

    return normalizedFeatureCollection;
  }

  if (shpFiles.length === 0) {
    throw new Error(REQUIRED_SHP_FILE_MESSAGE);
  }
  if (shpFiles.length > 1) {
    throw new Error('Please upload only one .shp file at a time.');
  }
  if (dbfFiles.length > 1) {
    throw new Error('Please upload only one .dbf file at a time.');
  }

  const [file] = shpFiles;
  const [dbfFile] = dbfFiles;

  if (dbfFile) {
    const shpStem = getNormalizedStem(file.name);
    const dbfStem = getNormalizedStem(dbfFile.name);
    if (shpStem !== dbfStem) {
      throw new Error(SHAPEFILE_BASENAME_MISMATCH_MESSAGE);
    }
  }

  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength < 100) {
    throw new Error('Invalid shapefile: header is incomplete.');
  }

  const headerView = new DataView(arrayBuffer, 0, 100);
  const shapefileMagic = headerView.getInt32(0, false);
  if (shapefileMagic !== 9994) {
    throw new Error('Invalid shapefile signature (magic number mismatch).');
  }

  const headerBoundingBox = {
    minX: headerView.getFloat64(36, true),
    minY: headerView.getFloat64(44, true),
    maxX: headerView.getFloat64(52, true),
    maxY: headerView.getFloat64(60, true),
  };

  const headerHasFiniteNumbers = Object.values(headerBoundingBox).every((v) =>
    Number.isFinite(v),
  );
  if (!headerHasFiniteNumbers) {
    throw new Error('Invalid shapefile header bbox: contains NaN or Infinity.');
  }

  const headerLikelyWithinBc =
    headerBoundingBox.minX >= BC_EXTENT_3005.minX &&
    headerBoundingBox.maxX <= BC_EXTENT_3005.maxX &&
    headerBoundingBox.minY >= BC_EXTENT_3005.minY &&
    headerBoundingBox.maxY <= BC_EXTENT_3005.maxY;

  if (!headerLikelyWithinBc) {
    throw new Error(
      'Shapefile header extent lies outside supported BC bounds (EPSG:3005).',
    );
  }

  const dbfArrayBuffer = dbfFile ? await dbfFile.arrayBuffer() : undefined;
  const source = await shapefile.open(arrayBuffer, dbfArrayBuffer);
  const features: any[] = [];

  while (true) {
    const { done, value } = await source.read();
    if (done) break;

    features.push({
      type: 'Feature',
      properties: value?.properties ?? {},
      geometry: value?.geometry ?? value,
    });
  }

  if (!features.length) {
    throw new Error('No features found in shapefile.');
  }

  return {
    type: 'FeatureCollection',
    crs: { type: 'name', properties: { name: 'EPSG:3005' } },
    bbox: [
      headerBoundingBox.minX,
      headerBoundingBox.minY,
      headerBoundingBox.maxX,
      headerBoundingBox.maxY,
    ],
    features,
  };
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

const GEOMETRY_EPSILON = 1e-9;

const pointsEqual = (a: Coordinate2D, b: Coordinate2D): boolean =>
  Math.abs(a[0] - b[0]) <= GEOMETRY_EPSILON &&
  Math.abs(a[1] - b[1]) <= GEOMETRY_EPSILON;

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

function validateAlphaNumericLength(
  value: string,
  max: number,
  fieldName: string,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (value.length > max) {
    issues.push({
      type: 'ATTRIBUTE',
      severity: 'ERROR',
      message: `${fieldName} exceeds AlphaNumeric${max} length.`,
    });
  }

  if (!ALPHANUMERIC_PATTERN.test(value)) {
    issues.push({
      type: 'ATTRIBUTE',
      severity: 'ERROR',
      message: `${fieldName} contains unsupported characters.`,
    });
  }

  return issues;
}

export function validateSubmissionMetadata(
  metadata: SubmissionMetadata,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!EMAIL_PATTERN.test(metadata.email)) {
    issues.push({
      type: 'METADATA',
      severity: 'ERROR',
      message: 'Email address must be a valid email string.',
    });
  }

  if (!PHONE_PATTERN.test(metadata.telephone)) {
    issues.push({
      type: 'METADATA',
      severity: 'ERROR',
      message:
        'Telephone Number must be exactly 10 digits (pattern: [0-9]{10}).',
    });
  }

  if (metadata.rootNamespace !== 'esf') {
    issues.push({
      type: 'METADATA',
      severity: 'ERROR',
      message: 'Root Namespace must be "esf".',
    });
  }

  if (!metadata.businessNamespace.trim()) {
    issues.push({
      type: 'METADATA',
      severity: 'ERROR',
      message: 'Business namespace is required (example: ftc).',
    });
  }

  if (
    !ACTION_CODES.includes(metadata.actionCode as (typeof ACTION_CODES)[number])
  ) {
    issues.push({
      type: 'ATTRIBUTE',
      severity: 'ERROR',
      message: `Action Code must be one of: ${ACTION_CODES.join(', ')}.`,
    });
  }

  if (
    !ACCURACY_CODES.includes(
      metadata.accuracyCode as (typeof ACCURACY_CODES)[number],
    )
  ) {
    issues.push({
      type: 'ATTRIBUTE',
      severity: 'ERROR',
      message: `Accuracy Code must be one of: ${ACCURACY_CODES.join(', ')}.`,
    });
  }

  if (
    !CAPTURE_METHODS.includes(
      metadata.captureMethod as (typeof CAPTURE_METHODS)[number],
    )
  ) {
    issues.push({
      type: 'ATTRIBUTE',
      severity: 'ERROR',
      message: `Capture Method must be one of: ${CAPTURE_METHODS.join(', ')}.`,
    });
  }

  if (
    !DATA_SOURCES.includes(metadata.dataSource as (typeof DATA_SOURCES)[number])
  ) {
    issues.push({
      type: 'ATTRIBUTE',
      severity: 'ERROR',
      message: `Data Source must be one of: ${DATA_SOURCES.join(', ')}.`,
    });
  }

  issues.push(
    ...validateAlphaNumericLength(metadata.licenseRecNumber, 10, 'REC#'),
  );
  issues.push(
    ...validateAlphaNumericLength(metadata.districtCode, 50, 'District code'),
  );
  issues.push(
    ...validateAlphaNumericLength(metadata.contactName, 250, 'Contact name'),
  );

  return issues;
}

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

// const validatePolygonLikeGeometry = (
//   feature: any,
//   geometry: any,
//   featureIndex: number,
//   issues: ValidationIssue[],
// ) => {
//   const areaSqMetres = turf.area(feature as any);
//   if (areaSqMetres <= ZERO_METRIC_EPSILON) {
//     pushGeometryError(
//       issues,
//       `Feature #${featureIndex + 1} has zero or near-zero polygon area.`,
//     );
//   }
//
//   if (geometry.type === 'Polygon') {
//     (geometry.coordinates as number[][][]).forEach((ring, ringIndex) => {
//       if (!ensureRingClosure(ring)) {
//         pushGeometryError(
//           issues,
//           `Feature #${featureIndex + 1} ring #${ringIndex + 1}: LinearRing is not closed.`,
//         );
//       }
//     });
//     return;
//   }
//
//   if (geometry.type === 'MultiPolygon') {
//     (geometry.coordinates as number[][][][]).forEach((poly, polyIndex) => {
//       poly.forEach((ring, ringIndex) => {
//         if (!ensureRingClosure(ring)) {
//           pushGeometryError(
//             issues,
//             `Feature #${featureIndex + 1} polygon #${polyIndex + 1} ring #${ringIndex + 1}: LinearRing is not closed.`,
//           );
//         }
//       });
//     });
//   }
// };

function detectSourceCrs(featureCollection: any, fallback: string): string {
  const crsName = featureCollection?.crs?.properties?.name;
  if (typeof crsName === 'string') {
    return crsName.replace(/^urn:ogc:def:crs:/i, '').replace(/::/g, ':');
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
      type: 'GEOMETRY',
      severity: 'WARNING',
      message: `Source CRS (${sourceCrs}) does not match expected ${options.expectedSrsName}. Reprojection may be required.`,
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
    if (!geometry) {
      issues.push({
        type: 'GEOMETRY',
        severity: 'ERROR',
        message: `Feature #${index + 1} has no geometry.`,
      });
      return;
    }

    const normalizedGeometryType = normalizeGeometryType(geometry.type);
    if (
      options.expectedGeometryType &&
      normalizedGeometryType !== options.expectedGeometryType
    ) {
      geometryTypeMismatchCount += 1;
      mismatchedGeometryTypes.add(geometry.type ?? 'Unknown');
    }

    if (hasNonFiniteCoordinates(geometry.coordinates)) {
      issues.push({
        type: 'GEOMETRY',
        severity: 'ERROR',
        message: `Feature #${index + 1} contains NaN or Infinity coordinate values.`,
      });
      return;
    }

    const vertexCount = countVertices(geometry.coordinates);
    totalVertices += vertexCount;
    if (vertexCount > MAX_VERTEX_COUNT_PER_FEATURE) {
      issues.push({
        type: 'GEOMETRY',
        severity: 'ERROR',
        message: `Feature #${index + 1} vertex count (${vertexCount}) exceeds per-feature limit (${MAX_VERTEX_COUNT_PER_FEATURE}).`,
      });
    }

    // --- UPDATED: fast-path topology check via turf.booleanValid -------
    // turf.booleanValid runs a single OGC-style topology check (ring
    // closure, self-intersections / bow-ties, and other degeneracies) and
    // is purely coordinate-based, so it's safe to use on projected
    // EPSG:3005 metres just as it would be on WGS84 degrees. We only fall
    // back to the granular duplicate-vertex / ring-closure / kinks checks
    // below when it reports a problem, so we get specific messages without
    // running turf.kinks (comparatively expensive) on every valid feature.
    let isTopologicallyValid = true;
    try {
      isTopologicallyValid = turf.booleanValid(feature as any);
    } catch {
      // Some geometry types aren't supported by booleanValid; fall back
      // to the manual checks below rather than assuming valid.
      isTopologicallyValid = false;
    }

    if (!isTopologicallyValid) {
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
        (geometry.type === 'Polygon'
          ? (geometry.coordinates as number[][][])
          : (geometry.coordinates as number[][][][]).flat()
        ).forEach((ring: number[][], ringIndex: number) => {
          if (!ensureRingClosure(ring)) {
            pushGeometryError(
              issues,
              `Feature #${index + 1} ring #${ringIndex + 1}: LinearRing is not closed.`,
            );
          }
        });
      }
    }
    // --- end updated block ----------------------------------------------

    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
      const areaSqMetres = turf.area(feature as any);
      if (areaSqMetres <= ZERO_METRIC_EPSILON) {
        pushGeometryError(
          issues,
          `Feature #${index + 1} has zero or near-zero polygon area.`,
        );
      }
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
        type: 'GEOMETRY',
        severity: 'WARNING',
        message: `Feature #${index + 1} coordinates appear to be outside typical BC bounds. Verify the coordinate system is EPSG:3005.`,
      });
    }
  });

  const polygonParts = features.flatMap((feature, index) =>
    getPolygonPartReferences(feature, index),
  );

  if (polygonParts.length > 1) {
    for (
      let firstIndex = 0;
      firstIndex < polygonParts.length;
      firstIndex += 1
    ) {
      for (
        let secondIndex = firstIndex + 1;
        secondIndex < polygonParts.length;
        secondIndex += 1
      ) {
        const firstPolygonPart = polygonParts[firstIndex];
        const secondPolygonPart = polygonParts[secondIndex];
        const firstLabel = formatPolygonPartLabel(firstPolygonPart);
        const secondLabel = formatPolygonPartLabel(secondPolygonPart);

        if (
          polygonsOverlap(firstPolygonPart.feature, secondPolygonPart.feature)
        ) {
          // Debug aid: surface pairwise polygon relationship in browser console.
          console.info('[SPATIAL VALIDATION]', {
            kind: 'polygon-pair-check',
            first: firstLabel,
            second: secondLabel,
            overlap: true,
            distanceMetres: 0,
            maxAllowedDistanceMetres: MAX_POLYGON_PART_SEPARATION_METRES,
          });

          issues.push({
            type: 'GEOMETRY',
            severity: 'ERROR',
            message: `${firstLabel} overlaps ${secondLabel}. Polygon areas must not overlap.`,
          });
          continue;
        }

        // NOTE: intentionally kept as manual planar segment-distance math
        // (not turf.distance / turf.nearestPointOnLine). Those turf helpers
        // assume WGS84 lng/lat input and would silently compute nonsense
        // distances on projected EPSG:3005 metre coordinates like these.
        const distanceMetres = getPolygonPartDistanceMetres(
          firstPolygonPart.feature,
          secondPolygonPart.feature,
        );

        // Debug aid: show computed distance for each polygon pair.
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
            type: 'GEOMETRY',
            severity: 'ERROR',
            message: `Distance between ${firstLabel} and ${secondLabel} (${Math.round(distanceMetres)}m) exceeds ${MAX_POLYGON_PART_SEPARATION_METRES}m.`,
          });
        }
      }
    }
  }

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
