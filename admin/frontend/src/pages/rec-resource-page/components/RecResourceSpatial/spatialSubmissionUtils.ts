import * as shapefile from 'shapefile';
import * as turf from '@turf/turf';
import shp from 'shpjs';
import JSZip from 'jszip';
import proj4 from 'proj4';

// shpjs always reprojects parsed shapefiles to WGS84 (EPSG:4326) before
// returning GeoJSON, per the GeoJSON spec (RFC 7946). The direct .shp/.dbf
// path below (shapefile.open) does NOT reproject — it returns coordinates
// exactly as stored in the file, which for this app's data is BC Albers
// (EPSG:3005) metres. Without reprojecting the shpjs/zip output back to
// EPSG:3005, zip uploads and direct .shp uploads end up in two different
// coordinate systems even though both are labelled "EPSG:3005" downstream,
// which is what was causing the map to render features in the wrong place
// (effectively off-screen) for zip uploads only.
//
// EPSG:3005 (BC Albers) definition must match the one registered for the
// map view in SpatialSubmissionMap.tsx.
proj4.defs(
  'EPSG:3005',
  '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
);
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

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

// Real BC Albers (EPSG:3005) bounds, in metres. Now that both the .shp and
// .zip parsing paths are guaranteed to return genuine EPSG:3005 coordinates
// (see reprojectFeatureCollectionToBcAlbers below), this can be a tight,
// meaningful bounding box again instead of the previous "-180..3000000"
// range that was really just a hack to let WGS84-degrees and Albers-metres
// both slip through the same check.
const BC_EXTENT_3005 = {
  minX: 100000,
  maxX: 1900000,
  minY: 300000,
  maxY: 1750000,
};

export type ValidationType =
  | 'METADATA'
  | 'ATTRIBUTE'
  | 'GEOMETRY'
  | 'CRS'
  | 'FILE_FORMAT'
  | 'EXTENT'
  | 'TOPOLOGY'
  | 'SECTION_ID';

export type ValidationSeverity = 'ERROR' | 'WARNING';

