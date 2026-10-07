import * as shapefile from 'shapefile';
import shp from 'shpjs';
import JSZip from 'jszip';
import proj4 from 'proj4';
import {
  BC_EXTENT_3005,
  REQUIRED_SHP_FILE_MESSAGE,
  SHAPEFILE_ALLOWED_EXTENSIONS,
  SHAPEFILE_BASENAME_MISMATCH_MESSAGE,
  SHAPEFILE_MAX_FILE_SIZE_BYTES,
} from './spatialSubmission.constants';

export {
  ACCURACY_CODES,
  ACTION_CODES,
  CAPTURE_METHODS,
  DATA_SOURCES,
  DEFAULT_SECTION_ID_FIELD_NAME,
} from './spatialSubmission.constants';

export type {
  FeatureSectionId,
  PreparedFeatureCollectionResult,
  SectionIdExtractionResult,
  SpatialFeature,
  SpatialFeatureCollection,
  SubmissionMetadata,
  ValidationIssue,
  ValidationSeverity,
  ValidationType,
} from './spatialSubmission.types';

export {
  extractSectionIdDetails,
  prepareFeatureCollectionForSectionEditing,
  updateFeatureSectionId,
} from './spatialSubmission.sectionIds';

export { validateGeometry } from './spatialSubmission.geometryValidation';

proj4.defs(
  'EPSG:3005',
  '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
);
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

type ParsedFeatureCollection = {
  type: 'FeatureCollection';
  crs?: unknown;
  bbox?: unknown;
  features: Array<Record<string, unknown>>;
};

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

const isFeatureCollection = (value: any): value is ParsedFeatureCollection =>
  value?.type === 'FeatureCollection' && Array.isArray(value?.features);

const reprojectCoordinatesToBcAlbers = (coordinates: any): any => {
  if (
    typeof coordinates?.[0] === 'number' &&
    typeof coordinates?.[1] === 'number'
  ) {
    const [x, y] = proj4('EPSG:4326', 'EPSG:3005', [
      coordinates[0],
      coordinates[1],
    ]);
    return coordinates.length > 2 ? [x, y, ...coordinates.slice(2)] : [x, y];
  }

  return (coordinates ?? []).map(reprojectCoordinatesToBcAlbers);
};

const reprojectFeatureCollectionToBcAlbers = (
  featureCollection: ParsedFeatureCollection,
): ParsedFeatureCollection => ({
  ...featureCollection,
  crs: { type: 'name', properties: { name: 'EPSG:3005' } },
  bbox: undefined,
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

const looksGeographic = (
  featureCollection: ParsedFeatureCollection,
): boolean => {
  let isGeographic = true;

  const check = (coordinates: any) => {
    if (!isGeographic) return;
    if (
      typeof coordinates?.[0] === 'number' &&
      typeof coordinates?.[1] === 'number'
    ) {
      if (Math.abs(coordinates[0]) > 180 || Math.abs(coordinates[1]) > 90) {
        isGeographic = false;
      }
      return;
    }
    (coordinates ?? []).forEach(check);
  };

  (featureCollection.features ?? []).forEach((feature: any) =>
    check(feature?.geometry?.coordinates),
  );

  return isGeographic;
};

const normalizeParsedFeatureCollection = (featureCollection: any): any => {
  if (!isFeatureCollection(featureCollection)) {
    throw new Error(
      'Uploaded archive did not contain a valid shapefile layer.',
    );
  }

  return {
    type: 'FeatureCollection',
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

const validateZipSelection = (zipFiles: File[], selectedFiles: File[]) => {
  if (zipFiles.length > 1) {
    throw new Error('Please upload only one .zip file at a time.');
  }

  if (zipFiles.length === 1 && selectedFiles.length > 1) {
    throw new Error(
      'Upload either one .zip file or .shp/.dbf files, not both.',
    );
  }
};

const validateShapefileSelections = (shpFiles: File[], dbfFiles: File[]) => {
  if (shpFiles.length === 0) {
    throw new Error(REQUIRED_SHP_FILE_MESSAGE);
  }
  if (shpFiles.length > 1) {
    throw new Error('Please upload only one .shp file at a time.');
  }
  if (dbfFiles.length > 1) {
    throw new Error('Please upload only one .dbf file at a time.');
  }
};

const readZipSpatialFile = async (
  zipFile: File,
): Promise<ParsedFeatureCollection> => {
  const zipArrayBuffer = await zipFile.arrayBuffer();
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
  const shpEntryStems = Array.from(new Set(shpEntryPaths.map(getEntryStem)));

  if (shpEntryStems.length > 1) {
    throw new Error(
      'The uploaded .zip contains multiple shapefile layers. Please zip only one shapefile dataset (.shp/.shx/.dbf/.prj/.cpg) and re-upload.',
    );
  }

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

  return looksGeographic(normalizedFeatureCollection)
    ? reprojectFeatureCollectionToBcAlbers(normalizedFeatureCollection)
    : {
        ...normalizedFeatureCollection,
        crs: { type: 'name', properties: { name: 'EPSG:3005' } },
      };
};

const readShapefileSpatialFile = async (
  file: File,
  dbfFile?: File,
): Promise<ParsedFeatureCollection> => {
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
  if (headerView.getInt32(0, false) !== 9994) {
    throw new Error('Invalid shapefile signature (magic number mismatch).');
  }

  const headerBoundingBox = {
    minX: headerView.getFloat64(36, true),
    minY: headerView.getFloat64(44, true),
    maxX: headerView.getFloat64(52, true),
    maxY: headerView.getFloat64(60, true),
  };

  if (!Object.values(headerBoundingBox).every((v) => Number.isFinite(v))) {
    throw new Error('Invalid shapefile header bbox: contains NaN or Infinity.');
  }

  if (
    headerBoundingBox.minX < BC_EXTENT_3005.minX ||
    headerBoundingBox.maxX > BC_EXTENT_3005.maxX ||
    headerBoundingBox.minY < BC_EXTENT_3005.minY ||
    headerBoundingBox.maxY > BC_EXTENT_3005.maxY
  ) {
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
  validateZipSelection(zipFiles, selectedFiles);

  if (zipFiles.length === 1) {
    return readZipSpatialFile(zipFiles[0]);
  }

  validateShapefileSelections(shpFiles, dbfFiles);
  return readShapefileSpatialFile(shpFiles[0], dbfFiles[0]);
}