export interface ValidationIssue {
  type: ValidationType;
  severity: ValidationSeverity;
  message: string;
  code?: string; // Optional code for programmatic identification
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
export const DEFAULT_SECTION_ID_FIELD_NAME = 'section_id';
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

// --- CRS reprojection helpers -------------------------------------------
//
// Recursively walks a GeoJSON coordinates array (Point / LineString /
// Polygon / Multi* — any nesting depth) and reprojects every [x, y] pair
// from EPSG:4326 (lon/lat degrees, what shpjs always outputs) to
// EPSG:3005 (BC Albers metres, what the rest of this app assumes).
const reprojectCoordinatesToBcAlbers = (coordinates: any): any => {
  if (
    typeof coordinates?.[0] === 'number' &&
    typeof coordinates?.[1] === 'number'
  ) {
    const [x, y] = proj4('EPSG:4326', 'EPSG:3005', [
      coordinates[0],
      coordinates[1],
    ]);
    // Preserve any additional dimensions (e.g. Z) unchanged, if present.
    return coordinates.length > 2 ? [x, y, ...coordinates.slice(2)] : [x, y];
  }

  return (coordinates ?? []).map(reprojectCoordinatesToBcAlbers);
};

// Reprojects every feature's geometry in a FeatureCollection from
// EPSG:4326 to EPSG:3005, and (re)labels the collection's crs accordingly.
// This is applied unconditionally to shpjs/zip output, since shpjs does
// not preserve or expose the shapefile's original .prj — its output is
// always WGS84 GeoJSON regardless of what CRS the source .shp was in.
const reprojectFeatureCollectionToBcAlbers = (
  featureCollection: ParsedFeatureCollection,
): ParsedFeatureCollection => ({
  ...featureCollection,
  crs: { type: 'name', properties: { name: 'EPSG:3005' } },
  features: (featureCollection.features ?? []).map((feature: any) => ({
    ...feature,
    geometry: feature?.geometry
      ? {
          ...feature.geometry,
          coordinates: reprojectCoordinatesToBcAlbers(
            feature.geometry.coordinates,
          ),
        }
      : feature.geometry,
  })),
});
// -------------------------------------------------------------------------

const normalizeParsedFeatureCollection = (featureCollection: any): any => {
  if (!isFeatureCollection(featureCollection)) {
    throw new Error(
      'Uploaded archive did not contain a valid shapefile layer.',
    );
  }

  return {
    type: 'FeatureCollection',
    // shpjs output has no crs of its own (it's always WGS84 lon/lat); the
    // actual EPSG:3005 label gets set later by
    // reprojectFeatureCollectionToBcAlbers once coordinates are converted.
    crs: featureCollection.crs,
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
      crs: featureCollections[0]?.crs,
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
      crs: featureCollections[0]?.crs,
      // Ensure all features have proper structure with geometry and properties
      features: featureCollections.flatMap((entry: ParsedFeatureCollection) =>
        (entry.features ?? []).map((feature: any) => ({
          type: 'Feature',
          properties: feature?.properties ?? {},
          geometry: feature?.geometry ?? feature,
        })),
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

export interface FeatureSectionId {
  featureIndex: number;
  sectionId: string | null;
}

export interface PreparedFeatureCollectionResult {
  featureCollection: any;
  fieldName: string;
  sourceFieldName: string | null;
}

const extractSectionIdSeedValue = (
  feature: any,
  fieldName: string | null,
  useMapLabelFallback = false,
): string => {
  if (!fieldName) {
    return '';
  }

  const rawValue = feature?.properties?.[fieldName];
  if (rawValue === null || rawValue === undefined) {
    return '';
  }

  let value = String(rawValue).trim();
  if (useMapLabelFallback) {
    value = value.split(/\s+/).pop() ?? '';
  }

  return value;
};

export interface SectionIdExtractionResult {
  fieldName: string | null;
  sectionIds: string[];
  featureSectionIds: FeatureSectionId[];
  issues: ValidationIssue[];
}

export const prepareFeatureCollectionForSectionEditing = (
  featureCollection: any,
): PreparedFeatureCollectionResult => {
  const features: any[] = featureCollection?.features ?? [];
  const detectedSectionIdFieldName = pickSectionIdFieldName(features);
  const mapLabelFieldName = detectedSectionIdFieldName
    ? null
    : pickMapLabelFieldName(features);
  const targetFieldName =
    detectedSectionIdFieldName ?? DEFAULT_SECTION_ID_FIELD_NAME;

  return {
    featureCollection: {
      ...featureCollection,
      features: features.map((feature: any) => ({
        ...feature,
        properties: {
          ...(feature?.properties ?? {}),
          [targetFieldName]: extractSectionIdSeedValue(
            feature,
            detectedSectionIdFieldName ?? mapLabelFieldName,
            Boolean(mapLabelFieldName && !detectedSectionIdFieldName),
          ),
        },
      })),
    },
    fieldName: targetFieldName,
    sourceFieldName: detectedSectionIdFieldName ?? mapLabelFieldName,
  };
};

export const updateFeatureSectionId = (
  featureCollection: any,
  featureIndex: number,
  fieldName: string,
  nextSectionId: string,
): any => ({
  ...featureCollection,
  features: (featureCollection?.features ?? []).map(
    (feature: any, index: number) =>
      index === featureIndex
        ? {
            ...feature,
            properties: {
              ...(feature?.properties ?? {}),
              [fieldName]: nextSectionId,
            },
          }
        : feature,
  ),
});

export const extractSectionIdDetails = (
  featureCollection: any,
): SectionIdExtractionResult => {
  const features: any[] = featureCollection?.features ?? [];
  const issues: ValidationIssue[] = [];

  if (!features.length) {
    return { fieldName: null, sectionIds: [], featureSectionIds: [], issues };
  }

  let fieldName = pickSectionIdFieldName(features);
  let usedMapLabelFallback = false;

  if (!fieldName) {
    fieldName = pickMapLabelFieldName(features);
    usedMapLabelFallback = fieldName !== null;
  }

  if (!fieldName) {
    const availableFields = Array.from(
      new Set(
        features.flatMap((feature) => Object.keys(feature?.properties ?? {})),
      ),
    ).sort((a, b) => a.localeCompare(b));

    issues.push({
      type: 'ATTRIBUTE',
      severity: 'WARNING',
      message: availableFields.length
        ? `No Section ID field was found among the uploaded attributes (${availableFields.join(', ')}). Expected a field such as SECTION_ID.`
        : 'No Section ID field was found: the uploaded file has no attributes at all.',
    });

    return { fieldName: null, sectionIds: [], featureSectionIds: [], issues };
  }

  const extractRawValue = (feature: any): string | null => {
    const rawValue = feature?.properties?.[fieldName as string];
    if (rawValue === null || rawValue === undefined) return null;

    let value = String(rawValue).trim();
    if (usedMapLabelFallback) {
      // MAP_LABEL is typically "<forest file> <section id>"; take the
      // trailing token as the section id.
      value = value.split(/\s+/).pop() ?? '';
    }

    return value || null;
  };

  const featureSectionIds: FeatureSectionId[] = features.map(
    (feature, index) => ({
      featureIndex: index + 1,
      sectionId: extractRawValue(feature),
    }),
  );

  const missingFeatures = featureSectionIds.filter(
    (entry) => entry.sectionId === null,
  );
  if (missingFeatures.length > 0) {
    const missingFeatureLabel = missingFeatures
      .map((entry) => `#${entry.featureIndex}`)
      .join(', ');
    issues.push({
      type: 'SECTION_ID',
      severity: 'ERROR',
      message: `${missingFeatures.length} feature(s) are missing a ${fieldName} value: ${missingFeatureLabel}.`,
      code: 'SECTION_ID_MISSING',
    });
  }

  const featureIndicesBySectionId = new Map<string, number[]>();
  featureSectionIds.forEach((entry) => {
    if (entry.sectionId === null) return;
    const existing = featureIndicesBySectionId.get(entry.sectionId) ?? [];
    existing.push(entry.featureIndex);
    featureIndicesBySectionId.set(entry.sectionId, existing);
  });

  featureIndicesBySectionId.forEach((featureIndices, sectionId) => {
    if (featureIndices.length > 1) {
      issues.push({
        type: 'SECTION_ID',
        severity: 'ERROR',
        message: `Section ID "${sectionId}" is used by ${featureIndices.length} features (${featureIndices
          .map((i) => `#${i}`)
          .join(', ')}); each feature should have a unique ${fieldName}.`,
        code: 'SECTION_ID_DUPLICATE',
      });
    }
  });

  const sectionIds = Array.from(featureIndicesBySectionId.keys()).sort(
    (first, second) =>
      first.localeCompare(second, undefined, { numeric: true }),
  );

  return { fieldName, sectionIds, featureSectionIds, issues };
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

    // Inspect the archive's entry names *before* handing it to shpjs.
    // shpjs pairs a .shp with its .dbf/.shx/.prj by exact basename match;
    // if they don't match (e.g. a browser appended " (1)" to a duplicate
    // download before it was zipped), shpjs silently returns geometry with
    // no attributes instead of raising an error. Checking the raw zip
    // listing here lets us give a specific, actionable message instead.
    const zipArchive = await JSZip.loadAsync(zipArrayBuffer);
    const zipEntryPaths = Object.values(zipArchive.files)
      .filter((entry) => !entry.dir && !entry.name.includes('__MACOSX'))
      .map((entry) => entry.name);

    const getEntryBaseName = (entryPath: string) =>
      entryPath.split('/').pop() ?? entryPath;
    const getEntryStem = (entryPath: string) =>
      getNormalizedStem(getEntryBaseName(entryPath));
    const getEntryExtension = (entryPath: string) =>
      getNormalizedExtension(new File([], getEntryBaseName(entryPath)));

    const shpEntryPaths = zipEntryPaths.filter(
      (entryPath) => getEntryExtension(entryPath) === 'shp',
    );
    const dbfEntryPaths = zipEntryPaths.filter(
      (entryPath) => getEntryExtension(entryPath) === 'dbf',
    );

    if (shpEntryPaths.length > 0 && dbfEntryPaths.length === 0) {
      throw new Error(
        `The .zip contains "${getEntryBaseName(shpEntryPaths[0])}" but no .dbf file, so no attributes (including Section ID) can be read. Add the matching .dbf to the .zip and re-upload.`,
      );
    }

    if (shpEntryPaths.length > 0 && dbfEntryPaths.length > 0) {
      const dbfStems = new Set(dbfEntryPaths.map(getEntryStem));
      const hasMatchingPair = shpEntryPaths.some((shpEntryPath) =>
        dbfStems.has(getEntryStem(shpEntryPath)),
      );

      if (!hasMatchingPair) {
        throw new Error(
          `The .zip contains "${getEntryBaseName(shpEntryPaths[0])}" and "${getEntryBaseName(
            dbfEntryPaths[0],
          )}" but their filenames don't match, so attributes couldn't be linked to geometry. Rename them to share the same base name (e.g. both "trail.shp" and "trail.dbf"), re-zip, and re-upload.`,
        );
      }
    }

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

    // Validate that all features have valid geometry before returning
    const featuresMissingGeometry = normalizedFeatureCollection.features.filter(
      (feature: any) => !feature.geometry,
    );
    if (featuresMissingGeometry.length > 0) {
      console.error('[ZIP PARSE]', {
        message: 'Some features missing geometry',
        totalFeatures: normalizedFeatureCollection.features.length,
        featuresWithoutGeometry: featuresMissingGeometry.length,
        sampleFeatures: normalizedFeatureCollection.features.slice(0, 2),
      });
      throw new Error(
        `Zip parsing resulted in ${featuresMissingGeometry.length} features without geometry. The .shp/.dbf files may be corrupted.`,
      );
    }

    // --- THE FIX -----------------------------------------------------
    // shpjs (used above via `shp(zipArrayBuffer)`) always returns
    // coordinates reprojected to EPSG:4326 (WGS84 lon/lat), regardless of
    // the source shapefile's actual CRS. Meanwhile the direct .shp/.dbf
    // path further down (shapefile.open) returns raw, unprojected
    // coordinates straight from the file — EPSG:3005 (BC Albers) metres
    // for this app's data.
    //
    // Previously, normalizeZipSpatialData just *labelled* the zip output
    // as EPSG:3005 without converting it, so zip uploads carried WGS84
    // degree values mislabeled as Albers metres. SpatialSubmissionMap.tsx
    // treats all incoming coordinates as EPSG:3005, so those mislabeled
    // features were plotted in the wrong place (effectively off the
    // visible extent), which is why the map appeared blank only for zip
    // uploads.
    //
    // Reprojecting here converts the zip path's coordinates back to
    // EPSG:3005, so both upload paths agree, and everything downstream
    // (map rendering, extent checks, geometry validation) can keep
    // assuming EPSG:3005 without caring which upload path was used.
    const reprojectedFeatureCollection = reprojectFeatureCollectionToBcAlbers(
      normalizedFeatureCollection,
    );

    // Debug: log the structure of the first feature
    if (reprojectedFeatureCollection.features.length > 0) {
      console.info('[ZIP PARSE SUCCESS]', {
        totalFeatures: reprojectedFeatureCollection.features.length,
        firstFeature: reprojectedFeatureCollection.features[0],
        crs: reprojectedFeatureCollection.crs,
      });
    }

    return reprojectedFeatureCollection;
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
